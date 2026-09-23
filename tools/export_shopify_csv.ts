// Export the catalogue in src/data/products.ts as a Shopify product import CSV.
//   node tools/export_shopify_csv.ts            → shopify/products.csv
// Images are referenced by public URL (Shopify downloads them during import),
// served from this GitHub repository. Override with IMAGE_BASE=https://… if you
// host them elsewhere.
import { writeFileSync } from 'node:fs';
import { products, viewLabels, viewOrder, type Product } from '../src/data/products.ts';

const IMAGE_BASE =
  process.env.IMAGE_BASE ??
  'https://raw.githubusercontent.com/angusj7000/Lane-Change/claude/lane-change-ecommerce-vpotvs/src/assets/images';
const STOCK = 25;

const header = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode',
  'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
  'SEO Title', 'SEO Description', 'Variant Image', 'Variant Weight Unit', 'Status',
];

const esc = (v: unknown) => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const html = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Body: description paragraphs, then <h6> sections that the theme turns into
// FIT / FABRIC / CARE accordions (edit them in Shopify as "Heading 6").
function body(p: Product) {
  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${html(i)}</li>`).join('')}</ul>`;
  return [
    ...p.description.map((d) => `<p>${html(d)}</p>`),
    `<h6>Fit</h6>${list(p.fit)}`,
    `<h6>Fabric</h6>${list(p.fabric)}`,
    `<h6>Care</h6>${list(p.care)}`,
  ].join('');
}

const typeOf = { tees: 'T-Shirt', hoodies: 'Hoodie', accessories: 'Cap' } as const;
const swatchTag = (sw: string) => (sw.startsWith('#') ? `swatch:${sw}` : `swatch:${sw.match(/#[0-9a-f]{6}/gi)?.join('/') ?? ''}`);

const rows: string[][] = [];
for (const p of products) {
  const images = viewOrder
    .filter((v) => p.gallery[v])
    .map((v) => ({ src: `${IMAGE_BASE}/${p.gallery[v]}.jpg`, alt: `${p.name} — ${p.colour.name} — ${viewLabels[v]}` }));
  const tags = [
    p.category,
    ...p.collections,
    `family:${p.family}`,
    swatchTag(p.colour.swatch),
    p.badge ? `badge:${p.badge}` : '',
    p.status === 'coming-soon' ? 'coming-soon' : '',
  ].filter(Boolean);
  const skuBase = `LC-${p.slug.split('-').filter((w) => !['tee', 'washed'].includes(w)).map((w) => w.slice(0, 3)).join('').toUpperCase()}`;

  const n = Math.max(p.sizes.length, images.length);
  for (let i = 0; i < n; i++) {
    const size = p.sizes[i];
    const img = images[i];
    const first = i === 0;
    const row: Record<string, unknown> = { Handle: p.slug };
    if (first) {
      Object.assign(row, {
        Title: p.name,
        'Body (HTML)': body(p),
        Vendor: 'Lane Change',
        Type: typeOf[p.category],
        Tags: tags.join(', '),
        Published: 'TRUE',
        'Option1 Name': 'Size',
        'Option2 Name': 'Color',
        'Gift Card': 'FALSE',
        'SEO Title': `${p.name} — ${p.colour.name} | Lane Change`,
        'SEO Description': `${p.blurb} International Street Sports. Australian born, global minded.`,
        Status: p.status === 'coming-soon' ? 'draft' : 'active',
      });
    }
    if (size) {
      Object.assign(row, {
        'Option1 Value': size.label,
        'Option2 Value': p.colour.name,
        'Variant SKU': `${skuBase}-${size.label.replace(/\s+/g, '').toUpperCase()}`,
        'Variant Grams': p.grams ?? 300,
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': size.available ? STOCK : 0,
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': p.price.toFixed(2),
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Weight Unit': 'g',
      });
    }
    if (img) Object.assign(row, { 'Image Src': img.src, 'Image Position': i + 1, 'Image Alt Text': img.alt });
    rows.push(header.map((h) => esc(row[h])));
  }
}

const out = [header.join(','), ...rows.map((r) => r.join(','))].join('\n') + '\n';
writeFileSync('shopify/products.csv', out);
console.log(`shopify/products.csv — ${products.length} products, ${rows.length} rows`);
