/**
 * Marquee marks. Built from the site's own square module — the same 13px square
 * used as the separator — on a 3×3 grid, solid ink at the weight of the type,
 * with one cell picking up the accent on hover. Abstract by design: these are
 * marks in our system, not other companies' logos.
 */

const CELL = 6;
const GAP = 1.4;
const step = CELL + GAP;
const at = (i: number) => i * step;

/** "x,y" cells on a 3×3 grid, and which one carries the accent */
type Mark = { cells: [number, number][]; accent: [number, number] };

const MARKS: Record<string, Mark> = {
  // publishing: rows stepping down
  WordPress: {
    cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [0, 2]],
    accent: [2, 0],
  },
  // catalog: four corners around a centre
  WooCommerce: {
    cells: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    accent: [1, 1],
  },
  // storefront: a ring around one cell
  Shopify: {
    cells: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
    accent: [1, 0],
  },
  // page builder: columns of different heights
  Elementor: {
    cells: [[0, 0], [0, 1], [0, 2], [1, 1], [1, 2], [2, 2]],
    accent: [2, 2],
  },
  // frame and pointer
  "UI/UX Design": {
    cells: [[0, 0], [1, 0], [0, 1], [2, 2]],
    accent: [2, 2],
  },
  // rising bars
  SEO: {
    cells: [[0, 2], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    accent: [2, 0],
  },
  // a run passing between two nodes
  Automation: {
    cells: [[0, 0], [1, 1], [2, 2]],
    accent: [1, 1],
  },
  // two lanes converging on one collector
  Tracking: {
    cells: [[0, 0], [0, 2], [1, 1], [2, 1]],
    accent: [2, 1],
  },
  // a branch leaving the main line
  Git: {
    cells: [[0, 1], [1, 1], [2, 1], [1, 0]],
    accent: [1, 0],
  },
  // header and footer bars held apart by the content stem
  CMS: {
    cells: [[0, 0], [1, 0], [2, 0], [1, 1], [0, 2], [1, 2], [2, 2]],
    accent: [1, 1],
  },
};

export default function MarqueeIcon({ name }: { name: string }) {
  const mark = MARKS[name];
  if (!mark) return null;
  const [ax, ay] = mark.accent;

  return (
    <svg className="marquee__icon" viewBox={`0 0 ${at(2) + CELL} ${at(2) + CELL}`} aria-hidden="true">
      {mark.cells.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={at(x)}
          y={at(y)}
          width={CELL}
          height={CELL}
          className={x === ax && y === ay ? "marquee__cell is-accent" : "marquee__cell"}
        />
      ))}
    </svg>
  );
}
