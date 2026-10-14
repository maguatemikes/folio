"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Shared instance so other components (back to top) can drive the scroll. */
let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/**
 * Subscribe to scroll. Lenis drives the page itself and does not emit native
 * scroll events, so prefer its own event and fall back to the window.
 */
export function onScroll(handler: () => void) {
  // Listen to both: Lenis drives the page, but programmatic and native scrolls
  // (anchor jumps, keyboard, reduced motion) still come through the window.
  lenis?.on("scroll", handler);
  window.addEventListener("scroll", handler, { passive: true });
  return () => {
    lenis?.off("scroll", handler);
    window.removeEventListener("scroll", handler);
  };
}

/**
 * Momentum scrolling for the whole page. Everything that reads scroll position
 * on each frame (the pinned gallery, reveals, the word highlight) keeps working,
 * since Lenis moves the real page scroll.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // A refresh should always land on the hero, not where the visitor left off
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      touchMultiplier: 1.6,
      anchors: true, // nav links glide instead of jumping
    });

    // The intro locks the page; release the scroll when it finishes
    const syncLock = () => {
      if (document.body.classList.contains("is-loading")) lenis?.stop();
      else lenis?.start();
    };
    lenis.scrollTo(0, { immediate: true });
    syncLock();
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    let raf = 0;
    const frame = (time: number) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
