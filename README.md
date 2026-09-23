# LANE CHANGE — International Street Sports

Storefront for Lane Change, an Australian streetwear label. Different lanes. Same vision.

Built with [Astro](https://astro.build) as a static site: fast, SEO-friendly HTML with small
client-side scripts for the bag, wishlist and search. No framework runtime is shipped to the browser.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the built site
npm run check     # type-check
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, S3).

## Shopify

The store also ships as a ready-to-upload **Shopify theme** plus a **product import CSV**.
See [`shopify/README.md`](shopify/README.md) for the setup steps.

```bash
npm run shopify   # products.csv + theme zip + Theme Check
```

## Structure

```
design/reference/      homepage mockup (primary reference), brand board, logo sheet, on-model shots
src/
  assets/brand/        wordmark.svg, monogram.svg (LC), star.svg (compass star)
  assets/images/       all photography, optimised at build (AVIF/WebP, responsive sizes)
  config/site.ts       brand lines, navigation, socials, shipping threshold, newsletter endpoint
  data/products.ts     product catalogue, collections, gallery views
  data/journal.ts      journal posts
  components/          Header, Footer, ProductCard, Photo, Brand, CartDrawer, SearchOverlay…
  components/home/     Hero, CategoryStrip, FeaturedCollection, BrandStatement
  pages/               /, /shop, /collections/*, /products/*, /cart, /checkout, /wishlist,
                       /search, /about, /journal/*, /contact, /account, 404
  scripts/ui.ts        header, menus, scroll reveals, newsletter
  scripts/store.ts     bag, wishlist and search (localStorage)
  styles/global.css    design tokens, type system, buttons, motion
shopify/               Shopify theme (theme/), upload zip, products.csv and the setup guide
tools/                 imagery + logo pipelines, Shopify CSV export, theme build and Theme Check
```

## Replacing placeholder photography

All current imagery comes from the supplied design files in `design/reference/`:
the homepage mockup (`tools/extract_mockup_assets.py`, `tools/build_product_images.py`), plus the
brand board and on-model shots for the extended range (`tools/build_new_products.py`). To go live, overwrite a
file in `src/assets/images/` with real photography. Keep the same filename and you won't need
to change any code. Large originals are fine, since Astro resizes and compresses them at build.

| File | Used for | Suggested shot |
| --- | --- | --- |
| `hero-campaign.jpg` | Homepage hero, desktop | Landscape ≥ 2560px. Model from behind in the flagship tee, parking structure at night. Keep the car secondary. |
| `hero-campaign-mobile.jpg` | Homepage hero on phones, and the FIT view | Portrait ≥ 1200×1600, model centred. |
| `category-tees.jpg` / `category-hoodies.jpg` / `category-story.jpg` | Category strip, collection banners | Landscape ≥ 1600px. |
| `brand-statement.jpg` | Closing campaign frame | Wide landscape ≥ 2400px, road or highway. |
| `products/<colour>-front.jpg`, `-back.jpg`, `-detail.jpg`, `-fabric.jpg` | Product cards and galleries | 4:5 ≥ 1600×2000, same studio-black background for every colourway. |

To add a view that's still pending (for example the **SIDE** view), add
`products/<colour>-side.jpg` and set `side: 'products/<colour>-side'` in `src/data/products.ts`.
Until then, the gallery shows a branded "shoot pending" tile.

Logo files in `src/assets/brand/` are traced from the supplied artwork (wordmark from the homepage
mockup, LC monogram from the logo sheet). When the designer supplies final
vector artwork, replace them using the same filenames. Every placement uses `currentColor`.

## Going live checklist

- **Commerce backend.** `src/data/products.ts` uses the same shape as Shopify Storefront API
  products, and the bag in `src/scripts/store.ts` keeps its state in two small functions
  (`load`/`persist`). Swap these for Shopify (or another) cart calls and send `/checkout` to
  the hosted checkout.
- **Checkout.** `/checkout` is a complete UI, but no payment provider is connected yet.
- **Newsletter.** Set `newsletterEndpoint` in `src/config/site.ts` to your Klaviyo, Shopify or
  Mailchimp form action.
- **Domain and socials.** Update `site` in `astro.config.mjs` and the social handles in
  `src/config/site.ts`.
- **Contact and account forms.** Connect them to a form service or your commerce platform.

## Design system (short)

- **Palette.** Black `#0a0a0a`, washed `#151515`, concrete `#6f6e6b`, vintage white `#e8e5de`. The
  interface stays monochrome, and colour comes only from the garments. Orange `--signal` is
  reserved for status messages.
- **Type.** The gothic wordmark is SVG. Barlow Condensed is used for headlines and titles, and
  IBM Plex Mono (small, uppercase, tracked) for navigation and supporting copy. Cormorant
  Garamond, widely spaced, is used for the closing brand marks. All fonts are self-hosted via
  Fontsource.
- **Motion.** Fade and rise reveals, clip-path image reveals, slow hover zooms and a subtle film
  grain. All of it switches off under `prefers-reduced-motion`.
