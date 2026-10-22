"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const COLS = 10;
const ROWS = 6;
const CELLS = COLS * ROWS;

/** Seconds for one block, and the gap between blocks in the random order */
const TILE = 0.26;
/** How much later the centre of the spiral is than its outer edge */
const SPIRAL_IN = 0.2;
/** How far each arm sweeps around in that time */
const SPIRAL_ARC = 0.12;
/** Longest delay any block can carry — used for the timing guards */
const SWEEP = SPIRAL_IN + SPIRAL_ARC;
/** The grid reads as covered before the last block settles — route here */
const COVERED_AT = 0.5;

export const PT_EVENT = "pt:navigate";

type Phase = "idle" | "cover" | "clear";

/**
 * Page transition: accent squares scale up from nothing along two spiral arms
 * that wind in from the top-left and bottom-right and meet in the middle; the
 * route changes behind them, then they unwind back out from the centre.
 *
 * One layer only. A second, darker layer behind read fine when the blocks slid
 * edge to edge, but a centred scale leaves gaps until each square is full, so
 * the dark layer showed through as black for the whole sweep.
 *
 * Two things here are load-bearing. The exit waits for the incoming page to
 * paint before it starts — the home page mounts seven diagram cards and
 * several WebGL canvases, and starting the exit into that long task meant the
 * whole staggered sequence elapsed while the thread was blocked, so the blocks
 * vanished together instead of one at a time. And navigation never waits on
 * the animation: a guarded `go()` runs on completion or on a timer, so a tab
 * that is not painting still routes.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [delays, setDelays] = useState<number[]>(() => Array(CELLS).fill(0));
  const target = useRef<string | null>(null);
  const routed = useRef(false);

  /**
   * Two spiral arms, 180 degrees apart — one starting top-left, the other
   * bottom-right — winding inward and meeting in the middle.
   *
   * Each block's delay is computed from where it sits rather than walked as a
   * path: how far it is from the centre decides *when* in the wind-in it
   * belongs, and its angle decides where along the arm. Folding the angle to a
   * half turn is what produces two arms instead of one, and makes opposite
   * corners mirror each other exactly.
   *
   * `inward` runs it outside-in for the cover; the clear reverses it so the
   * blocks unwind back out from the centre.
   */
  const spiral = useCallback((inward: boolean) => {
    const cx = (COLS - 1) / 2;
    const cy = (ROWS - 1) / 2;
    const maxR = Math.hypot(cx, cy) || 1;

    const next = Array.from({ length: CELLS }, (_, i) => {
      const dx = (i % COLS) - cx;
      const dy = Math.floor(i / COLS) - cy;
      const r = Math.hypot(dx, dy) / maxR; // 0 at the centre, 1 at the corners
      // Rotate so the arms begin exactly at the top-right and bottom-left
      // corners. Derived from the grid rather than assumed to be 45 degrees,
      // which is only true when the grid is square — this one is 10 by 6.
      let a = Math.atan2(dy, dx) - Math.atan2(-cy, cx);
      a = ((a % Math.PI) + Math.PI) % Math.PI; // fold to half a turn -> two arms
      const turn = a / Math.PI; // 0..1 along each arm
      const depth = inward ? 1 - r : r; // centre last, or centre first
      return depth * SPIRAL_IN + turn * SPIRAL_ARC;
    });
    setDelays(next);
  }, []);

  /** Route now, whether the blocks finished or not. Safe to call twice. */
  const go = useCallback(() => {
    const href = target.current;
    if (!href || routed.current) return;
    routed.current = true;
    router.push(href);
  }, [router]);

  useEffect(() => {
    const onGo = (e: Event) => {
      const href = (e as CustomEvent<string>).detail;
      if (!href) return;
      // Compare against where we are *heading*, not where we are. Mid-transition
      // the URL has not caught up, and without this a second click was dropped
      // as a no-op while the first navigation quietly won.
      const heading = target.current ?? window.location.pathname;
      if (href === heading) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault(); // tells the link the overlay took it
      target.current = href;
      routed.current = false;
      spiral(true);
      setPhase("cover");
    };
    window.addEventListener(PT_EVENT, onGo);
    return () => window.removeEventListener(PT_EVENT, onGo);
  }, [spiral]);

  // A browser that is not painting never finishes an animation, so
  // `onAnimationComplete` never fires. Navigation must not depend on motion.
  useEffect(() => {
    if (phase !== "cover") return;
    const id = setTimeout(go, (SWEEP + TILE * COVERED_AT) * 1000);
    return () => clearTimeout(id);
  }, [phase, go]);

  // ...and the same guarantee on the way out, or the overlay could sit there
  // covering a perfectly good page.
  useEffect(() => {
    if (phase !== "clear") return;
    const id = setTimeout(() => setPhase("idle"), (SWEEP + TILE) * 1000 + 240);
    return () => clearTimeout(id);
  }, [phase]);

  // The route has arrived. Let the new page mount and paint first, otherwise
  // the exit runs inside that long task and every block leaves at once.
  useEffect(() => {
    if (phase !== "cover" || !target.current) return;
    if (pathname !== target.current) return;
    target.current = null;
    routed.current = false;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      spiral(false);
      setPhase("clear");
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(start));
    const fallback = setTimeout(start, 180); // in case frames never come
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [pathname, phase, spiral]);

  const layer = () => (
    <div className="pt__layer">
      {delays.map((delay, i) => (
        <motion.span
          key={i}
          className="pt__cell"
          custom={delay}
          variants={{
            out: (d: number) => ({
              scale: 0,
              transition: { duration: TILE * 0.7, delay: d, ease: [0.76, 0, 0.24, 1] },
            }),
            in: (d: number) => ({
              // a hair over 1, so neighbouring squares never leave a seam
              scale: 1.02,
              transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.6, delay: d },
            }),
          }}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="pt"
          className="pt"
          aria-hidden="true"
          style={{ "--cols": COLS, "--rows": ROWS } as React.CSSProperties}
          initial="out"
          animate={phase === "cover" ? "in" : "out"}
          onAnimationComplete={(definition) => {
            if (definition === "in") go();
            if (definition === "out" && phase === "clear") setPhase("idle");
          }}
        >
          {layer()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
