"use client";

import { useEffect, useRef } from "react";
import { projects } from "@/lib/data";
import SiteCard from "./SiteCard";

/**
 * Pinned gallery: vertical scroll drives horizontal movement of the track.
 * - each card unmasks as it slides in from the right
 * - website projects sit in a browser frame whose key pages cycle on hover
 */
export default function HorizontalWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = Array.from(track.querySelectorAll<HTMLElement>(".hcard"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none)").matches;

    let distance = 0;
    let current = 0;
    let raf = 0;
    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const measure = () => {
      distance = Math.max(track.scrollWidth - window.innerWidth, 0);
      section.style.height = `${distance + window.innerHeight}px`;
    };

    const loop = () => {
      const top = section.getBoundingClientRect().top;
      const progress = distance ? Math.min(Math.max(-top / distance, 0), 1) : 0;
      const target = progress * distance;
      current += (target - current) * (reduced ? 1 : 0.08);
      if (Math.abs(target - current) < 0.05) current = target;

      track.style.transform = `translate3d(${-current}px, 0, 0)`;

      const vw = window.innerWidth;
      cards.forEach((card) => {
        const media = card.querySelector<HTMLElement>(".hcard__media")!;
        const art = card.querySelector<HTMLElement>(".hcard__art");
        const info = card.querySelector<HTMLElement>(".hcard__info");
        const r = card.getBoundingClientRect();

        // How far the card has travelled into view, 0 at the right edge to 1
        // once it is well inside. Spread over most of the viewport so the card
        // builds as you scroll rather than snapping in near the edge.
        const enter = reduced ? 1 : clamp((vw - r.left) / (vw * 0.72));
        const eased = 1 - Math.pow(1 - enter, 3);

        // Unmask from the left edge as it comes
        media.style.clipPath = `inset(0 ${(1 - eased) * 100}% 0 0 round 6px)`;
        // ...and let the whole card settle up into place while it does
        card.style.opacity = String(0.2 + eased * 0.8);
        card.style.transform = `translate3d(0, ${(1 - eased) * 34}px, 0) scale(${0.955 + eased * 0.045})`;

        // The title follows a beat behind the image, so the card reads as
        // arriving in two stages instead of one block
        if (info) {
          const lag = 1 - Math.pow(1 - clamp((enter - 0.18) / 0.82), 3);
          info.style.opacity = String(lag);
          info.style.transform = `translate3d(0, ${(1 - lag) * 16}px, 0)`;
        }

        const center = (r.left + r.width / 2 - vw / 2) / vw; // -1..1 around center
        if (art) {
          art.style.transform = `translate3d(${center * -12}%, 0, 0) scale(${1.25 + (1 - eased) * 0.25})`;
        }
        if (touch) card.classList.toggle("is-active", Math.abs(center) < 0.2);
      });

      const shown = distance ? current / distance : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;
      if (countRef.current) {
        const idx = Math.min(cards.length, Math.max(1, Math.round(shown * (cards.length - 1)) + 1));
        countRef.current.textContent = String(idx).padStart(2, "0");
      }

      raf = requestAnimationFrame(loop);
    };

    measure();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={sectionRef} className="hscroll" id="work">
      <div className="hscroll__sticky">
        <div className="hscroll__head mono">
          <span>01 — Selected work</span>
          <span>( Scroll )</span>
        </div>

        <div ref={trackRef} className="hscroll__track">
          {projects.map((p, i) =>
            p.screens ? (
              <SiteCard key={p.title} project={p} />
            ) : (
              <a
                key={p.title}
                href={p.url ?? "#"}
                target={p.url ? "_blank" : undefined}
                rel={p.url ? "noopener noreferrer" : undefined}
                className="hcard"
              >
                <div className="hcard__media">
                  <div className={`art art--${p.art} hcard__art`} />
                  <span className="hcard__num mono">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="hcard__info">
                  <h3>
                    <span className="roll" data-text={p.title}>
                      {p.title}
                    </span>
                  </h3>
                  <span className="mono">
                    {p.type}
                    {p.year ? ` · ${p.year}` : ""}
                  </span>
                </div>
              </a>
            )
          )}

          <a href="#contact" className="hscroll__end">
            <span>Your project</span>
            <span className="accent">next →</span>
          </a>
        </div>

        <div className="hscroll__foot mono">
          <span>
            <span ref={countRef}>01</span> / {String(projects.length).padStart(2, "0")}
          </span>
          <span className="hscroll__bar">
            <span ref={barRef} />
          </span>
          <span>2023 — 2026</span>
        </div>
      </div>
    </div>
  );
}
