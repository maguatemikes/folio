import Link from "next/link";
import type { System } from "@/lib/data";
import SpeedScore from "./SpeedScore";

/**
 * Speed work drawn as the instrument you judge it with: a score climbing, the
 * three Core Web Vitals moving from fail to pass, and the payload that caused
 * it. Figures here are an illustrative before/after, not one client's numbers.
 */

const VITALS = [
  { key: "LCP", name: "Largest Contentful Paint", before: "4.1s", after: "1.2s", fill: 0.82 },
  { key: "CLS", name: "Cumulative Layout Shift", before: "0.24", after: "0.02", fill: 0.93 },
  { key: "INP", name: "Interaction to Next Paint", before: "410ms", after: "140ms", fill: 0.78 },
];

const WINS = [
  { label: "Images", detail: "WebP · sized · lazy" },
  { label: "Scripts", detail: "deferred · unused cut" },
  { label: "Fonts", detail: "subset · preloaded" },
];

export default function SpeedCard({ system }: { system: System }) {
  return (
    <Link href={system.href} className="hcard hcard--speed">
      <div className="hcard__media spd">
        <div className="spd__bar mono">
          <span className="spd__live">
            <i />
            Field data · real devices
          </span>
          <span className="spd__url">/custom-bandanas</span>
        </div>

        <div className="spd__body">
          {/* The number everyone asks about */}
          <div className="spd__gauge">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="spd__track" cx="60" cy="60" r="52" />
              <circle className="spd__arc" cx="60" cy="60" r="52" />
            </svg>
            <span className="spd__score">
              <SpeedScore />
              <i className="mono">Performance</i>
            </span>
            <span className="mono spd__from">was 48</span>
          </div>

          {/* What actually moved */}
          <div className="spd__vitals">
            <span className="mono spd__label">Core Web Vitals</span>
            {VITALS.map((v, i) => (
              <div key={v.key} className="spd__vital" style={{ "--i": i, "--fill": v.fill } as React.CSSProperties}>
                <span className="spd__vKey mono">{v.key}</span>
                <span className="spd__meter">
                  <i />
                </span>
                <span className="spd__swap mono">
                  <s>{v.before}</s>
                  <b>{v.after}</b>
                </span>
              </div>
            ))}

            <div className="spd__wins">
              {WINS.map((w, i) => (
                <span key={w.label} className="spd__win" style={{ "--i": i } as React.CSSProperties}>
                  <b>{w.label}</b>
                  <i className="mono">{w.detail}</i>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="spd__foot mono">
          <span className="spd__payload">
            <s>3.2 MB</s>
            <span className="accent">→</span>
            <b>680 KB</b>
          </span>
          <span>Profiled, not guessed · schema and internal links follow</span>
          <span className="spd__cta">
            Make it fast <span className="accent">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
