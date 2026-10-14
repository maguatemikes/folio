import Link from "next/link";
import type { System } from "@/lib/data";

/**
 * The auto-blogging / multi-page generator, drawn as itself: one seed keyword
 * on the left, pages building themselves on the right with SEO anchors placed.
 * Clicking opens the brief.
 */

const POSTS = [
  { title: "Custom Bandanas for Events", anchor: "bulk bandanas", score: 94 },
  { title: "Bandana Sizes Explained", anchor: "22×22 bandana", score: 91 },
  { title: "Printing Methods Compared", anchor: "DTG vs sublimation", score: 96 },
  { title: "Ordering in Bulk: A Guide", anchor: "wholesale pricing", score: 89 },
];

export default function ContentCard({ system }: { system: System }) {
  return (
    <Link href={system.href ?? "/start"} className="hcard hcard--content">
      <div className="hcard__media gen">
        <div className="gen__bar mono">
          <span>Auto-blog engine</span>
          <span className="gen__stat">
            1 seed <span className="accent">→</span> 40 pages
          </span>
        </div>

        <div className="gen__body">
          {/* Seed */}
          <div className="gen__seed">
            <span className="mono gen__label">Seed keyword</span>
            <span className="gen__keyword">
              custom bandanas
              <i className="gen__caret" />
            </span>
            <span className="mono gen__label gen__label--sub">Outline</span>
            <ul className="gen__outline mono">
              <li>Intro · intent match</li>
              <li>Sizes &amp; materials</li>
              <li>Print methods</li>
              <li>Bulk &amp; wholesale</li>
              <li>Internal links</li>
            </ul>
          </div>

          {/* Generated pages */}
          <div className="gen__pages">
            {POSTS.map((post, i) => (
              <article key={post.title} className="gen__page" style={{ "--i": i } as React.CSSProperties}>
                <div className="gen__thumb" />
                <div className="gen__lines">
                  <h4 className="gen__title">{post.title}</h4>
                  <span className="gen__line" />
                  <span className="gen__line gen__line--short" />
                  <span className="gen__meta mono">
                    <span className="gen__anchor">{post.anchor}</span>
                    <span className="gen__score">SEO {post.score}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="gen__foot mono">
          <span className="gen__progress">
            <i />
          </span>
          <span>Drafted · imaged · internally linked · published via WP All Import</span>
          <span className="gen__cta">
            Scale your content <span className="accent">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
