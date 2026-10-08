# Lane Change — Launch Checklist

This is the audit, item by item. Each line says who does it:

- **DONE**: handled in the theme, `products.csv` or the files in this folder. Upload / import to apply.
- **ADMIN**: a few clicks in Shopify admin (the steps are given).
- **YOU**: a fact only you can confirm, or a physical/real-world test.

**Apply the done items:** upload `lane-change-theme.zip` (Online Store → Themes), then re-import `products.csv` with **Overwrite products with matching handles** ticked (see README step 2).

> **Launch standard:** don't untick password protection until sections 06, 08, 09 and 12 are complete.

---

## 01 — Products + product pages

- [x] **DONE** Renamed: Stacker Tee, Angel Tee, Globe Tee, Checker Tee, Portrait Tee.
- [x] **DONE** Product URLs match the new names, e.g. `/products/stacker-tee-washed-black`. Import `products.csv` as fresh products (README step 2), after deleting the old ones.
- [x] **DONE** Stacker Tee description: 260 GSM heavyweight garment-washed cotton, raised 3D embroidery — 10 cm chest emblem, 45 cm embroidered back (per Brand HQ / Command Centre).
- [ ] **YOU** Confirm each description matches the approved garment and artwork. The descriptions now describe only what's visible in the photos. GSM and embroidery are stated for the Stacker only; the other four say "heavyweight garment-washed cotton". Tell me their exact specs and I'll add them.
- [ ] **YOU** Confirm every product photo shows the final production design (photos come from the approved lookbook sheets).
- [x] **DONE** Sizes XS, S, M, L, XL and XXL on all five. **YOU:** confirm this is the real size run.
- [ ] **YOU** Confirm the fit note "Model is 183cm and wears size L" (a placeholder until you confirm the model's height and size).
- [ ] **YOU** Confirm price: currently **$70 AUD** each.
- [ ] **YOU** Set real stock: the file has a placeholder **25 per size**. Update in Shopify (Products → Inventory) or in the CSV before importing.
- [x] **DONE** Shopify product category: Apparel & Accessories › Clothing › Clothing Tops › T-Shirts.
- [x] **DONE** SEO titles, e.g. "Stacker Tee — Washed Black | Lane Change".
- [x] **DONE** A unique SEO description for each product (under 160 characters).
- [x] **DONE** Accurate alt text for all 40 photos, describing the view and artwork.

## 02 — Collection 001

- [ ] **ADMIN** Create it under **Products → Collections → Create collection**:
  - Title **Collection 001**, type **Automated**, condition **Product tag is equal to `collection-001`**.
  - Check the handle is `collection-001`. All five tees carry that tag after the re-import.
  - Paste the description, page title and meta description from README step 3.
- [x] **DONE** Main shopping destination: the hero button, navigation, homepage section, empty-bag button and About page all point to Collection 001.
- [ ] **ADMIN** Delete the old **Core Washed** collection if it exists.
- [ ] **YOU** Collection image: until you upload one, the banner uses the car-park campaign shot.

## 03 — Navigation

- [x] **DONE** SHOP · COLLECTION 001 · ABOUT · JOURNAL, on desktop and mobile. Replaces the default Home / Catalog / Contact automatically.
- [x] **DONE** Search, Account and Bag are always in the header. On mobile, Search and Bag are in the header and Account is in the menu.
- [x] **DONE** Placeholder items removed. About and Journal only appear once their page and blog exist, so there are no dead links.
- [ ] **YOU** Check the mobile menu on your phone.

## 04 — Homepage

- [x] **DONE** The homepage has no "coming soon" messaging; that lives only on the password page, which disappears when you open the store.
- [x] **DONE** Hero uses the car-park campaign photo showing the real Stacker Tee. There's an optional **campaign video** slot (Customize → Hero).
- [x] **DONE** **INTERNATIONAL STREET SPORTS** is the main headline.
- [x] **DONE** **DIFFERENT LANES. SAME VISION.** is the supporting statement.
- [x] **DONE** Collection 001 sits directly below the hero.
- [x] **DONE** **SHOP** and **COLLECTION 001** buttons.
- [x] **DONE** Brand story section ("Australian Born. Global Minded."), linking to About.
- [x] **DONE** Fashion-first: the copy places cars as "part of the culture, not the whole story". The Hoodies placeholder panel is gone.
- [ ] **YOU** Check desktop and phone spacing on the live store. Swap in final campaign photography and video when ready.

## 05 — Product page UX

- [x] **DONE** Gallery order: front, back, fit, side, chest detail, back print, fabric, neck label.
- [x] **DONE** Fit / model imagery, plus fabric and embroidery/print close-ups.
- [x] **DONE** Price and sizes are clear; sold-out sizes are crossed out.
- [x] **DONE** Dropdowns: **Details** (garment + specs), **Fit**, **Care**.
- [x] **DONE** Larger, high-contrast **Add to Cart**.
- [x] **DONE** Low stock: sizes with 3 or fewer left get a dot and "Low stock — only X left in M", and product cards show a "Low stock" badge. The threshold is adjustable in Customize → Product.
- [x] **DONE** Shipping / Returns / support email links under Add to Cart, linking to your real policies. The unconfirmed "30-day returns" claim is removed.
- [ ] **ADMIN** Optional: add confirmed delivery times in **Customize → Product → Delivery expectations**.
- [ ] **YOU** Test all five product pages on your phone.

## 06 — Policies + trust

- [ ] **ADMIN + YOU** Shipping policy: fill in `policies/shipping-policy.md` → Settings → Policies.
- [ ] **ADMIN + YOU** Refund policy: fill in `policies/refund-policy.md` (written to comply with the Australian Consumer Law).
- [ ] **ADMIN** Privacy policy: Settings → Policies → **Create from template**.
- [ ] **ADMIN** Terms of service: **Create from template**, then add business name and ABN.
- [ ] **YOU** Delivery expectations: confirm dispatch time and carrier, then add them to the shipping policy and the product-page setting above.
- [ ] **ADMIN + YOU** International destinations and rates: Settings → Shipping and delivery. Make them match the shipping policy.
- [ ] **ADMIN + YOU** Duties wording: decide who pays duties (Settings → Markets / Duties and import taxes) and use the matching sentence in the shipping policy.
- [ ] **ADMIN** Contact details: Settings → Policies → Contact information, and Settings → General → store email.
- [ ] **ADMIN** Support contact: add your support email in **Customize → Theme settings → Brand → Customer support email**. It then shows in the footer and on every product page. Also create the **Contact** page (README step 4).
- [x] **DONE** The footer shows Shipping · Returns · Privacy · Terms · Contact automatically once the policies exist.

## 07 — SEO + discoverability

- [ ] **ADMIN** Store meta description and homepage title: Online Store → Preferences.
  - **Title:** Lane Change — International Street Sports | Collection 001
  - **Meta description:** Lane Change — International Street Sports. Oversized heavyweight garment-washed tees with quiet fronts and loud backs. Australian born, global minded. Shop Collection 001.
- [x] **DONE** The theme falls back to that description on any page without its own, so no page has a missing meta description.
- [x] **DONE** Product SEO (01). Collection SEO text is ready (02).
- [x] **DONE** Sitemap: Shopify generates `/sitemap.xml` automatically. Submit it in Google Search Console after launch.
- [x] **DONE** Broken links: navigation, buttons and panels never link to pages that don't exist.
- [x] **DONE** Alt text (01).
- [x] **DONE** Canonical URLs on every page. Search, cart, wishlist and the password page are marked noindex.
- [ ] **ADMIN** Remove duplicate or unused content: delete any leftover products from earlier imports, the Core Washed collection, and Shopify's sample "News" blog and pages you aren't using.

## 08 — Checkout + payments (all **YOU**, on the live store with password still on)

- [ ] Australian checkout, start to finish.
- [ ] Every payment method (Settings → Payments: Shopify Payments, Apple Pay, Google Pay, PayPal, Afterpay — whichever you enable).
- [ ] Discount codes.
- [ ] Shipping calculation, AU and international.
- [ ] Tax: GST is included in prices (Settings → Taxes and duties → "Include tax in prices" should be on).
- [ ] Order confirmation email (Settings → Notifications; add the logo there).
- [ ] Fulfil the test order, then refund it.
- [ ] Repeat one order on mobile.

> Tip: use Shopify's test mode (Settings → Payments → Shopify Payments → Test mode) for the dry runs, then place one real order and refund it.

## 09 — Inventory + fulfilment

- [ ] **YOU** Count physical stock against Shopify using `stock-count-collection-001.csv` (one row per SKU; any difference gets fixed in Shopify).
- [x] **DONE** SKU structure: `LC001-STK-BLK-M` = Collection 001 · Stacker · Black · M. Codes: STK Stacker, ANG Angel, GLB Globe, CHK Checker, PRT Portrait.
- [ ] **YOU** Weights: placeholder **300 g** per tee. Weigh one packed tee per size and update.
- [ ] **ADMIN + YOU** Package dimensions: Settings → Shipping and delivery → Packages.
- [ ] **YOU** Packaging materials ready.
- [ ] **ADMIN + YOU** Shipping labels: Shopify Shipping, Australia Post or Sendle, and a test label.
- [ ] **ADMIN** Fulfilment location: Settings → Locations, set to where stock ships from.
- [ ] **YOU** Returns process: matches the refund policy (who checks returns, where they go).
- [x] **DONE** Stock tracking: the stock-count sheet. Recount after each delivery and once a week during launch.

## 10 — Brand + creative QA

- [ ] **YOU** Confirm the approved artwork is preserved exactly. The site uses the lookbook photos as supplied; the logos are vector traces of the supplied artwork.
- [x] **DONE** No ® symbol anywhere in the theme, site or product data.
- [ ] **YOU** Stacker Tee embroidery placement matches the approved reference (production check).
- [ ] **YOU** Stacker back graphic is 45 cm at the longest point (stated in the description; confirm on the garment).
- [ ] **YOU** Stacker chest embroidery is 10 cm wide (stated in the description; confirm on the garment).
- [ ] **YOU** Neck label reference (the label close-up is the 8th photo on each product).
- [x] **DONE** Quiet front / loud back is written into every description.
- [x] **DONE** Premium streetwear tone: "gothic" wording removed from customer-facing copy, and the Hoodies placeholder dropped.

## 11 — Launch marketing (all **YOU**; outside the store build)

- [ ] The Wrong Package teaser
- [ ] Melbourne automotive campaign
- [ ] Forest automotive campaign
- [ ] Ghost mannequin teaser
- [ ] Collection 001 end card
- [ ] Instagram launch sequence
- [ ] TikTok launch sequence
- [ ] Launch captions
- [ ] Launch email: send to customers tagged `prelaunch` (the coming-soon sign-ups) with Shopify Email
- [ ] Launch-day post
- [ ] First-week content schedule
- [ ] Creator / collaboration outreach list

## 12 — Final launch test (all **YOU**)

- [ ] Place a real test order
- [ ] Full mobile shopping run
- [ ] Full desktop shopping run
- [ ] All five product pages
- [ ] Collection 001
- [ ] Navigation
- [ ] Footer
- [ ] Policies (open each link in the footer)
- [ ] Confirmation emails
- [ ] Shipping
- [ ] Inventory deducts after the order
- [ ] Analytics: Shopify Analytics, plus Google & YouTube and Meta channel apps if you advertise
- [ ] Remove placeholder content: stock 25, weight 300 g, $150 free-shipping threshold (Theme settings), social handles (Theme settings → Social media), and every [CONFIRM] in the policies
- [ ] Confirm launch date and time
- [ ] **GO LIVE:** Online Store → Preferences → untick password protection
