"use client";

import { useState } from "react";
import { services } from "@/lib/data";

export default function Services() {
  const [open, setOpen] = useState(0);

  return (
    <div className="acc">
      {services.map((s, i) => (
        <div
          key={s.title}
          /* The open state rides on a data attribute, not a class. The scroll
             reveal adds `is-in` to this node imperatively, and a className that
             changed on click made React rewrite the attribute and wipe it —
             the item then fell back to `opacity: 0` and vanished for good,
             since the observer had already unobserved it. */
          className="acc__item"
          data-open={open === i ? "" : undefined}
          data-reveal
          style={{ "--i": i } as React.CSSProperties}
        >
          <button
            className="acc__head"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span className="mono">{String.fromCharCode(65 + i)}</span>
            <span className="acc__title">{s.title}</span>
            <span className="acc__icon" />
          </button>
          <div className="acc__body">
            <div className="acc__content">
              <p>{s.body}</p>
              <ul className="tags mono">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
