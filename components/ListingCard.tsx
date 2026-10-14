import Link from "next/link";
import type { System } from "@/lib/data";

/**
 * Bulk listing work, drawn as the thing itself: a queue of SKUs moving from
 * raw to optimized to live across marketplaces. Clicking opens the brief.
 */

const PLATFORMS = ["Amazon", "eBay", "Shopify", "Lazada", "Shopee"];

const ROWS = [
  { sku: "WFE-2213-BLK", before: "bandana black 22x22", after: "Black Bandana 22×22 · 100% Cotton · 12-Pack" },
  { sku: "WFE-1818-NVY", before: "navy bandana small", after: "Navy Bandana 18×18 · Soft-Wash Cotton · Bulk" },
  { sku: "WFE-2727-RED", before: "red bandana big size", after: "Red Bandana 27×27 · Oversized · Made to Order" },
  { sku: "WFE-CAP-KHA", before: "cap khaki trucker", after: "Khaki Trucker Cap · Adjustable · Wholesale" },
  { sku: "WFE-TEE-WHT", before: "tee white plain", after: "White Cotton Tee · Unisex · Blank for Print" },
];

export default function ListingCard({ system }: { system: System }) {
  return (
    <Link href={system.href ?? "/start"} className="hcard hcard--listing">
      <div className="hcard__media listing">
        <div className="listing__bar mono">
          <span className="listing__tabs">
            {PLATFORMS.map((p, i) => (
              <span key={p} className={i === 0 ? "is-on" : undefined}>
                {p}
              </span>
            ))}
          </span>
          <span className="listing__count">
            <b>1,284</b> SKUs <span className="accent">·</span> one upload
          </span>
        </div>

        <div className="listing__head mono">
          <span>SKU</span>
          <span>Title</span>
          <span>Status</span>
        </div>

        <div className="listing__rows">
          {ROWS.map((row, i) => (
            <div key={row.sku} className="listing__row" style={{ "--i": i } as React.CSSProperties}>
              <span className="listing__sku mono">{row.sku}</span>
              <span className="listing__title">
                <span className="listing__before">{row.before}</span>
                <span className="listing__after">{row.after}</span>
              </span>
              <span className="listing__status mono">
                <i className="listing__dot" />
                <span className="listing__state listing__state--queue">Queued</span>
                <span className="listing__state listing__state--opt">Optimized</span>
                <span className="listing__state listing__state--live">Live</span>
              </span>
            </div>
          ))}
        </div>

        <div className="listing__foot mono">
          <span className="listing__progress">
            <i />
          </span>
          <span>Flat files · variations · A+ content · SEO titles</span>
          <span className="listing__cta">
            Get your catalog live <span className="accent">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
