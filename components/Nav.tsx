"use client";

import { useEffect, useState } from "react";
import TransitionLink from "./TransitionLink";
import { cta, nav, site } from "@/lib/data";
import Clock from "./Clock";
import RollLink from "./RollLink";
import { getLenis } from "./SmoothScroll";

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Lock the page behind the menu, and close it on Escape
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Anchor links must wait for the menu to close before scrolling
  const goTo = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    if (!target) return;
    setTimeout(() => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target as HTMLElement);
      else target.scrollIntoView({ behavior: "smooth" });
    }, 620); // let the panel lift away first
  };

  return (
    <>
      <header className="nav">
        <a href="#top" className="nav__logo" data-magnetic>
          {site.name.split(" ").slice(0, -1).join(" ")}{" "}
          {/* the intro's MAGUATE mark lands exactly on this word */}
          <span className="nav__surname">{site.name.split(" ").slice(-1)[0]}</span>
          <sup>©</sup>
        </a>
        <div className="nav__meta mono">
          <span>{site.role}</span>
          <span className="nav__time">
            <span className="dot" />
            <Clock timeZone={site.timeZone} /> {site.timeLabel}
          </span>
        </div>
        <nav className="nav__links">
          {nav.map((item) => (
            <RollLink key={item.href} href={item.href} label={item.label} data-magnetic />
          ))}
          <TransitionLink href={cta.href} className="nav__cta" data-magnetic>
            {cta.label}
          </TransitionLink>
        </nav>
        <button
          className="nav__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
      </header>

      <div className="menu" id="menu" aria-hidden={!open}>
        <nav className="menu__links">
          {nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={goTo(item.href)}
              style={{ "--i": i } as React.CSSProperties}
              tabIndex={open ? 0 : -1}
            >
              <span className="menu__index mono">0{i + 1}</span>
              <span className="menu__label">{item.label}</span>
            </a>
          ))}
        </nav>

        <TransitionLink href={cta.href} className="menu__cta" onClick={() => setOpen(false)}>
          {cta.label}
          <span className="accent"> ↗</span>
        </TransitionLink>

        <div className="menu__foot">
          <div>
            <span className="mono label">Get in touch</span>
            <a className="menu__email" href={`mailto:${site.email}`} tabIndex={open ? 0 : -1}>
              {site.email}
            </a>
          </div>
          <div className="menu__row mono">
            <span className="nav__time">
              <span className="dot" />
              <Clock timeZone={site.timeZone} /> {site.timeLabel}
            </span>
            <span className="menu__socials">
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} tabIndex={open ? 0 : -1}>
                  {s.label}
                </a>
              ))}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
