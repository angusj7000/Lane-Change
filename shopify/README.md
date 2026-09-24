# Lane Change on Shopify

Everything you need to run Lane Change on Shopify is in this folder:

| File | What it is |
| --- | --- |
| `lane-change-theme.zip` | The full Lane Change theme, ready to upload. |
| `products.csv` | All 14 products (sizes, prices, stock, SKUs, images, descriptions), ready to import. |
| `theme/` | The theme's source files (only needed if you or a developer want to edit the code). |

Setup takes about 20 minutes. Do the steps in this order.

---

## 1. Upload the theme

1. In Shopify admin, go to **Online Store → Themes**.
2. Click **Add theme → Upload zip file** and choose `lane-change-theme.zip`.
3. Leave it unpublished for now. You'll publish it at the end.

## 2. Import the products

1. Go to **Products → Import**.
2. Choose `products.csv` and click **Upload and preview**, then **Import products**.
3. Shopify downloads the product photos during import, which can take a few minutes.

What the import creates:

- **14 products**, each with a Size option and a Color option.
- **Stock** of 25 for each size. Sizes marked sold out on the demo site import with 0 stock, so they show as sold out.
- **SKUs** such as `LC-GLOBLA-M`.
- **Weights** for shipping rates.
- **SEO titles and descriptions.**
- **Tags** that the theme uses:
  - `tees`, `hoodies`, `accessories`, `core-washed`, `graphic-tees` build the collections in step 3.
  - `family:…` links colourways of the same tee, so the product page shows colour swatches that switch between them.
  - `swatch:#hex` sets the swatch colour.
  - `badge:…` adds the small label on product cards (Flagship, Low stock, Style 01, New).
- **Descriptions with Fit, Fabric and Care sections.** These are written as **Heading 6** in each description, and the theme turns each Heading 6 into its own dropdown. To change them, edit the description and use the Heading 6 style for each section title.

> Before importing, update the stock numbers and prices in the CSV if needed (open it in Google Sheets or Excel). You can also change them in Shopify afterwards.
>
> The product photos are loaded from this GitHub repository, so it has to stay **public until the import has finished**. After that, Shopify keeps its own copies.

## 3. Create the collections

Go to **Products → Collections → Create collection**. Create each collection below as **Automated**, with the condition **Product tag is equal to** the tag shown. The handle has to match, because the homepage and menus link to these URLs. Check it under *Search engine listing* at the bottom of the page.

| Title | Handle | Condition: tag equals |
| --- | --- | --- |
| Core Washed | `core-washed` | `core-washed` |
| Graphic Tees | `graphic-tees` | `graphic-tees` |
| Tees | `tees` | `tees` |
| Hoodies | `hoodies` | `hoodies` |
| Accessories | `accessories` | `accessories` |

Add a collection image if you want one; it is used as the collection page banner. Without one, the theme uses the campaign photo.

> Until these collections (and the About page in step 4) exist, the homepage's Tees / Hoodies / Our Story panels and the View Collection button open **Shop All**, so nothing is a dead click. Once you create them, the panels go to the right places automatically. You don't need to re-upload the theme.

## 4. Create the pages

Go to **Online Store → Pages → Add page**. In the right-hand panel, pick the **Theme template** shown below.

| Title | Template | Handle | Content |
| --- | --- | --- | --- |
| About | `about` | `about` | Leave blank. The template already contains the Lane Change story. Edit it in the theme editor. |
| Contact | `contact` | `contact` | Optional intro text. The form is built in. |
| Wishlist | `wishlist` | `wishlist` | Leave blank. |
| Size Guide *(optional)* | default | `size-guide` | Your size table. Select it under Product → Size guide page in the theme editor. |

## 5. Create the Journal (optional)

Go to **Online Store → Blog posts → Manage blogs → Add blog** and name it **Journal**, with the handle `journal`. Any posts you add there appear on the Journal page.

## 6. Set up the menus

Go to **Online Store → Navigation**.

**Main menu** (`main-menu`). Nested items show as dropdowns on desktop and as sub-links in the mobile menu.

- Shop → `/collections/all`
  - Tees → Tees collection
  - Hoodies → Hoodies collection
  - Accessories → Accessories collection
  - Wishlist → Wishlist page
- Collections → `/collections`
  - Core Washed
  - Graphic Tees
- About → About page
- Journal → Journal blog

**Footer menu** (`footer`): Shop, Collections, About, Journal, Contact.

## 7. Customise and publish

Open **Online Store → Themes → Lane Change → Customize**.

- **Homepage.** The layout matches the approved mockup: hero, category strip, featured collection and brand statement. Every image and piece of text can be edited. The featured collection is already set to Core Washed.
- **Photography.** Until you upload your own campaign photos, the theme uses the placeholder imagery. Recommended sizes are listed in the editor next to each image field.
- **Theme settings** (the gear icon):
  - brand lines (International Street Sports / AUS — Worldwide / Est. 2025)
  - social links
  - free-shipping threshold (default $150)
  - drawer or cart-page checkout
  - the currency code after prices
  - wishlist on or off
  - the four-item feature grid for each product type
- **Newsletter.** The "Join The Lane" form saves sign-ups as customers tagged `newsletter`, which works with Shopify Email and with Klaviyo.

When you're happy with it, click **Publish**.

---

## Editing the theme code

The theme is generated from the same design source as the preview website, so the two look the same.

```bash
npm run shopify:csv     # regenerate products.csv from src/data/products.ts
npm run shopify:build   # rebuild theme.css, fonts, logos, default images and the zip
npm run shopify:check   # run Shopify Theme Check (0 offenses at release)
```

- The Liquid templates, sections and snippets in `theme/` are edited directly.
- `theme/assets/theme.css` is generated. Edit `src/styles/global.css`, the `<style>` blocks in the Astro components, or `shopify/src/shopify.css`, then run `npm run shopify:build`.
- If you use the Shopify CLI, `shopify theme dev --path shopify/theme` previews the theme against your store.
