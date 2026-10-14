# folio

Portfolio for **Florence Michael Maguate** — Web Developer & Designer, Cebu City.

Live sections: selected work (pinned horizontal gallery), a systems section for the
pipelines behind the sites, about, services, recognition, and a project brief at `/start`.

## Running it

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000` (this machine runs it on `3002`).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Hand-written CSS** in `app/globals.css` — no Tailwind, deliberately. Design tokens
  live at the top of that file.
- **Lenis** for smooth scroll. Note it does not emit native scroll events, so anything
  scroll-driven subscribes through `components/SmoothScroll.tsx`.
- **WebGL** — a shared fluid simulation (`lib/fluid.ts`) powering the cursor trail and
  the dot-grid panels, plus shader-warped images (`components/ShaderImage.tsx`).

## Where things live

| What | Where |
|---|---|
| All copy, projects, systems, services | `lib/data.ts` |
| All styles | `app/globals.css` |
| Page composition and section numbering | `app/page.tsx` |
| Scroll reveals, counters, magnetic cursor | `components/Effects.tsx` |
| Project screenshots | `public/work/<slug>/` |

Projects are **websites only**; the drawn diagram cards (automation, auto-blogging, bulk
listing, server-side tracking) live in `systems` and render through `components/Systems.tsx`.

## Conventions worth knowing

- Scroll reveals are applied imperatively (`el.classList.add("is-in")`). Any element with
  `data-reveal` must keep a **static** `className` — a className that changes on a React
  re-render will overwrite the attribute and wipe the reveal class. Put changing state on
  a data attribute instead.
- Project screenshots are captured at 1600×960, top 54px cropped, saved as WebP.
- Everything honours `prefers-reduced-motion`.
