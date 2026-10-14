import Link from "next/link";
import type { System } from "@/lib/data";

/**
 * Server-side tracking, drawn as the shape of the problem it solves: one event
 * leaves the page and takes two roads at once. The browser road loses hits to
 * ad blockers and ITP; the server road goes out first-party and arrives. Both
 * carry the same event_id, so the platforms count the conversion once.
 */

const DESTINATIONS = [
  { label: "GA4", sub: "Measurement Protocol", y: 84 },
  { label: "Meta CAPI", sub: "Conversions API", y: 222 },
  { label: "Google Ads", sub: "Enhanced conversions", y: 360 },
];

export default function TrackingCard({ system }: { system: System }) {
  return (
    <Link href={system.href} className="hcard hcard--track">
      <div className="hcard__media track">
        <div className="track__bar mono">
          <span className="track__live">
            <i />
            dataLayer · purchase
          </span>
          <span className="track__consent">consent: granted · first-party</span>
        </div>

        <svg className="track__svg" viewBox="0 0 1000 520" role="img" aria-label="Server-side and browser tracking pipeline">
          <defs>
            <linearGradient id="track-wire" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(239,238,234,.06)" />
              <stop offset="50%" stopColor="rgba(239,238,234,.22)" />
              <stop offset="100%" stopColor="rgba(239,238,234,.06)" />
            </linearGradient>
            <pattern id="track-grid" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.2" className="track__dot" />
            </pattern>
          </defs>

          <rect width="1000" height="520" fill="url(#track-grid)" />

          {/* Wires: event → split → two lanes → dedup → platforms */}
          <g>
            {[
              "M 186 260 H 238",
              "M 242 260 C 278 260, 282 140, 322 140",
              "M 242 260 C 278 260, 282 380, 322 380",
              "M 574 140 C 606 140, 606 260, 626 260",
              "M 574 380 C 606 380, 606 260, 626 260",
              "M 672 260 C 698 260, 700 122, 724 122",
              "M 672 260 H 724",
              "M 672 260 C 698 260, 700 398, 724 398",
            ].map((d, i) => (
              <g key={d}>
                <path d={d} className="track__wire" />
                <path d={d} className="track__pulse" style={{ "--i": i } as React.CSSProperties} />
              </g>
            ))}
          </g>

          {/* Source: the event itself */}
          <g className="track__node">
            <rect x="46" y="214" width="140" height="92" rx="10" className="track__box" />
            <rect x="66" y="236" width="9" height="9" className="track__tile" />
            <rect x="79" y="236" width="9" height="9" className="track__tile" />
            <rect x="66" y="249" width="9" height="9" className="track__tile" />
            <text x="66" y="283" className="track__name">
              Event
            </text>
            <text x="66" y="298" className="track__sub">
              gtm.js
            </text>
          </g>

          {/* The split */}
          <circle cx="240" cy="260" r="7" className="track__split" />

          {/* Browser lane — lossy by nature */}
          <g className="track__node">
            <rect x="322" y="70" width="252" height="140" rx="12" className="track__box" />
            <rect x="346" y="94" width="9" height="9" className="track__tile" />
            <rect x="359" y="94" width="9" height="9" className="track__tile" />
            <rect x="372" y="94" width="9" height="9" className="track__tile" />
            <text x="346" y="136" className="track__label">
              Browser
            </text>
            <text x="346" y="156" className="track__sub">
              web container · client hit
            </text>
            <text x="346" y="186" className="track__loss">
              ad block · ITP · lost hits
            </text>
          </g>

          {/* Server lane — the one that arrives */}
          <g className="track__node is-accent">
            <rect x="322" y="310" width="252" height="140" rx="12" className="track__box" />
            <rect x="346" y="334" width="9" height="9" className="track__tile" />
            <rect x="359" y="334" width="9" height="9" className="track__tile" />
            <rect x="346" y="347" width="9" height="9" className="track__tile" />
            <rect x="359" y="347" width="9" height="9" className="track__tile" />
            <text x="346" y="376" className="track__label">
              Server
            </text>
            <text x="346" y="396" className="track__sub">
              sGTM · own subdomain
            </text>
            <text x="346" y="426" className="track__win">
              first-party · delivered
            </text>
          </g>

          {/* Dedup join */}
          <g className="track__join">
            <circle cx="649" cy="260" r="23" className="track__joinRing" />
            <text x="649" y="264" className="track__joinText">
              ID
            </text>
            <text x="649" y="310" className="track__sub track__sub--mid">
              event_id
            </text>
            <text x="649" y="326" className="track__sub track__sub--mid">
              deduplicated
            </text>
          </g>

          {/* Platforms */}
          {DESTINATIONS.map((d, i) => (
            <g key={d.label} className="track__node" style={{ "--i": i } as React.CSSProperties}>
              <rect x="724" y={d.y} width="226" height="76" rx="10" className="track__box" />
              <rect x="746" y={d.y + 22} width="9" height="9" className="track__tile" />
              <rect x="746" y={d.y + 35} width="9" height="9" className="track__tile" />
              <text x="770" y={d.y + 33} className="track__label track__label--sm">
                {d.label}
              </text>
              <text x="770" y={d.y + 52} className="track__sub">
                {d.sub}
              </text>
              <circle cx="932" cy={d.y + 38} r="4" className="track__ok" style={{ "--i": i } as React.CSSProperties} />
            </g>
          ))}
        </svg>

        <div className="track__foot mono">
          <span className="track__meter">
            <i />
          </span>
          <span>Browser tag and server container fire together · one conversion counted</span>
          <span className="track__cta">
            Fix your tracking <span className="accent">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
