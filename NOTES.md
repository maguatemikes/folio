# Portfolio — where things stand

Run it: `npm run dev` → http://localhost:3000

## Built

- **Intro** (`components/Loader.tsx`) — MAGUATE draws in orange, letters fill, orange pill
  expands, curtain lifts. ~2.2s. Progress is a timer, not real loading.
- **Hero** — masked line reveal, animated pill.
- **Work** (`components/HorizontalWork.tsx`) — pinned section; scrolling down moves cards
  sideways. Real projects use `components/SiteCard.tsx`, which cycles five screenshots of
  the live site every 2.6s inside a WebGL canvas (`components/ShaderImage.tsx`) with a
  fluid warp + RGB-split glitch.
- **Index, About, Services, Recognition, Contact** — see `app/page.tsx`.
- **Footer** — MAGUATE drawn as SVG outlines when scrolled into view.
- **Site-wide** — Lenis smooth scroll (`components/SmoothScroll.tsx`), custom scrollbar
  (`components/ScrollProgress.tsx`), smoke cursor (`components/SmokeyCursor.tsx`),
  mobile menu with enter/exit animation (`components/Nav.tsx`).

All copy and project data: **`lib/data.ts`**. All styles: **`app/globals.css`**.

## Still placeholder — needs real values

- Email `hello@maguate.com`, city Berlin / CET timezone
- Stats: 12 years, 140 projects, 18 awards, 9 countries
- The whole Recognition award table
- Social links (Instagram / LinkedIn / Dribbble all point to `#`)
- Projects 3–5: Norr Studio, Field Notes, Kinetic Labs (CSS gradients, no real site)
- Portrait block in About

## Adding a project

1. Capture five key pages with puppeteer-core at 1440x900 (see the scratchpad script used
   for the first two), crop the top 54px, save as 1600x960 WebP in
   `public/work/<slug>/`.
2. Add an entry to `projects` in `lib/data.ts` with `screens`, `stack` and `url`.

## Open questions for next session

- Make the loader wait on real assets (fonts/images) instead of a fixed timer, and show it
  only once per visit?
- Norr Studio / Field Notes / Kinetic Labs — replace with real work or cut them?
- Deploy target (Vercel? Cloudflare, to match the other sites?)
