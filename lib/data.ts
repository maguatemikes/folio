export const site = {
  name: "Florence Michael Maguate",
  surname: "MAGUATE",
  role: "Web Developer & Designer",
  email: "maguatemikes@gmail.com",
  phone: "+63 953 447 4110",
  city: "Cebu City",
  timeZone: "Asia/Manila",
  timeLabel: "PHT",
  available: "Open to freelance & contract work",
  socials: [
    // TODO: add the real LinkedIn URL
    { label: "LinkedIn", href: "#" },
  ],
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Systems", href: "#systems" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  // The brief form is the contact page — this routes rather than scrolling
  { label: "Contact", href: "/contact" },
];

/** Always-visible call to action in the header and menu */
export const cta = { label: "Start a project", href: "/contact" };

export const marquee = [
  "WordPress",
  "WooCommerce",
  "Shopify",
  "Elementor",
  "UI/UX Design",
  "SEO",
  "Automation",
  "Tracking",
  "Git",
  "CMS",
];

export type Screen = {
  /** Shown in the browser frame's address bar */
  path: string;
  label: string;
  image: string;
};

/**
 * A website I built. Projects are sites only — the systems and automations
 * live in `systems` below, so the work gallery stays one kind of thing.
 */
export type Project = {
  title: string;
  type: string;
  year: string;
  /** Placeholder visual (.art--N), used when there is no screenshot yet */
  art: number;
  /** Key pages of the site, cycled inside the browser frame */
  screens?: Screen[];
  stack?: string[];
  url?: string;
};

export const projects: Project[] = [
  {
    title: "Product Customization Store",
    type: "Headless E-commerce · Made to Order",
    year: "2026",
    art: 1,
    url: "https://custombandanas.shop",
    stack: ["Shopify CMS", "Hydrogen", "Headless"],
    screens: [
      { path: "/", label: "Home", image: "/work/custombandanas/home.webp" },
      { path: "/collections/all", label: "Shop", image: "/work/custombandanas/shop.webp" },
      { path: "/products/rodeo-nights", label: "Product", image: "/work/custombandanas/product.webp" },
      { path: "/custom-print/square", label: "Designer", image: "/work/custombandanas/designer.webp" },
      { path: "/bandana-calculator", label: "Calculator", image: "/work/custombandanas/calculator.webp" },
    ],
  },
  {
    title: "Resale Marketplace",
    type: "Headless Marketplace · Consignment",
    year: "2026",
    art: 2,
    url: "https://berlinhousewares.com",
    stack: ["Shopify Hydrogen", "Cloudflare Workers", "Headless"],
    screens: [
      { path: "/", label: "Home", image: "/work/berlinhouseware/home.webp" },
      { path: "/collections/all", label: "Shop", image: "/work/berlinhouseware/shop.webp" },
      { path: "/products/better-home-3-piece-bath-set", label: "Product", image: "/work/berlinhouseware/product.webp" },
      { path: "/consign", label: "Consign", image: "/work/berlinhouseware/consign.webp" },
      { path: "/sellers", label: "Sellers", image: "/work/berlinhouseware/sellers.webp" },
    ],
  },
  {
    title: "Product Landing Page",
    type: "Conversion Landing Page",
    year: "",
    art: 3,
    url: "https://wfe-landing-page.netlify.app/",
    screens: [
      { path: "/#hero", label: "Hero", image: "/work/wfe-landing/hero.webp" },
      { path: "/#product", label: "Product", image: "/work/wfe-landing/product.webp" },
      { path: "/#featured", label: "Featured", image: "/work/wfe-landing/featured.webp" },
      { path: "/#testimonial", label: "Testimonial", image: "/work/wfe-landing/testimonial.webp" },
    ],
  },
  {
    title: "Wholesale E-commerce Site",
    type: "WordPress · WooCommerce",
    year: "2021 — 2025",
    art: 4,
    url: "https://wholesaleforeveryone.com/sale",
    stack: ["Faceted Search", "Tiered Pack Pricing", "986 Styles"],
    screens: [
      { path: "/sale", label: "Sale", image: "/work/wfe-sale/sale.webp" },
      { path: "/sale/bandanas", label: "Category", image: "/work/wfe-sale/category.webp" },
      { path: "/sale/bandanas/paisley", label: "Patterns", image: "/work/wfe-sale/grid.webp" },
      {
        path: "/sale/hats-caps/winter/beanie",
        label: "Filters",
        image: "/work/wfe-sale/facets.webp",
      },
    ],
  },
];

/**
 * Systems I build rather than sites I ship — each one drawn as itself instead
 * of screenshotted, because there is no page to photograph. Separate from
 * `projects` on purpose: the work gallery is websites, this section is pipes.
 */
export type System = {
  title: string;
  type: string;
  year: string;
  /** Picks the drawn card that renders it */
  diagram:
    | "automation"
    | "content"
    | "listing"
    | "tracking"
    | "ai"
    | "headless"
    | "speed";
  /** Reads beside the diagram — what the thing does and why it exists */
  body: string;
  stack: string[];
  /** Internal destination — these all route to the brief */
  href: string;
};

export const systems: System[] = [
  {
    title: "Workflow Automation",
    type: "n8n · Claude · Apps Script",
    year: "2021 — 2026",
    diagram: "automation",
    body:
      "The jobs that used to be somebody's whole morning. A webhook fires, n8n picks it up, Claude reads the payload and decides what it is, and the result lands in a sheet, a store or an inbox. Built for the repeats — order routing, data cleanup, report assembly — so the work happens whether or not anyone is at a desk.",
    href: "/contact",
    stack: ["n8n", "Claude API", "Google Apps Script", "Webhooks"],
  },
  {
    title: "Auto-Blog Engine",
    type: "Own system · AI content at scale",
    year: "2022 — 2026",
    diagram: "content",
    body:
      "One seed keyword goes in and a structured outline comes back, then the pages build themselves — drafted, imaged, internally linked and published straight through WP All Import. Written against search intent rather than a word count, so what comes out is worth indexing.",
    href: "/contact",
    stack: ["Claude", "Apps Script", "WP All Import", "On-Page SEO"],
  },
  {
    title: "Bulk Listing & Optimization",
    type: "Amazon · eBay · Shopify · Lazada · Shopee",
    year: "2019 — 2026",
    diagram: "listing",
    body:
      "Catalogues moved at volume across Amazon, eBay, Shopify, Lazada and Shopee. Flat files and variation matrices built once, then mapped per channel — titles, bullets and A+ content rewritten to each marketplace's own rules instead of pasted between them.",
    href: "/contact",
    stack: ["Flat Files", "Variations", "A+ Content", "SEO Titles"],
  },
  {
    title: "Applied AI",
    type: "Claude API · Prompt design · Structured output",
    year: "2023 — 2026",
    diagram: "ai",
    body:
      "Models are only as good as what you hand them. I assemble the context — system rules, brand voice, real product data, worked examples — then constrain the model to return typed, validated output a script can act on. Tool calls fetch what the prompt cannot know, and every run is checked before it is allowed downstream.",
    stack: ["Claude API", "Prompt Engineering", "Structured Output", "Tool Use", "Evals"],
    href: "/contact",
  },
  {
    title: "Headless Integration",
    type: "WordPress · Shopify · Hydrogen · Next.js",
    year: "2024 — 2026",
    diagram: "headless",
    body:
      "A theme decides what you are allowed to build. The moment a design needs a layout, an interaction or a feature the template does not support, you are fighting it — overriding files, stacking plugins, or quietly dropping the idea. Headless removes that ceiling. Content stays in the WordPress or Shopify admin your team already edits; the front end is React, and no template gets to tell the page what it may do.",
    stack: ["WP REST API", "Storefront API", "Hydrogen", "Next.js", "Edge Cache"],
    href: "/contact",
  },
  {
    title: "SEO & Page Speed",
    type: "Core Web Vitals · Technical SEO",
    year: "2021 — 2026",
    diagram: "speed",
    body:
      "Rankings follow the things you can measure. I profile the real page — not a synthetic score — then go after what actually costs time: oversized images, render-blocking scripts, layout that shifts under the reader. Structured data and clean internal linking do the rest.",
    stack: ["Core Web Vitals", "Lighthouse", "Schema.org", "Image Pipeline", "Internal Linking"],
    href: "/contact",
  },
  {
    title: "Server-Side & Browser Tracking",
    type: "GTM · sGTM · GA4 · Meta CAPI",
    year: "2023 — 2026",
    diagram: "tracking",
    body:
      "Measurement that survives ad blockers and ITP. The browser tag still fires, but a server-side container on your own subdomain fires alongside it and sends conversions to GA4, Meta and Google Ads from first-party context. Both carry the same event_id, so the platforms count the sale once.",
    href: "/contact",
    stack: ["Google Tag Manager", "Server-Side GTM", "GA4", "Meta CAPI", "Consent Mode"],
  },
];

export const statement =
  "Web developer and designer with over 10 years of experience building responsive, high-conversion websites, e-commerce platforms and the automations that keep them running. I work across WordPress, WooCommerce, Shopify and Figma — from the first wireframe to bulk listings, on-page SEO and the scripts that cut the manual work in half.";

export const stats = [
  { value: 10, suffix: "+", label: "Years of practice" },
  { value: 30, suffix: "%", label: "Mobile engagement lift" },
  { value: 25, suffix: "%", label: "E-commerce sales lift" },
  { value: 98, suffix: "%", label: "Client satisfaction" },
];

export const services = [
  {
    title: "Web & UI/UX Design",
    body: "Responsive, high-conversion pages designed in Figma and built to scale — wireframes and prototypes first, then production-ready interfaces using Atomic Design systems.",
    tags: ["Figma", "Atomic Design", "Responsive Design", "UX/UI Optimization"],
  },
  {
    title: "WordPress Development",
    body: "Landing pages and stores built with Elementor and WooCommerce — scalable, SEO-optimized templates your team can edit, plus bulk publishing through WP All Import.",
    tags: ["WordPress", "WooCommerce", "Elementor", "WP All Import"],
  },
  {
    title: "E-commerce & Marketplaces",
    body: "Store design and listing work across Shopify, Amazon, Lazada and Shopee — bulk product listings, A+ Content, Amazon Stores, and product pages built to convert.",
    tags: ["Shopify", "Amazon A+ & Stores", "Lazada & Shopee", "Bulk Listings"],
  },
  {
    title: "SEO & Automation",
    body: "On-page SEO and site performance work, plus custom Google Apps Script automations for data entry, image handling and content at scale — including my own auto-blogging system.",
    tags: ["On-Page SEO", "Google Apps Script", "Auto-Blogging", "Performance"],
  },
  {
    title: "Content Management",
    body: "Content models a non-technical team can actually run — WordPress and Shopify as a traditional CMS, or decoupled behind a Hydrogen front end. Templates, custom fields and bulk import paths, so editing content never means touching layout.",
    tags: ["WordPress", "Shopify", "Headless CMS", "Custom Fields", "Bulk Import"],
  },
  {
    title: "Version Control & Handover",
    body: "Everything ships through Git — a branch per feature, a commit history you can actually read, and a repository the next developer can pick up without a phone call. Documentation written for whoever inherits the project.",
    tags: ["Git", "GitHub", "Branching", "Commit History", "Handover Docs"],
  },
  {
    title: "Analytics & Tracking",
    body: "Measurement that survives ad blockers and ITP — Google Tag Manager in the browser, a server-side container behind it, and conversions sent to GA4, Meta and Google Ads from first-party context with events deduplicated.",
    tags: ["Google Tag Manager", "Server-Side GTM", "GA4", "Meta CAPI", "Consent Mode"],
  },
];

/** Real roles and results — org, what it was, the figure, the period */
export const awards = [
  {
    org: "Nella Cosa Corp.",
    title: "Web Developer & Virtual Assistant",
    count: "",
    year: "2021 — 2025",
  },
  { org: "Mobile engagement", title: "Responsive design & UX optimization", count: "+30%", year: "" },
  { org: "E-commerce sales", title: "Optimized listings & on-page SEO", count: "+25%", year: "" },
  { org: "Manual work", title: "Google Apps Script automations", count: "−50%", year: "" },
  {
    org: "Asian College of Technology",
    title: "Associate Degree in Information Technology",
    count: "",
    year: "",
  },
];
