import Link from "next/link";
import { systems } from "@/lib/data";
import AutomationCard from "./AutomationCard";
import ContentCard from "./ContentCard";
import ListingCard from "./ListingCard";
import TrackingCard from "./TrackingCard";

/**
 * Systems, not sites. Two columns that swap sides every row — the first has its
 * explanation in the second column, the next in the first — so the eye crosses
 * the page instead of running down one rail. The cards carry no title of their
 * own here: it belongs at the top of the text column.
 */
export default function Systems() {
  return (
    <div className="systems">
      {systems.map((s, i) => (
        <div
          key={s.title}
          className={`systems__row${i % 2 === 0 ? " systems__row--flip" : ""}`}
          data-reveal
        >
          <div className="systems__text">
            <span className="systems__num mono">{String(i + 1).padStart(2, "0")}</span>

            <h3 className="systems__title">
              <Link href={s.href}>
                <span className="roll" data-text={s.title}>
                  {s.title}
                </span>
              </Link>
            </h3>

            <span className="systems__type mono">
              {s.type}
              {s.year ? ` · ${s.year}` : ""}
            </span>

            <p className="systems__body">{s.body}</p>

            <ul className="systems__stack mono">
              {s.stack.map((t, n) => (
                <li key={t} style={{ "--n": n } as React.CSSProperties}>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="systems__card">
            {s.diagram === "automation" ? (
              <AutomationCard system={s} />
            ) : s.diagram === "content" ? (
              <ContentCard system={s} />
            ) : s.diagram === "listing" ? (
              <ListingCard system={s} />
            ) : (
              <TrackingCard system={s} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
