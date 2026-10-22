import Link from "next/link";
import type { System } from "@/lib/data";

/**
 * Headless drawn as the split it actually is: the CMS the client already edits
 * on the left, the API in the middle, and a front end on the right that no
 * longer waits on a theme. Light card — the two dark ones either side of it
 * are the automation and tracking pipelines.
 */

const SOURCES = [
  { name: "WordPress", endpoint: "/wp-json/wp/v2", kind: "Pages · posts · ACF" },
  { name: "Shopify", endpoint: "/api/2026-01/graphql", kind: "Products · variants" },
];

const EDGE = [
  { label: "Edge cache", sub: "stale-while-revalidate" },
  { label: "Type-safe client", sub: "generated from schema" },
];

export default function HeadlessCard({ system }: { system: System }) {
  return (
    <Link href={system.href} className="hcard hcard--headless">
      <div className="hcard__media hl">
        <div className="hl__bar mono">
          <span>Headless · decoupled</span>
          <span className="hl__stat">
            No template ceiling <span className="accent">·</span> editors unchanged
          </span>
        </div>

        <div className="hl__body">
          {/* The CMS the client keeps */}
          <div className="hl__col">
            <span className="mono hl__label">Content source</span>
            {SOURCES.map((src, i) => (
              <div key={src.name} className="hl__src" style={{ "--i": i } as React.CSSProperties}>
                <span className="hl__srcName">{src.name}</span>
                <span className="mono hl__endpoint">{src.endpoint}</span>
                <span className="mono hl__kind">{src.kind}</span>
              </div>
            ))}
          </div>

          {/* The wire between them */}
          <div className="hl__pipe" aria-hidden="true">
            <span className="hl__rail">
              <i />
              <i />
              <i />
            </span>
            <div className="hl__edge">
              {EDGE.map((e, i) => (
                <div key={e.label} className="hl__edgeItem" style={{ "--i": i } as React.CSSProperties}>
                  <span className="hl__edgeLabel">{e.label}</span>
                  <span className="mono hl__edgeSub">{e.sub}</span>
                </div>
              ))}
            </div>

            {/* The constraint the whole approach exists to get around */}
            <div className="hl__bypass mono">
              <s>Theme templates</s>
              <span className="hl__bypassTag">bypassed</span>
            </div>
          </div>

          {/* What the visitor actually gets */}
          <div className="hl__col hl__col--out">
            <span className="mono hl__label">Rendered front end</span>
            <div className="hl__app">
              <span className="hl__chrome mono">
                <i />
                yoursite.com
              </span>
              <span className="hl__hero" />
              <span className="hl__grid">
                <i />
                <i />
                <i />
              </span>
              <span className="hl__copy" />
              <span className="hl__copy hl__copy--short" />
            </div>
            <span className="mono hl__fw">Next.js · Hydrogen</span>
          </div>
        </div>

        <div className="hl__foot mono">
          <span className="hl__progress">
            <i />
          </span>
          <span>Build what the design needs — not what the theme allows</span>
          <span className="hl__cta">
            Go headless <span className="accent">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
