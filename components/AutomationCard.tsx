import Link from "next/link";
import type { System } from "@/lib/data";

/**
 * Automation work has no website to screenshot, so the card draws the thing
 * itself: a canvas where a run travels through the nodes, each one lighting up
 * as the packets reach it. Clicking opens the project brief.
 */

type Node = {
  x: number;
  y: number;
  label: string;
  sub: string;
  /** Simple glyph drawn inside the node's icon tile */
  icon: "bolt" | "spark" | "branch" | "code" | "cart" | "check" | "list" | "tag";
  accent?: boolean;
};

const NODES: Node[] = [
  { x: 40, y: 168, label: "Trigger", sub: "Form · Webhook", icon: "bolt" },
  { x: 300, y: 64, label: "Claude", sub: "Draft & classify", icon: "spark", accent: true },
  { x: 300, y: 272, label: "n8n", sub: "Route & retry", icon: "branch" },
  { x: 580, y: 64, label: "Apps Script", sub: "Bulk edits", icon: "code" },
  { x: 580, y: 272, label: "Store / CMS", sub: "Publish", icon: "cart" },
  { x: 830, y: 168, label: "Done", sub: "50% less manual", icon: "check", accent: true },
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 5],
];

const LOGS = [
  "▸ trigger  new brief received",
  "▸ claude   classified · 240 rows drafted",
  "▸ n8n      routed · retries handled",
  "▸ script   bulk edits applied",
  "✓ run      finished in 38s",
];

const NODE_W = 185;
const NODE_H = 60;

function Glyph({ type, x, y }: { type: Node["icon"]; x: number; y: number }) {
  const p = { transform: `translate(${x} ${y})` };
  switch (type) {
    case "bolt":
      return (
        <g {...p}>
          <path d="M9 1 3 9h4l-1 6 6-8H8l1-6Z" className="flow__glyph" />
        </g>
      );
    case "spark":
      return (
        <g {...p}>
          <path d="M8 0c.7 4.6 2.7 6.6 7.3 7.3-4.6.7-6.6 2.7-7.3 7.3-.7-4.6-2.7-6.6-7.3-7.3C5.3 6.6 7.3 4.6 8 0Z" className="flow__glyph" />
        </g>
      );
    case "branch":
      return (
        <g {...p}>
          <path d="M3 2v11M3 6h6a3 3 0 0 1 3 3v3" className="flow__glyph flow__glyph--line" />
          <circle cx="3" cy="2" r="2" className="flow__glyph" />
          <circle cx="12" cy="13" r="2" className="flow__glyph" />
        </g>
      );
    case "code":
      return (
        <g {...p}>
          <path d="M5 3 1 8l4 5M11 3l4 5-4 5" className="flow__glyph flow__glyph--line" />
        </g>
      );
    case "cart":
      return (
        <g {...p}>
          <path d="M1 2h2l2 8h8l2-6H5" className="flow__glyph flow__glyph--line" />
          <circle cx="6" cy="14" r="1.6" className="flow__glyph" />
          <circle cx="12" cy="14" r="1.6" className="flow__glyph" />
        </g>
      );
    case "list":
      return (
        <g {...p}>
          <path d="M1 3h14M1 8h14M1 13h9" className="flow__glyph flow__glyph--line" />
        </g>
      );
    case "tag":
      return (
        <g {...p}>
          <path d="M8.5 1H15v6.5L7.5 15 1 8.5 8.5 1Z" className="flow__glyph flow__glyph--line" />
          <circle cx="11.5" cy="4.5" r="1.3" className="flow__glyph" />
        </g>
      );
    default:
      return (
        <g {...p}>
          <path d="M1 8.5 6 13 15 2" className="flow__glyph flow__glyph--line" />
        </g>
      );
  }
}

export default function AutomationCard({ system }: { system: System }) {
  const center = (i: number) => ({ x: NODES[i].x + NODE_W / 2, y: NODES[i].y + NODE_H / 2 });

  /**
   * Each wire carries its own gradient in user-space coordinates. A single
   * shared gradient defaults to objectBoundingBox units, and the two wires
   * between equal-height nodes are perfectly horizontal — a zero-height box,
   * which renders no paint at all, so those connectors were invisible.
   */
  const wires = EDGES.map(([from, to]) => {
    const a = center(from);
    const b = center(to);
    const midX = (a.x + b.x) / 2;
    const x1 = a.x + NODE_W / 2 - 6;
    const x2 = b.x - NODE_W / 2 + 6;
    return {
      d: `M ${x1} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${x2} ${b.y}`,
      x1,
      y1: a.y,
      x2,
      y2: b.y,
    };
  });

  return (
    <Link href={system.href ?? "/contact"} className="hcard hcard--flow">
      <div className="hcard__media flow">
        {/* Canvas chrome */}
        <div className="flow__bar mono">
          <span className="flow__live">
            <i />
            Workflow · live
          </span>
          <span className="flow__runs">
Content pipeline <span className="accent">·</span> 50% manual work saved
          </span>
        </div>

        <svg className="flow__svg" viewBox="0 0 1050 400" role="img" aria-label="Automation workflow">
          <defs>
            <pattern id="flow-grid" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" className="flow__dot" />
            </pattern>
            {wires.map((w, i) => (
              <linearGradient
                key={i}
                id={`flow-wire-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={w.x1}
                y1={w.y1}
                x2={w.x2}
                y2={w.y2}
              >
                <stop offset="0%" stopColor="rgba(239,238,234,.06)" />
                <stop offset="50%" stopColor="rgba(239,238,234,.22)" />
                <stop offset="100%" stopColor="rgba(239,238,234,.06)" />
              </linearGradient>
            ))}
          </defs>

          <rect width="1050" height="400" fill="url(#flow-grid)" />

          {wires.map(({ d }, i) => {
            const delay = { "--i": i } as React.CSSProperties;
            return (
              <g key={i}>
                <path
                  className="flow__wire"
                  d={d}
                  style={{ "--wire": `url(#flow-wire-${i})` } as React.CSSProperties}
                />
                <path className="flow__pulse" d={d} style={delay} />
                <circle className="flow__packet" r="3.5" style={delay}>
                  <animateMotion dur="3.6s" repeatCount="indefinite" path={d} begin={`${i * 0.3}s`} />
                </circle>
              </g>
            );
          })}

          {NODES.map((n, i) => (
            <g
              key={n.label}
              className={`flow__node${n.accent ? " is-accent" : ""}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              <rect className="flow__glow" x={n.x - 3} y={n.y - 3} width={NODE_W + 6} height={NODE_H + 6} rx="13" />
              <rect className="flow__box" x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx="10" />
              <rect className="flow__tile" x={n.x + 12} y={n.y + 14} width={32} height={32} rx="8" />
              <Glyph type={n.icon} x={n.x + 20} y={n.y + 22} />
              <text x={n.x + 56} y={n.y + 27} className="flow__label">
                {n.label}
              </text>
              <text x={n.x + 56} y={n.y + 44} className="flow__sub">
                {n.sub}
              </text>
              {/* ports */}
              <circle className="flow__port" cx={n.x} cy={n.y + NODE_H / 2} r="3.5" />
              <circle className="flow__port" cx={n.x + NODE_W} cy={n.y + NODE_H / 2} r="3.5" />
            </g>
          ))}
        </svg>

        {/* Log strip */}
        <div className="flow__log mono">
          <div className="flow__log-track">
            {[...LOGS, ...LOGS].map((line, i) => (
              <span key={i} className={line.startsWith("✓") ? "is-done" : undefined}>
                {line}
              </span>
            ))}
          </div>
          <span className="flow__cta">
            Automate something <span className="accent">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
