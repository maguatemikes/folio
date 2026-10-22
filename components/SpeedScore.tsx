"use client";

import { useEffect, useRef } from "react";

const CYCLE = 7000; // matches the card's CSS animations
const FROM = 48;
const TO = 96;
const CLIMB = 0.45; // score has landed by here, as in @keyframes spd-arc
const HOLD = 0.88; // ...and starts falling back after here

const POOR = "#ff4d1a";
const GOOD = "#3ddc84";

/** Expo-out, same shape as --ease-out, so the number settles like the dial */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
};

/**
 * The Lighthouse score, counted in JS.
 *
 * This was a CSS counter driven by an animated `@property`. The property
 * interpolates correctly, but Chromium never invalidates the generated content
 * that reads it, so the digits painted once and froze at 48 while the dial
 * carried on. Driving the text directly is the only reliable way.
 *
 * Synced to the sibling arc's own animation clock rather than its own timer, so
 * the number and the dial can never drift apart.
 */
export default function SpeedScore() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(TO);
      el.style.color = GOOD;
      return;
    }

    const arc = el.closest(".spd")?.querySelector<SVGCircleElement>(".spd__arc");
    let raf = 0;
    let visible = true;
    let shown = -1;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      // Prefer the dial's own clock; fall back to wall time if it has none
      const anim = arc?.getAnimations?.()[0];
      const ms =
        typeof anim?.currentTime === "number" ? anim.currentTime : performance.now();
      const t = (ms % CYCLE) / CYCLE;

      let progress: number;
      if (t < CLIMB) progress = easeOut(t / CLIMB);
      else if (t < HOLD) progress = 1;
      else progress = 1 - (t - HOLD) / (1 - HOLD);

      const value = Math.round(FROM + (TO - FROM) * progress);
      if (value !== shown) {
        shown = value;
        el.textContent = String(value);
        // Colour trails the number slightly, so it reads as "passing" late
        el.style.color = mix(POOR, GOOD, Math.max(0, progress * 1.6 - 0.6));
      }
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "10% 0px",
    });
    io.observe(el);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <b ref={ref} aria-hidden="true">
      {FROM}
    </b>
  );
}
