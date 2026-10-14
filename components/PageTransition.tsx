"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const COLS = 8;
const ROWS = 5;
const CELLS = COLS * ROWS;
const STAGGER = 7; // ms between tiles — still reads as a grid, but snappier
const CELL_MS = 190; // how long one tile takes

/** Let any link start the transition: transitionTo("/start") */
let start: ((href: string) => void) | null = null;
export const transitionTo = (href: string) => {
  if (!start) return false;
  start(href);
  return true;
};

/**
 * Page transition: the screen is covered by a grid of tiles that arrive in a
 * random order, the route changes behind them, then they leave in a new random
 * order. Sits in the layout so it survives navigation.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  // "armed" paints the tiles in their start position for one frame, otherwise
  // they mount already finished and the browser has nothing to animate
  const [state, setState] = useState<"idle" | "armed" | "covering" | "covered" | "uncovering">("idle");
  const [delays, setDelays] = useState<number[]>(() => Array(CELLS).fill(0));
  const pending = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const shuffle = useCallback(() => {
    const order = Array.from({ length: CELLS }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    // order[i] is the tile's position in the sequence → its delay
    const next = Array(CELLS).fill(0);
    order.forEach((cell, position) => (next[cell] = position * STAGGER));
    setDelays(next);
    return Math.max(...next) + CELL_MS;
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    start = (href: string) => {
      if (href === window.location.pathname) return;
      pending.current = href;
      const duration = shuffle();
      setState("armed");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setState("covering");
          timers.current.push(
            setTimeout(() => {
              setState("covered");
              router.push(href);
            }, duration)
          );
        })
      );
    };
    return () => {
      start = null;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [router, shuffle]);

  // Once the new route is mounted, take the tiles away again
  useEffect(() => {
    if (state !== "covered") return;
    if (pending.current && pathname !== pending.current) return; // not there yet
    pending.current = null;
    const duration = shuffle();
    const id = setTimeout(() => {
      setState("uncovering");
      timers.current.push(setTimeout(() => setState("idle"), duration));
    }, 40);
    timers.current.push(id);
  }, [pathname, state, shuffle]);

  if (state === "idle") return null;

  return (
    <div
      className={`pt is-${state}`}
      style={
        { "--cols": COLS, "--rows": ROWS, "--pt-cell": `${CELL_MS}ms` } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {delays.map((delay, i) => (
        <span key={i} className="pt__cell" style={{ "--d": `${delay}ms` } as React.CSSProperties} />
      ))}
    </div>
  );
}
