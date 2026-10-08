# Lane Change on Shopify

Everything you need to run Lane Change on Shopify is in this folder:

| File | What it is |
| --- | --- |
| `lane-change-theme.zip` | The full Lane Change theme, ready to upload. |
| `products.csv` | The 5 Collection 001 tees (sizes, prices, stock, SKUs, categories, SEO, 8 photos each), ready to import. |
| `stock-count-collection-001.csv` | One row per SKU for counting physical stock against Shopify. |
| `policies/` | Shipping and returns policy drafts, plus where each policy goes. |
| `LAUNCH-CHECKLIST.md` | The audit, item by item: what's done, what to do in Shopify admin, what to confirm. |
| `theme/` | The theme's source files (only needed if you or a developer want to edit the code). |

Setup takes about 20 minutes. Do the steps in this order.

---

## 1. Upload the theme

1. In Shopify admin, go to **Online Store → Themes**.
2. Click **Add theme → Upload zip file** and choose `lane-change-theme.zip`.
3. Leave it unpublished for now. You'll publish it at the end.

> **Updating?** Upload the new zip the same way. It arrives as a new copy in your theme library. Then click **⋯ → Publish** on it. The theme marked **Current theme** is the one customers see, so an uploaded zip changes nothing until it's published.

## 2. Import the products

> **Already imported the tees before (they show old names like "Gothic Stack Tee")?** Delete them first: **Products**, tick all of them, **More actions → Delete products**. The new file uses new product URLs that match the new names (e.g. `/products/stacker-tee-washed-black`), so importing on top of the old products would create duplicates.

1. Go to **Products → Import**.
2. Choose `products.csv` and click **Upload and preview**, then **Import products**.
3. Shopify downloads the product photos during import, which can take a few minutes.

What the import creates:

- **5 products:** Stacker, Angel, Globe, Checker and Portrait Tee, each with a Size option (XS–XXL) and a Color option.
- **8 photos per product, in order:** front, back, fit, side, chest detail, back print, fabric, neck label. Each photo has descriptive alt text.
- **Product category** (Apparel & Accessories › Clothing › Clothing Tops › T-Shirts) for tax and Google Shopping.
- **Stock** of 25 for each size.
- **SKUs** in the form `LC001-STK-BLK-M` (collection · product · colour · size).
- **Weights** for shipping rates.
- **SEO titles and descriptions.**
- **Tags** that the theme uses:
  - `collection-001` and `tees` build the collections in step 3.
  - `family:collection-001-tee` links the five tees, so each product page shows all five colour swatches and you can switch between them.
  - `swatch:#hex` sets the swatch colour.
  - `badge:…` adds the small label on product cards (the Stacker Tee is marked Flagship).
- **Descriptions** that become **Details**, **Fit** and **Care** dropdowns on the product page. The text before the first **Heading 6** is Details, and each Heading 6 starts a new dropdown. To change them, edit the description and use the Heading 6 style for each section title.

> Before importing, update the stock numbers and prices in the CSV if needed (open it in Google Sheets or Excel). You can also change them in Shopify afterwards.
>
> The product photos are loaded from this GitHub repository, so it has to stay **public until the import has finished**. After that, Shopify keeps its own copies.

## 3. Create the collections

Go to **Products → Collections → Create collection**. Create each collection below as **Automated**, with the condition **Product tag is equal to** the tag shown. The handle has to match, because the homepage and menus link to these URLs. Check it under *Search engine listing* at the bottom of the page.

| Title | Handle | Condition: tag equals |
| --- | --- | --- |
| Collection 001 | `collection-001` | `collection-001` |
| Tees | `tees` | `tees` |

For **Collection 001**, also fill in:

- **Description:** Five heavyweight garment-washed tees. Quiet fronts, loud backs. The first Lane Change collection — International Street Sports, built in Australia for the world.
- **Search engine listing → Page title:** Collection 001 — Oversized Heavyweight Tees | Lane Change
- **Search engine listing → Meta description:** Lane Change Collection 001: five oversized heavyweight garment-washed tees — Stacker, Angel, Globe, Checker and Portrait. International Street Sports. Australian born, global minded.
- **Image:** a campaign photo. Without one, the banner uses the car-park campaign shot.

If you created a **Core Washed** collection earlier, delete it so there's only one main collection.

> Until Collection 001 (and the About page in step 4) exist, links to them open **Shop All**, so nothing is a dead click. They switch over automatically once created.

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

## 6. Navigation

Nothing to set up. The theme shows the brand navigation automatically: **SHOP · COLLECTION 001 · ABOUT · JOURNAL**, on desktop and in the mobile menu. Search, Account and Bag are always in the header.

- **About** and **Journal** appear as soon as the About page (step 4) and Journal blog (step 5) exist.
- The footer shows the same links plus **Contact**, and a row with **Shipping · Returns · Privacy · Terms** from your store policies.
- The header is a solid black bar on every page, so the logo, menu, search and bag are always visible. To float it over the homepage photo instead, tick **Customize → Theme settings (gear icon) → Header → Transparent over homepage hero**. The header is built into every page, so it can't be hidden or deleted by accident in the editor.
- To use your own Shopify menu instead, open **Customize → Theme settings → Header → Navigation** and choose **Menu chosen below**.
- Optional tidy-up: in **Online Store → Navigation**, the default "Main menu" (Home / Catalog / Contact) is no longer shown, so you can leave or delete it.

## 7. Customise and publish

Open **Online Store → Themes → Lane Change → Customize**.

- **Homepage:** campaign hero (International Street Sports, with Shop and Collection 001 buttons), Collection 001, the brand story, and the closing brand statement. Every image and piece of text can be edited. The hero can also play a short campaign video (**Hero → Campaign video**).
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

## Coming soon page (lock the store)

While you get ready to launch, visitors see the Lane Change **coming soon** page, styled exactly like the approved design: car-park photo, gothic logo, Different Lanes. Same Vision, Coming Soon, and an email sign-up. Nobody can browse or buy without the password.

**Turn it on or off:** go to **Online Store → Preferences → Password protection**, tick **Restrict access to visitors with the password**, set a password and **Save**. Untick it on launch day to open the store.

- **Getting in:** you and anyone you give the password to click **ENTER** (top right), type the password, and see the full store. You can also preview the store from the admin, where you're already logged in.
- **Sign-ups:** emails entered in **Notify Me** are saved as customers tagged `prelaunch` and `newsletter` (see **Customers**), ready for your launch email with Shopify Email or Klaviyo.
- **Editing it:** open **Customize**, then use the page picker at the top to choose **Password**. You can change the background photo (desktop and phone separately), the tagline, "Coming Soon", the button text and the thank-you message. Instagram and TikTok links come from **Theme settings → Social media**.
- **Note:** on a free trial or development store, Shopify keeps password protection on until you pick a plan. That's normal and is the page shown here.

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
