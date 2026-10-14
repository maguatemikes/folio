"use client";

import { getLenis } from "./SmoothScroll";

export default function BackToTop() {
  return (
    <button
      className="btn-round"
      data-magnetic
      aria-label="Back to top"
      onClick={() => {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      ↑
    </button>
  );
}
