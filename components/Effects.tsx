"use client";

import { useEffect } from "react";
import { onScroll } from "./SmoothScroll";

/** Page-wide scroll and pointer effects, driven by data attributes. */
export default function Effects() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // Arriving from another route, the body is already "is-ready", so the hero
    // lines mount in their finished state and never animate. Drop the class for
    // a frame and put it back so those transitions run again.
    if (document.body.classList.contains("is-ready") && document.querySelector(".hero")) {
      document.body.classList.remove("is-ready");
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => document.body.classList.add("is-ready"))
      );
      cleanups.push(() => cancelAnimationFrame(raf));
    }

    // [data-reveal] fades up, [data-inview] unmasks lines, [data-counter] counts up
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add("is-in");
          if (el.dataset.counter) countUp(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    document
      .querySelectorAll("[data-reveal], [data-inview], [data-counter]")
      .forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // Word-by-word highlight tied to scroll position
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-words]"));
    const highlight = () => {
      const vh = window.innerHeight;
      blocks.forEach((block) => {
        const rect = block.getBoundingClientRect();
        const progress = Math.min(Math.max((vh * 0.85 - rect.top) / (rect.height + vh * 0.35), 0), 1);
        const words = block.querySelectorAll(".w");
        const lit = Math.floor(progress * (words.length + 1));
        words.forEach((w, i) => w.classList.toggle("on", i < lit));
      });
    };
    highlight();
    cleanups.push(onScroll(highlight));

    // Magnetic elements
    if (window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        el.style.transition = "transform .6s cubic-bezier(0.16, 1, 0.3, 1)";
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
          const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
          el.style.transform = `translate(${x}px, ${y}px)`;
        };
        const leave = () => {
          el.style.transform = "";
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}

function countUp(el: HTMLElement) {
  const end = Number(el.dataset.counter);
  const duration = 1800;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = String(Math.round((1 - Math.pow(1 - t, 4)) * end));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
