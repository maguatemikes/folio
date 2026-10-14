"use client";

import { useEffect, useRef } from "react";
import { createFluid } from "@/lib/fluid";
import { whenNear } from "@/lib/near-viewport";

/**
 * A fluid simulation contained in a box rather than the whole page — the same
 * engine as the smoke cursor, scoped to this panel and rendered as a grid of
 * square pixels. It breathes on its own with slow drifting splats, and follows
 * the pointer while you are over it.
 */
export default function FluidPanel({
  className = "",
  track = "self",
}: {
  className?: string;
  /** "parent" when the panel sits behind content and ignores pointer events */
  track?: "self" | "parent";
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return whenNear(host, () => {
      const canvas = document.createElement("canvas");
      canvas.className = "fluid__canvas";
      host.appendChild(canvas);

      const fluid = createFluid(canvas, {
        sizeTo: "element",
        dyeResolution: 512,
        densityDissipation: 0.9, // lingers far longer than the cursor trail
        velocityDissipation: 1.1,
        curl: 14, // more swirl, since nothing is stirring it most of the time
        splatRadius: 0.55,
        dprCap: 1.25,
        dotGrid: 9, // drawn as square pixels, like the marquee marks
        enableShading: false,
      });
      if (!fluid) {
        canvas.remove();
        return;
      }

      // Brand palette: mostly ember, occasionally a paler wisp
      const colors: [number, number, number][] = [
        [0.75, 0.22, 0.07],
        [0.9, 0.32, 0.12],
        [0.5, 0.14, 0.05],
        [0.62, 0.36, 0.28],
      ];
      const pick = () => colors[Math.floor(Math.random() * colors.length)];

      const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, inside: false };
      let visible = true;
      let idle = 0;
      let raf = 0;
      let last = performance.now();

      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = 1 - (e.clientY - r.top) / r.height;
        pointer.dx = x - pointer.x;
        pointer.dy = y - pointer.y;
        pointer.x = x;
        pointer.y = y;
        pointer.moved = true;
      };
      const onEnter = () => (pointer.inside = true);
      const onLeave = () => (pointer.inside = false);
      const target = (track === "parent" ? host.parentElement : host) ?? host;
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerenter", onEnter);
      target.addEventListener("pointerleave", onLeave);

      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
        rootMargin: "10% 0px",
      });
      io.observe(host);

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        if (!visible) return;

        if (pointer.moved) {
          pointer.moved = false;
          fluid.splat(pointer.x, pointer.y, pointer.dx * 2600, pointer.dy * 2600, pick());
        }

        // Ambient: a slow plume rises from the floor of the panel
        idle += dt;
        if (idle > (pointer.inside ? 1.1 : 0.55)) {
          idle = 0;
          const x = 0.2 + Math.random() * 0.6;
          fluid.splat(x, 0.12, (Math.random() - 0.5) * 140, 140 + Math.random() * 180, pick());
        }

        fluid.frame(dt);
      };
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerenter", onEnter);
        target.removeEventListener("pointerleave", onLeave);
        fluid.destroy();
        canvas.remove();
      };
    });
  }, [track]);

  return <div ref={hostRef} className={`fluid ${className}`} aria-hidden="true" />;
}
