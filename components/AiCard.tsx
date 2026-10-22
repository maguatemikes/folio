import Link from "next/link";
import type { System } from "@/lib/data";

/**
 * The AI work drawn as what it actually is: context assembled deliberately on
 * the left, a constrained model in the middle, and real artifacts on the right
 * — a page spec that renders into an actual layout, not just a product blob.
 * The other cards are node graphs; this one is a pipeline of panes.
 */

const CONTEXT = [
  { label: "System rules", sub: "role · tone · refusals" },
  { label: "Brand voice", sub: "samples · do / don't" },
  { label: "Product data", sub: "live rows · specs" },
  { label: "Examples", sub: "few-shot · edge cases" },
];

const TOOLS = ["search", "fetch_rows", "write_page"];

/** What the model is asked to produce — a page, not a paragraph */
const ARTIFACTS = ["Page", "Listing", "Copy"];

const SPEC: [string, string][] = [
  ["route", '"/custom-bandanas"'],
  ["sections", "[ hero, grid, faq ]"],
  ["schema", '"Product + FAQ"'],
];

/** Wireframe blocks, built in the order the spec lists them */
const BLOCKS = [
  { kind: "nav", label: "nav" },
  { kind: "hero", label: "hero" },
  { kind: "grid", label: "grid · 3 up" },
  { kind: "cta", label: "faq + cta" },
];

export default function AiCard({ system }: { system: System }) {
  return (
    <Link href={system.href} className="hcard hcard--ai">
      <div className="hcard__media ai">
        <div className="ai__bar mono">
          <span className="ai__model">
            <i />
            Claude · constrained
          </span>
          <span className="ai__schema">schema enforced</span>
        </div>

        <div className="ai__body">
          {/* What the model is given */}
          <div className="ai__context">
            <span className="mono ai__label">Context assembled</span>
            {CONTEXT.map((c, i) => (
              <div key={c.label} className="ai__block" style={{ "--i": i } as React.CSSProperties}>
                <span className="ai__blockLabel">{c.label}</span>
                <span className="mono ai__blockSub">{c.sub}</span>
              </div>
            ))}
          </div>

          {/* The model, and what it may reach for */}
          <div className="ai__core">
            <div className="ai__ring">
              <i />
              <i />
              <span className="mono">claude</span>
            </div>
            <ul className="ai__tools mono">
              {TOOLS.map((t, i) => (
                <li key={t} style={{ "--i": i } as React.CSSProperties}>
                  {t}()
                </li>
              ))}
            </ul>
          </div>

          {/* What comes back: a typed spec, and the page it builds */}
          <div className="ai__out">
            <div className="ai__tabs mono">
              {ARTIFACTS.map((a, i) => (
                <span key={a} className={`ai__tab${i === 0 ? " is-on" : ""}`}>
                  {a}
                </span>
              ))}
            </div>

            <div className="ai__json mono">
              {SPEC.map(([k, v], i) => (
                <span key={k} className="ai__line" style={{ "--i": i } as React.CSSProperties}>
                  <span className="ai__key">{k}</span>
                  <span className="ai__colon">:</span>
                  <span className="ai__val">{v}</span>
                </span>
              ))}
            </div>

            {/* The spec rendering into an actual layout */}
            <div className="ai__wire" aria-hidden="true">
              {BLOCKS.map((b, i) => (
                <div
                  key={b.kind}
                  className={`ai__wireRow ai__wireRow--${b.kind}`}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {b.kind === "grid" ? (
                    <>
                      <i />
                      <i />
                      <i />
                    </>
                  ) : b.kind === "hero" ? (
                    <>
                      <i />
                      <i />
                    </>
                  ) : (
                    <i />
                  )}
                  <span className="mono ai__wireTag">{b.label}</span>
                </div>
              ))}
            </div>

            <span className="ai__pass mono">
              <i />
              built · validated · shipped
            </span>
          </div>
        </div>

        <div className="ai__foot mono">
          <span className="ai__meter">
            <i />
          </span>
          <span>Pages, listings and copy — generated to a schema, never pasted raw</span>
          <span className="ai__cta">
            Put AI to work <span className="accent">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
