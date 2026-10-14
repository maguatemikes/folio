# Portfolio — where things stand

Run it: `npm run dev` → http://localhost:3000 (this machine uses `3002`).

## Built

- **Intro** (`components/Loader.tsx`) — MAGUATE draws in orange, letters fill, orange pill
  expands, curtain lifts. ~2.2s. Progress is a timer, not real loading.
- **Hero** — masked line reveal, animated pill.
- **Work** (`components/HorizontalWork.tsx`) — pinned section; scrolling down moves cards
  sideways. **Websites only.** Each uses `components/SiteCard.tsx`, which cycles the site's
  screenshots every 2.6s inside a WebGL canvas (`components/ShaderImage.tsx`) with a fluid
  warp + RGB-split glitch.
- **Systems** (`components/Systems.tsx`) — the pipelines, drawn as diagrams instead of
  screenshotted: workflow automation, auto-blogging, bulk listing, and server-side +
  browser tracking. Two columns that swap sides each row, staggered entrance.
- **Index, About, Services, Recognition, Contact** — see `app/page.tsx`.
- **Footer** — MAGUATE drawn as SVG outlines when scrolled into view.
- **Site-wide** — Lenis smooth scroll (`components/SmoothScroll.tsx`), custom scrollbar
  (`components/ScrollProgress.tsx`), smoke cursor (`components/SmokeyCursor.tsx`),
  mobile menu with enter/exit animation (`components/Nav.tsx`).

All copy and project data: **`lib/data.ts`**. All styles: **`app/globals.css`**.

## Still placeholder — needs real values

- LinkedIn in `site.socials` still points to `#`
- The drawn cards carry invented figures — "1,284 runs", "38s", "240 rows drafted",
  "1 seed → 40 pages". The tracking card deliberately has none.
- "Wholesale E-commerce Site" is labelled `WordPress · WooCommerce`, but the `/sale` app
  it now screenshots is a custom front end with no Woo markup. Label needs correcting.

## Adding a project

1. Capture key pages with puppeteer-core at 1600x1014, crop the top 54px → 1600x960 WebP
   in `public/work/<slug>/`.
2. Add an entry to `projects` in `lib/data.ts` with `screens`, `stack` and `url`.

Note: `wholesaleforeveryone.com` serves a Cloudflare bot check on the homepage and refuses
some product images to headless clients, so not every page can be captured this way.

## Traps already hit

- **`data-reveal` needs a static `className`.** Reveals are applied imperatively
  (`el.classList.add("is-in")` in `components/Effects.tsx`). A className that changes on a
  React re-render overwrites the attribute and wipes the class — the element then falls
  back to `opacity: 0` and vanishes permanently, since the observer has already unobserved
  it. Put changing state on a data attribute instead (see `components/Services.tsx`).
- **Lenis emits no native scroll events.** Anything scroll-driven subscribes through
  `onScroll()` in `components/SmoothScroll.tsx`.
- **Size drawn cards off `vh`, not the column.** Sized off the column they ran ~96vh tall
  on short wide windows.
- **The loader runs on `requestAnimationFrame`**, so it stalls in a background tab and
  only completes once the tab is focused.

## Open questions

- Make the loader wait on real assets (fonts/images) instead of a fixed timer?
- Deploy target (Vercel? Cloudflare, to match the other sites?)
