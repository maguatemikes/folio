"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis, onScroll } from "./SmoothScroll";

/**
 * Custom scrollbar: a hairline rail on the right with a thumb sized to the
 * viewport, a percentage readout, and drag-to-scroll. The native scrollbar is
 * hidden in CSS.
 */
export default function ScrollProgress() {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [thumb, setThumb] = useState(0.2);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0);
      setThumb(Math.max(window.innerHeight / document.documentElement.scrollHeight, 0.06));
    };
    update();
    const unsubscribe = onScroll(update);
    window.addEventListener("resize", update);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Drag anywhere on the rail to scrub through the page
  useEffect(() => {
    if (!dragging) return;
    const scrubTo = (clientY: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const r = rail.getBoundingClientRect();
      const fraction = Math.min(Math.max((clientY - r.top) / r.height, 0), 1);
      const target = fraction * (document.documentElement.scrollHeight - window.innerHeight);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { duration: 0.35 });
      else window.scrollTo({ top: target });
    };
    const onMove = (e: PointerEvent) => scrubTo(e.clientY);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  return (
    <div
      ref={railRef}
      className={`scrollbar${dragging ? " is-dragging" : ""}`}
      onPointerDown={(e) => {
        setDragging(true);
        const r = e.currentTarget.getBoundingClientRect();
        const fraction = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
        const target = fraction * (document.documentElement.scrollHeight - window.innerHeight);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(target, { duration: 0.35 });
        else window.scrollTo({ top: target });
      }}
      aria-hidden="true"
    >
      <div
        className="scrollbar__thumb"
        style={{
          height: `${thumb * 100}%`,
          transform: `translateY(${(progress * (1 - thumb) * 100) / Math.max(thumb, 0.0001)}%)`,
        }}
      >
        <span className="scrollbar__label mono">{String(Math.round(progress * 100)).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
