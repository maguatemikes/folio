/**
 * WebGL2 fluid simulation (advection, vorticity confinement, pressure
 * projection) — the engine behind both the page-wide smoke cursor and the
 * contained fluid panels. Based on the technique from Jos Stam's "Stable Fluids".
 */

export type FluidOptions = {
  simulationResolution: number;
  dyeResolution: number;
  densityDissipation: number;
  velocityDissipation: number;
  pressure: number;
  pressureIterations: number;
  curl: number;
  splatRadius: number;
  enableShading: boolean;
  transparent: boolean;
  backgroundColor: { r: number; g: number; b: number };
  /** window = full viewport canvas, element = match the canvas box */
  sizeTo: "window" | "element";
  dprCap: number;
  /** >0 renders the dye as a grid of square dots this many device px wide */
  dotGrid: number;
};

export const defaultFluidOptions: FluidOptions = {
  simulationResolution: 128,
  dyeResolution: 1024,
  densityDissipation: 3.5,
  velocityDissipation: 2,
  pressure: 0.1,
  pressureIterations: 20,
  curl: 3,
  splatRadius: 0.2,
  enableShading: true,
  transparent: true,
  backgroundColor: { r: 0, g: 0, b: 0 },
  sizeTo: "window",
  dprCap: 1.5,
  dotGrid: 0,
};

export type Fluid = {
  /** x, y in 0..1 with y pointing up; dx, dy are velocities */
  splat: (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => void;
  /** advance and draw one frame */
  frame: (dt: number) => void;
  destroy: () => void;
};

const baseVertex = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv, vL, vR, vT, vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const shaders = {
  clear: `
    precision mediump float;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
  `,
  splat: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
    }
  `,
  advection: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
    }
  `,
  divergence: `
    precision mediump float;
    varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }
  `,
  curl: `
    precision mediump float;
    varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }
  `,
  vorticity: `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
      velocity = clamp(velocity, -1000.0, 1000.0);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,
  pressure: `
    precision mediump float;
    varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
    }
  `,
  gradientSubtract: `
    precision mediump float;
    varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,
  // Same dye, drawn as a grid of square dots — the site's pixel module
  displayDots: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uCell;   // cell size in uv units
    void main () {
      vec2 cell = floor(vUv / uCell);
      vec2 centre = (cell + 0.5) * uCell;
      vec3 c = texture2D(uTexture, centre).rgb;
      float d = max(c.r, max(c.g, c.b));

      // denser dye fills more of its cell, so the grid reads as a gradient
      vec2 local = fract(vUv / uCell) - 0.5;
      float square = max(abs(local.x), abs(local.y));
      float halfSize = clamp(d * 0.55, 0.0, 0.3);
      float mask = 1.0 - smoothstep(halfSize - 0.06, halfSize, square);

      // premultiplied: colour must never exceed alpha, or faint dye washes
      // the layer underneath out to white
      vec3 tint = c / max(d, 0.0001);
      float a = clamp(d, 0.0, 1.0) * mask;
      gl_FragColor = vec4(tint * a, a);
    }
  `,
  // Premultiplied output; optional lighting from the dye gradient
  display: `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uTexture;
    uniform vec2 texelSize;
    uniform float shading;
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      if (shading > 0.5) {
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        float diffuse = clamp(dot(n, vec3(0.0, 0.0, 1.0)) + 0.7, 0.7, 1.0);
        c *= diffuse;
      }
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }
  `,
};


type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelX: number;
  texelY: number;
  attach: (unit: number) => number;
};
type DoubleFBO = {
  width: number;
  height: number;
  texelX: number;
  texelY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

export function createFluid(
  canvas: HTMLCanvasElement,
  options: Partial<FluidOptions> = {}
): Fluid | null {
  const config = { ...defaultFluidOptions, ...options };

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });
  if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(shader));
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, baseVertex);

  const createProgram = (fragment: string) => {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i)!.name;
      uniforms[name] = gl.getUniformLocation(program, name)!;
    }
    return { program, uniforms, bind: () => gl.useProgram(program) };
  };

  const programs = {
    clear: createProgram(shaders.clear),
    splat: createProgram(shaders.splat),
    advection: createProgram(shaders.advection),
    divergence: createProgram(shaders.divergence),
    curl: createProgram(shaders.curl),
    vorticity: createProgram(shaders.vorticity),
    pressure: createProgram(shaders.pressure),
    gradientSubtract: createProgram(shaders.gradientSubtract),
    display: createProgram(shaders.display),
    displayDots: createProgram(shaders.displayDots),
  };

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const blit = (target: FBO | null) => {
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  const createFBO = (w: number, h: number, internal: number, format: number): FBO => {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelX: 1 / w,
      texelY: 1 / h,
      attach(unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return unit;
      },
    };
  };

  const createDoubleFBO = (w: number, h: number, internal: number, format: number): DoubleFBO => {
    let a = createFBO(w, h, internal, format);
    let b = createFBO(w, h, internal, format);
    return {
      width: w,
      height: h,
      texelX: 1 / w,
      texelY: 1 / h,
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap() {
        [a, b] = [b, a];
      },
    };
  };

  const resolution = (res: number) => {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(res);
    const max = Math.round(res * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
  };

  let dye: DoubleFBO, velocity: DoubleFBO, divergence: FBO, curl: FBO, pressure: DoubleFBO;
  const initFramebuffers = () => {
    const sim = resolution(config.simulationResolution);
    const dyeRes = resolution(config.dyeResolution);
    dye = createDoubleFBO(dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA);
    velocity = createDoubleFBO(sim.w, sim.h, gl.RG16F, gl.RG);
    divergence = createFBO(sim.w, sim.h, gl.R16F, gl.RED);
    curl = createFBO(sim.w, sim.h, gl.R16F, gl.RED);
    pressure = createDoubleFBO(sim.w, sim.h, gl.R16F, gl.RED);
  };

  const resizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, config.dprCap);
    const box =
      config.sizeTo === "window"
        ? { w: window.innerWidth, h: window.innerHeight }
        : { w: canvas.clientWidth, h: canvas.clientHeight };
    const w = Math.max(1, Math.floor(box.w * dpr));
    const h = Math.max(1, Math.floor(box.h * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      return true;
    }
    return false;
  };

  resizeCanvas();
  initFramebuffers();

  const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => {
    const aspect = canvas.width / canvas.height;
    let radius = config.splatRadius / 100;
    if (aspect > 1) radius *= aspect;

    programs.splat.bind();
    gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(programs.splat.uniforms.aspectRatio, aspect);
    gl.uniform2f(programs.splat.uniforms.point, x, y);
    gl.uniform3f(programs.splat.uniforms.color, dx, dy, 0);
    gl.uniform1f(programs.splat.uniforms.radius, radius);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(programs.splat.uniforms.color, ...color);
    blit(dye.write);
    dye.swap();
  };

  const step = (dt: number) => {
    gl.disable(gl.BLEND);

    programs.curl.bind();
    gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    programs.vorticity.bind();
    gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(programs.vorticity.uniforms.curl, config.curl);
    gl.uniform1f(programs.vorticity.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    programs.divergence.bind();
    gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    programs.clear.bind();
    gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(programs.clear.uniforms.value, config.pressure);
    blit(pressure.write);
    pressure.swap();

    programs.pressure.bind();
    gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.pressureIterations; i++) {
      gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    programs.gradientSubtract.bind();
    gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    programs.advection.bind();
    gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelX, velocity.texelY);
    const velocityId = velocity.read.attach(0);
    gl.uniform1i(programs.advection.uniforms.uVelocity, velocityId);
    gl.uniform1i(programs.advection.uniforms.uSource, velocityId);
    gl.uniform1f(programs.advection.uniforms.dt, dt);
    gl.uniform1f(programs.advection.uniforms.dissipation, config.velocityDissipation);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(programs.advection.uniforms.dissipation, config.densityDissipation);
    blit(dye.write);
    dye.swap();
  };

  const render = () => {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (config.transparent) {
      gl.clearColor(0, 0, 0, 0);
    } else {
      const { r, g, b } = config.backgroundColor;
      gl.clearColor(r, g, b, 1);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (config.dotGrid > 0) {
      programs.displayDots.bind();
      gl.uniform2f(
        programs.displayDots.uniforms.uCell,
        config.dotGrid / gl.drawingBufferWidth,
        config.dotGrid / gl.drawingBufferHeight
      );
      gl.uniform1i(programs.displayDots.uniforms.uTexture, dye.read.attach(0));
      blit(null);
      return;
    }

    programs.display.bind();
    gl.uniform2f(programs.display.uniforms.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
    gl.uniform1f(programs.display.uniforms.shading, config.enableShading ? 1 : 0);
    gl.uniform1i(programs.display.uniforms.uTexture, dye.read.attach(0));
    blit(null);
  };

  return {
    splat,
    frame(dt) {
      if (resizeCanvas()) initFramebuffers();
      step(dt);
      render();
    },
    destroy() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/** HSV in 0..1 to RGB — handy for cycling splat colors */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    default:
      return [v, p, q];
  }
}
