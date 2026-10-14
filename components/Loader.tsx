"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { marquee, site } from "@/lib/data";
import { surnamePaths, surnameViewBox } from "@/lib/surname-paths";

type Phase = "loading" | "filled" | "dock" | "done";

/**
 * Intro sequence built from the site's own elements: the footer signature draws
 * as the counter climbs → a beat on 100 → the orange floods, MAGUATE shrinks into
 * the header logo and the curtain wipes up, overlapping as one exit.
 */
/**
 * Module scope lives as long as the document: it resets on a real page load or
 * refresh (intro plays) but survives client-side navigation (intro skipped, so
 * coming back from /start does not replay it).
 */
let playedThisDocument = false;

/** Layout effect on the client, plain effect during SSR (where it never runs) */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Loader() {
  // Read on the client only: reading storage during render would make the
  // server and client trees disagree (hydration error)
  const [skip, setSkip] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [count, setCount] = useState(0);
  const [word, setWord] = useState(0);
  const pathsRef = useRef<(SVGPathElement | null)[]>([]);
  const markRef = useRef<SVGSVGElement>(null);

  /** Land the mark exactly on the word "Maguate" inside the header logo */
  const dockToLogo = () => {
    const mark = markRef.current;
    const target =
      document.querySelector<HTMLElement>(".nav__surname") ??
      document.querySelector<HTMLElement>(".nav__logo");
    if (!mark || !target) return;
    const m = mark.getBoundingClientRect();
    const l = target.getBoundingClientRect();
    if (!m.width || !l.width) return;
    // match the word's width, then sit on its baseline box
    const scale = l.width / m.width;
    const dx = l.left - m.left;
    const dy = l.top + l.height / 2 - (m.top + (m.height * scale) / 2);
    mark.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  };

  // Before the first paint, so returning from another route never flashes it
  useIsomorphicLayoutEffect(() => {
    if (!playedThisDocument) return;
    setSkip(true);
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  }, []);

  useEffect(() => {
    if (skip) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // One timeline, tuned by feel:
    // 0.00–1.40s  the letters draw as the counter climbs to 100
    // 1.40–1.65s  a beat on 100, so the number registers
    // 1.65s       orange floods, MAGUATE shrinks to the logo (0.95s each)
    // 1.90s       the curtain starts lifting under them (0.90s)
    // ≈2.80s      everything lands together
    const DRAW = reduced ? 300 : 1400;
    const HOLD = reduced ? 40 : 250;
    const CURTAIN_LAG = reduced ? 30 : 250;

    const letters = surnamePaths.length;
    const start = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DRAW, 1);
      // easeInOutCubic: slow start, quick middle, soft landing on 100
      const p = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setCount(Math.round(p * 100));
      setWord(Math.min(marquee.length - 1, Math.floor(p * marquee.length)));

      // Each letter draws within its own overlapping window of the progress
      pathsRef.current.forEach((path, i) => {
        if (!path) return;
        const from = (i / letters) * 0.65;
        const local = Math.min(Math.max((p - from) / 0.35, 0), 1);
        path.style.strokeDashoffset = String(1 - local);
      });

      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      setPhase("filled");
      timers.push(
        setTimeout(() => {
          setPhase("dock");
          dockToLogo();
        }, HOLD)
      );
      timers.push(
        setTimeout(() => {
          setPhase("done");
          playedThisDocument = true;
          document.body.classList.remove("is-loading");
          document.body.classList.add("is-ready");
        }, HOLD + CURTAIN_LAG)
      );
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [skip]);

  if (skip) return null;

  return (
    <div className={`loader is-${phase}`} aria-hidden="true">
      <div className="loader__pill" />

      <div className="loader__top mono">
        <span>{site.name}</span>
        <span>Portfolio ©2026</span>
      </div>

      <svg ref={markRef} className="loader__mark" viewBox={surnameViewBox}>
        {surnamePaths.map((d, i) => (
          <path
            key={i}
            ref={(el) => {
              pathsRef.current[i] = el;
            }}
            d={d}
            pathLength={1}
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </svg>

      <div className="loader__bottom mono">
        <span className="loader__word">
          <span key={word}>{marquee[word]}</span>
        </span>
        <span className="loader__bar">
          <span style={{ transform: `scaleX(${count / 100})` }} />
        </span>
        <span className="loader__count tabular">{String(count).padStart(3, "0")}</span>
      </div>
    </div>
  );
}
