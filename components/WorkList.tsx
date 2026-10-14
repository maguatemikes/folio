"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/data";

export default function WorkList() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // Preview card trails the pointer and tilts with horizontal velocity
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const loop = () => {
      const dx = target.x - pos.x;
      pos.x += dx * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      const rot = Math.max(-10, Math.min(10, dx * 0.04));
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${rot}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={previewRef} className={`preview${active !== null ? " is-visible" : ""}`} aria-hidden="true">
        <div className="preview__inner">
          {projects.map((p, i) => {
            const on = active === i ? " is-active" : "";
            // Sites with screenshots show their homepage; the rest get a label
            return p.screens ? (
              <div
                key={p.title}
                className={`art art--image${on}`}
                style={{ backgroundImage: `url(${p.screens[0].image})` }}
              />
            ) : (
              <div key={p.title} className={`art art--panel${on}`}>
                <span className="mono">Website</span>
                <strong>{p.title}</strong>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="work__list" onMouseLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li
            key={p.title}
            className="row"
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
            onMouseEnter={() => setActive(i)}
            onClick={() => {
              if (p.url) window.open(p.url, "_blank", "noopener,noreferrer");
            }}
          >
            <span className="row__num mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="row__title">{p.title}</span>
            <span className="row__type mono">{p.type}</span>
            <span className="row__year mono">{p.year}</span>
            <span className="row__arrow">→</span>
          </li>
        ))}
      </ul>
    </>
  );
}
