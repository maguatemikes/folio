"use client";

import { useEffect, useRef } from "react";
import { createFluid, hsvToRgb } from "@/lib/fluid";

/**
 * Smoke trail that follows the pointer, drawn by the shared fluid engine on a
 * transparent full-page canvas behind the content.
 */
const config = {
  followMouse: true,
  autoColors: true, // colors cycle automatically
  intensity: 1,
  splatForce: 6000,
  colorUpdateSpeed: 10,
};

export default function SmokeyCursor() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;

    // A fresh canvas per mount: a WebGL context can't be reused once released
    const canvas = document.createElement("canvas");
    canvas.className = "smoke";
    host.appendChild(canvas);

    const fluid = createFluid(canvas, {
      sizeTo: "window",
      dyeResolution: 1440,
      densityDissipation: 3.5,
      velocityDissipation: 2,
      curl: 3,
      splatRadius: 0.2,
    });
    if (!fluid) {
      canvas.remove();
      return;
    }

    const pointer = { x: -100, y: -100, dx: 0, dy: 0, moved: false, ready: false };
    let lastInput = performance.now();
    let running = false;
    let raf = 0;
    let last = performance.now();

    const generateColor = (): [number, number, number] => {
      const [r, g, b] = hsvToRgb(Math.random(), 1, 1);
      const k = 0.15 * config.intensity;
      return [r * k, g * k, b * k];
    };
    let color = generateColor();
    let colorTimer = 0;

    const onMove = (e: MouseEvent) => {
      if (!config.followMouse) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (!pointer.ready) {
        pointer.x = x;
        pointer.y = y;
        pointer.ready = true;
      }
      const aspect = canvas.width / canvas.height;
      pointer.dx = (x - pointer.x) * (aspect < 1 ? aspect : 1);
      pointer.dy = (y - pointer.y) / (aspect > 1 ? aspect : 1);
      pointer.x = x;
      pointer.y = y;
      pointer.moved = pointer.dx !== 0 || pointer.dy !== 0;
      lastInput = performance.now();
      start();
    };

    const onDown = () => {
      if (!pointer.ready) return;
      const angle = Math.random() * Math.PI * 2;
      const [r, g, b] = generateColor();
      fluid.splat(pointer.x, pointer.y, Math.cos(angle) * 900, Math.sin(angle) * 900, [
        r * 10,
        g * 10,
        b * 10,
      ]);
      lastInput = performance.now();
      start();
    };

    const frame = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1 / 60);
      last = now;

      if (config.autoColors) {
        colorTimer += dt * config.colorUpdateSpeed;
        if (colorTimer >= 1) {
          colorTimer %= 1;
          color = generateColor();
        }
      }
      if (pointer.moved) {
        pointer.moved = false;
        fluid.splat(pointer.x, pointer.y, pointer.dx * config.splatForce, pointer.dy * config.splatForce, color);
      }
      fluid.frame(dt);

      // Sleep once the smoke has had time to fully dissipate
      if (now - lastInput > 4000) {
        running = false;
        canvas.classList.remove("is-active");
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    function start() {
      if (running) return;
      running = true;
      canvas.classList.add("is-active");
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      fluid.destroy();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" />;
}
