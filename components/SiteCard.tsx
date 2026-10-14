"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/lib/data";
import ShaderImage from "./ShaderImage";

/**
 * A project shown inside a browser frame. Its key pages cycle on their own
 * whenever the card is on screen, and the address bar follows along.
 */
export default function SiteCard({ project }: { project: Project }) {
  const screens = useMemo(() => project.screens ?? [], [project.screens]);
  const sources = useMemo(() => screens.map((s) => s.image), [screens]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Cycle on its own while the card is on screen; pause when it is not
  useEffect(() => {
    if (!running || screens.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % screens.length), 2600);
    return () => clearInterval(id);
  }, [running, screens.length]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const io = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(card);
    return () => io.disconnect();
  }, []);

  const current = screens[index];

  return (
    <a
      ref={cardRef}
      href={project.url ?? "#"}
      target={project.url ? "_blank" : undefined}
      rel={project.url ? "noopener noreferrer" : undefined}
      className="hcard hcard--site"
    >
      <div className="hcard__media browser">
        <div className="browser__view">
          <ShaderImage
            srcs={sources}
            index={index}
            alt={`${project.title} — ${current?.label ?? "site"}`}
          />
        </div>
      </div>

      <div className="hcard__info">
        <h3>
          <span className="roll" data-text={project.title}>
            {project.title}
          </span>
        </h3>
        <span className="mono">
          {project.type}
          {project.year ? ` · ${project.year}` : ""}
        </span>
      </div>
    </a>
  );
}
