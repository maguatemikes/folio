"use client";

import { useEffect, useRef, useState } from "react";
import { whenNear } from "@/lib/near-viewport";

/**
 * Screens of a site drawn as WebGL textures, cross-fading from one to the next,
 * with the same fluid feel as the smoke cursor: a slow drift, a soft swirl
 * around the pointer, a bend from sideways travel and an RGB split while moving.
 * Falls back to a plain <img> without WebGL or with reduced motion.
 */
type Props = {
  /** Screenshots in order; `index` picks the visible one */
  srcs: string[];
  index: number;
  alt: string;
};

const vertexSrc = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main () {
    // y flipped so vUv.y = 0 is the top of both the quad and the texture
    vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentSrc = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uMix;      // 0..1 cross-fade between the two screens
  uniform vec2 uCover;     // scale that fits the whole screenshot into the frame
  uniform float uAspect;   // canvas width / height
  uniform vec2 uMouse;     // 0..1, y from the top
  uniform float uHover;    // 0..1 eased
  uniform float uVelocity; // sideways travel, roughly -1..1
  uniform float uTime;

  // Smooth value noise — the moving "surface" of the fluid
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main () {
    vec2 d = vec2(0.0);

    // Slow drift across the whole image
    float t = uTime * 0.16;
    float flowX = noise(vec2(vUv.x * 2.2 + t, vUv.y * 2.6 - t)) - 0.5;
    float flowY = noise(vec2(vUv.x * 2.6 - t, vUv.y * 2.2 + t * 1.3)) - 0.5;
    d += vec2(flowX, flowY) * 0.003;

    // Swirl around the pointer
    vec2 toMouse = vec2((vUv.x - uMouse.x) * uAspect, vUv.y - uMouse.y);
    float pull = smoothstep(0.5, 0.0, length(toMouse)) * uHover;
    vec2 dir = normalize(toMouse + 0.0001);
    d -= dir * pull * 0.012;
    d += vec2(-dir.y, dir.x) * pull * 0.007;
    d += vec2(flowX, flowY) * pull * 0.018;

    // The sheet bends as the card travels sideways
    d.y += sin(vUv.x * 3.14159) * uVelocity * 0.018;
    d.x += uVelocity * 0.006;

    // A ripple that runs across while screens change
    float sweep = smoothstep(0.0, 0.5, uMix) * smoothstep(1.0, 0.5, uMix);
    d.x += sin((vUv.y + uMix) * 9.0) * sweep * 0.012;

    // Fit the whole screenshot inside the frame (no cropping), then distort
    vec2 uv = (vUv - 0.5) * uCover + 0.5 + d;
    // Anything outside the image is page-white, not a stretched edge
    vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    float onImage = inside.x * inside.y;
    uv = clamp(uv, 0.001, 0.999);

    // Glitch: channels pull apart with movement and while switching
    float sep = abs(uVelocity) * 0.014 + pull * 0.006 + sweep * 0.01;
    vec2 off = vec2(sep, sep * 0.25);

    vec3 from = vec3(
      texture2D(uFrom, clamp(uv + off, 0.001, 0.999)).r,
      texture2D(uFrom, uv).g,
      texture2D(uFrom, clamp(uv - off, 0.001, 0.999)).b
    );
    vec3 to = vec3(
      texture2D(uTo, clamp(uv + off, 0.001, 0.999)).r,
      texture2D(uTo, uv).g,
      texture2D(uTo, clamp(uv - off, 0.001, 0.999)).b
    );

    vec3 color = mix(mix(from, to, uMix), vec3(1.0), 1.0 - onImage);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function ShaderImage({ srcs, index, alt }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const indexRef = useRef(index);
  indexRef.current = index;
  // Depend on the contents, not the array identity: a new array on every render
  // would tear down and rebuild the WebGL context, flashing black
  const srcsKey = srcs.join("|");
  const srcsRef = useRef(srcs);
  srcsRef.current = srcs;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFallback(true);
      return;
    }

    // The gallery sits far below the fold — do nothing until it is close
    return whenNear(host, () => {
      const canvas = document.createElement("canvas");
      canvas.className = "shader-image";
      const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
      if (!gl) {
        setFallback(true);
        return;
      }
      host.appendChild(canvas);

      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(shader));
        return shader;
      };
      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
      gl.bindAttribLocation(program, 0, "aPosition");
      gl.linkProgram(program);
      gl.useProgram(program);

      const u = {
        from: gl.getUniformLocation(program, "uFrom"),
        to: gl.getUniformLocation(program, "uTo"),
        mix: gl.getUniformLocation(program, "uMix"),
        cover: gl.getUniformLocation(program, "uCover"),
        aspect: gl.getUniformLocation(program, "uAspect"),
        mouse: gl.getUniformLocation(program, "uMouse"),
        hover: gl.getUniformLocation(program, "uHover"),
        velocity: gl.getUniformLocation(program, "uVelocity"),
        time: gl.getUniformLocation(program, "uTime"),
      };

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      // Every screen gets its own texture, uploaded once up front. Switching then
      // only rebinds them, so no decode or upload can stall a frame and flash black.
      gl.uniform1i(u.from, 0);
      gl.uniform1i(u.to, 1);

      const textures: (WebGLTexture | null)[] = [];
      let imageAspect = 1.6;
      let ready = false;

      const createTexture = (img: HTMLImageElement) => {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        return texture;
      };

      const bind = (texture: WebGLTexture | null, unit: number) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      };

      Promise.all(
        srcsRef.current.map((src) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = src;
          return img.decode().then(() => img).catch(() => img);
        })
      )
        .then((loaded) => {
          const usable = loaded.filter((img) => img.naturalWidth > 0);
          if (!usable.length) {
            setFallback(true);
            return;
          }
          imageAspect = usable[0].naturalWidth / usable[0].naturalHeight;
          loaded.forEach((img) => textures.push(img.naturalWidth ? createTexture(img) : textures[0] ?? null));
          ready = true;
        })
        .catch(() => setFallback(true));

      // ---- Animation ----------------------------------------------------------
      const pointer = { x: 0.5, y: 0.5 };
      let hover = 0;
      let hoverTarget = 0;
      let velocity = 0;
      let lastLeft: number | null = null;
      let visible = true;
      let shownIndex = 0; // texture unit 0
      let mix = 0;
      let raf = 0;
      let last = performance.now();
      const started = performance.now();

      const onEnter = () => (hoverTarget = 1);
      const onLeave = () => (hoverTarget = 0);
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width;
        pointer.y = (e.clientY - r.top) / r.height;
      };
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointermove", onMove);

      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
        rootMargin: "20% 0px",
      });
      io.observe(host);

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        if (!ready || !visible) return;

        const rect = host.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (w === 0 || h === 0) return;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }

        // Cross-fade toward the requested screen; both textures are already resident
        const wanted = Math.min(indexRef.current, textures.length - 1);
        if (wanted !== shownIndex) {
          mix = Math.min(mix + dt / 0.7, 1);
          if (mix === 1) {
            shownIndex = wanted;
            mix = 0;
          }
        } else if (mix !== 0) {
          mix = 0;
        }
        bind(textures[shownIndex], 0);
        bind(textures[wanted], 1);

        const targetVel = lastLeft === null ? 0 : (rect.left - lastLeft) / rect.width;
        lastLeft = rect.left;
        velocity += (Math.max(-1, Math.min(1, targetVel * 2.5)) - velocity) * 0.12;
        hover += (hoverTarget - hover) * 0.08;

        // Contain-fit: the full width of the site always stays visible
        const canvasAspect = rect.width / rect.height;
        const cover =
          canvasAspect > imageAspect
            ? [canvasAspect / imageAspect, 1] // frame wider than the shot
            : [1, imageAspect / canvasAspect];

        gl.uniform1f(u.mix, mix);
        gl.uniform2f(u.cover, cover[0], cover[1]);
        gl.uniform1f(u.aspect, canvasAspect);
        gl.uniform2f(u.mouse, pointer.x, pointer.y);
        gl.uniform1f(u.hover, hover);
        gl.uniform1f(u.velocity, velocity);
        gl.uniform1f(u.time, (now - started) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointermove", onMove);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcsKey]);

  return (
    <div ref={hostRef} className="shader-host">
      {fallback && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="shader-image shader-image--static" src={srcs[index]} alt={alt} />
      )}
    </div>
  );
}
