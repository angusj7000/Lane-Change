// Collection 001 catalogue: the five launch tees. The shape mirrors what a
// Shopify product maps to; `npm run shopify:csv` exports it as an import file.
//
// Handles (slugs) are the live product URLs — keep them stable. Names, copy,
// SEO and SKUs can change freely.

export type ViewKey = 'front' | 'back' | 'side' | 'fit' | 'detail' | 'print' | 'fabric' | 'label';

export interface Colourway {
  name: string;
  swatch: string; // CSS colour used for the swatch dot only
}

export interface Product {
  slug: string;
  name: string;
  /** short SKU code, e.g. STK → LC001-STK-BLK-M */
  sku: string;
  family: string; // products in the same family are colourways of each other
  category: 'tees' | 'hoodies' | 'accessories';
  collections: string[];
  price: number;
  colour: Colourway & { code: string };
  sizes: { label: string; available: boolean }[];
  /** image keys under src/assets/images */
  gallery: Partial<Record<ViewKey, string | null>>;
  /** accurate alt text per view; falls back to a generated description */
  alts?: Partial<Record<ViewKey, string>>;
  badge?: string;
  status?: 'available' | 'coming-soon';
  /** shipping weight in grams (Shopify import) — confirm before launch */
  grams?: number;
  blurb: string;
  /** DETAILS accordion: the garment and its artwork */
  description: string[];
  /** spec bullets shown under DETAILS */
  fabric: string[];
  fit: string[];
  care: string[];
  seoTitle: string;
  seoDescription: string;
}

/** Shopify Standard Product Taxonomy category for the CSV "Product Category" column */
export const shopifyCategory = {
  tees: 'Apparel & Accessories > Clothing > Clothing Tops > T-Shirts',
  hoodies: 'Apparel & Accessories > Clothing > Activewear > Activewear Sweatshirts & Hoodies',
  accessories: 'Apparel & Accessories > Clothing Accessories > Hats',
} as const;

const teeSizes = (soldOut: string[] = []) =>
  ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((label) => ({ label, available: !soldOut.includes(label) }));

const teeFit = [
  'Oversized, boxy fit with dropped shoulders.',
  'Take your usual size for the intended oversized drape, or size down for a closer fit.',
  'Model is 183cm and wears size L.',
];
const teeFabric = [
  'Heavyweight garment-washed cotton.',
  'Each piece is washed individually, so tone and texture vary slightly.',
  'Woven LC neck label.',
];
const teeCare = [
  'Cold wash inside out with similar colours.',
  'Hang dry. Do not tumble dry.',
  'Do not iron directly on the artwork.',
];

/** Gallery order: front and back first, then fit/model, then close-ups. */
const lookbook = (slug: string) =>
  Object.fromEntries(
    (['front', 'back', 'fit', 'side', 'detail', 'print', 'fabric', 'label'] as ViewKey[]).map((v) => [v, `products/${slug}-${v}`]),
  ) as Record<ViewKey, string>;

function tee(slug: string, name: string, sku: string, colour: Colourway & { code: string }, extra: Partial<Product>): Product {
  return {
    slug,
    name,
    sku,
    family: 'collection-001-tee',
    category: 'tees',
    collections: ['collection-001', 'tees'],
    price: 70,
    grams: 300,
    colour,
    sizes: teeSizes(),
    gallery: lookbook(slug),
    status: 'available',
    blurb: '',
    description: [],
    fabric: teeFabric,
    fit: teeFit,
    care: teeCare,
    seoTitle: `${name} — ${colour.name} | Lane Change`,
    seoDescription: '',
    ...extra,
  };
}

const modelAlts = (name: string, colour: string, back: string) => ({
  front: `Model wearing the Lane Change ${name} in ${colour}, front view, with oversized fit and black cargo pants.`,
  back: `Model from behind wearing the ${colour} ${name}, showing the back artwork: ${back}.`,
  fit: `Three-quarter view of the ${name} on a 183cm model wearing size L, showing the oversized boxy fit.`,
  side: `Side profile of the ${name} showing the dropped shoulders and boxy length.`,
  fabric: `Close-up of the garment-washed ${colour.toLowerCase()} cotton and shoulder seam on the ${name}.`,
  label: `Woven Lane Change neck label with the LC monogram inside the ${name}.`,
});

export const products: Product[] = [
  tee('gothic-stack-tee-washed-black', 'Stacker Tee', 'STK', { name: 'Washed Black', code: 'BLK', swatch: '#2b2c2c' }, {
    badge: 'Flagship',
    blurb: 'Raised 3D embroidered LC emblem on the chest. Stacked LANE CHANGE wordmarks across the back.',
    description: [
      'The Collection 001 flagship. 260 GSM heavyweight garment-washed cotton in washed black, cut oversized and boxy.',
      'Quiet front: the LC monogram and compass star in raised 3D embroidery, 10 cm wide on the left chest.',
      'Loud back: International Street Sports over three stacked LANE CHANGE wordmarks, Designed To Win, the compass star and Est. 2025, AUS — Worldwide. 45 cm at its longest point.',
    ],
    fabric: [
      '260 GSM heavyweight garment-washed cotton.',
      'Raised 3D embroidery.',
      'Each piece is washed individually, so tone and texture vary slightly.',
      'Woven LC neck label.',
    ],
    seoDescription:
      'Stacker Tee in washed black: 260 GSM heavyweight garment-washed cotton, raised 3D embroidered chest emblem and a 45 cm stacked LANE CHANGE back graphic.',
    alts: {
      ...modelAlts('Stacker Tee', 'Washed Black', 'three stacked LANE CHANGE wordmarks with International Street Sports and Designed To Win'),
      detail: 'Close-up of the raised 3D embroidered LC monogram and compass star on the chest of the washed black Stacker Tee.',
      print: 'Close-up of the Stacker Tee back graphic: three stacked LANE CHANGE wordmarks, International Street Sports, Designed To Win, Est. 2025.',
    },
  }),
  tee('compass-tee-concrete-grey', 'Angel Tee', 'ANG', { name: 'Concrete Grey', code: 'GRY', swatch: '#8d8c8a' }, {
    blurb: 'Arched Lane Change and compass emblem on the chest. LANE CHANGE over a classical angel statue on the back.',
    description: [
      'Heavyweight garment-washed cotton in concrete grey with washed black artwork, cut oversized and boxy.',
      'Quiet front: an arched Lane Change wordmark over the compass emblem, with International Street Sports, Est. 2025.',
      'Loud back: LANE CHANGE over a classical winged angel statue, framed by Same Roads, Different Lanes and More Than Cars, A Mindset. International Street Sports — Designed To Win.',
    ],
    seoDescription:
      'Angel Tee in concrete grey: oversized heavyweight garment-washed cotton with a compass chest emblem and a LANE CHANGE angel statue back graphic.',
    alts: {
      ...modelAlts('Angel Tee', 'Concrete Grey', 'LANE CHANGE over a winged angel statue'),
      detail: 'Close-up of the arched Lane Change wordmark and compass emblem on the chest of the concrete grey Angel Tee.',
      print: 'Close-up of the Angel Tee back graphic: LANE CHANGE over a winged angel statue with Same Roads, Different Lanes and More Than Cars, A Mindset.',
    },
  }),
  tee('roads-tee-forest-green', 'Globe Tee', 'GLB', { name: 'Washed Forest Green', code: 'GRN', swatch: '#3c4338' }, {
    blurb: 'LC emblem on the chest. LANE CHANGE, the globe and compass star on the back.',
    description: [
      'Heavyweight garment-washed cotton in washed forest green, cut oversized and boxy.',
      'Quiet front: the LC monogram and compass star on the left chest.',
      'Loud back: International Street Sports over the LANE CHANGE wordmark, the globe and compass star, Same Roads, Different Lanes and More Than Cars, A Mindset. Designed To Win, Est. 2025.',
    ],
    seoDescription:
      'Globe Tee in washed forest green: oversized heavyweight garment-washed cotton with an LC chest emblem and a LANE CHANGE globe back graphic. Collection 001.',
    alts: {
      ...modelAlts('Globe Tee', 'Washed Forest Green', 'LANE CHANGE over the globe and compass star'),
      detail: 'Close-up of the LC monogram and compass star on the chest of the washed forest green Globe Tee.',
      print: 'Close-up of the Globe Tee back graphic: LANE CHANGE over the globe and compass star with Same Roads, Different Lanes.',
    },
  }),
  tee('checker-tee-faded-blue', 'Checker Tee', 'CHK', { name: 'Faded Blue', code: 'BLU', swatch: '#46516a' }, {
    blurb: 'LC emblem on the chest. A distressed chequered flag under LANE CHANGE on the back.',
    description: [
      'Heavyweight garment-washed cotton in faded blue with cracked white artwork, cut oversized and boxy.',
      'Quiet front: the LC monogram and compass star on the left chest.',
      'Loud back: LANE CHANGE over a distressed chequered flag, Drive Your Own Direction, and a row of Lane Change marks around the globe.',
    ],
    seoDescription:
      'Checker Tee in faded blue: oversized heavyweight garment-washed cotton with an LC chest emblem and a chequered flag back graphic. Drive your own direction.',
    alts: {
      ...modelAlts('Checker Tee', 'Faded Blue', 'LANE CHANGE over a distressed chequered flag'),
      detail: 'Close-up of the white LC monogram and compass star on the chest of the faded blue Checker Tee.',
      print: 'Close-up of the Checker Tee back graphic: LANE CHANGE over a distressed chequered flag with Drive Your Own Direction.',
    },
  }),
  tee('beyond-limits-tee-dusty-pink', 'Portrait Tee', 'PRT', { name: 'Dusty Pink', code: 'PNK', swatch: '#b47a7c' }, {
    blurb: 'Black LC emblem on the chest. LANE CHANGE over a portrait print on the back.',
    description: [
      'Heavyweight garment-washed cotton in dusty pink with washed black artwork, cut oversized and boxy.',
      'Quiet front: the LC monogram and compass star on the left chest.',
      'Loud back: LANE CHANGE over a high-contrast portrait print, International Street Sports, Est. 2025, AUS — Worldwide.',
    ],
    seoDescription:
      'Portrait Tee in dusty pink: oversized heavyweight garment-washed cotton with a black LC chest emblem and a LANE CHANGE portrait back print. Collection 001.',
    alts: {
      ...modelAlts('Portrait Tee', 'Dusty Pink', 'LANE CHANGE over a high-contrast portrait print'),
      detail: 'Close-up of the black LC monogram and compass star on the chest of the dusty pink Portrait Tee.',
      print: 'Close-up of the Portrait Tee back graphic: LANE CHANGE over a high-contrast portrait print with International Street Sports.',
    },
  }),
];

export const collections = [
  {
    slug: 'collection-001',
    title: 'Collection 001',
    season: 'The first drop',
    image: 'hero-campaign',
    intro:
      'Five heavyweight garment-washed tees. Quiet fronts, loud backs. The first Lane Change collection — International Street Sports, built in Australia for the world.',
    seoTitle: 'Collection 001 — Oversized Heavyweight Tees | Lane Change',
    seoDescription:
      'Lane Change Collection 001: five oversized heavyweight garment-washed tees — Stacker, Angel, Globe, Checker and Portrait. International Street Sports. Australian born, global minded.',
  },
  {
    slug: 'tees',
    title: 'Tees',
    season: 'Quiet front. Loud back.',
    image: 'category-tees',
    intro: 'Oversized, boxy, heavyweight. Emblem on the chest, the full story on the back.',
    seoTitle: 'Oversized Heavyweight Tees | Lane Change',
    seoDescription: 'Oversized heavyweight garment-washed tees from Lane Change. International Street Sports.',
  },
] as const;

export const featuredSlugs = products.filter((p) => p.collections.includes('collection-001')).map((p) => p.slug);

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const colourwaysOf = (p: Product) => products.filter((x) => x.family === p.family);
export const inCollection = (slug: string) => products.filter((p) => p.collections.includes(slug));

export const viewLabels: Record<ViewKey, string> = {
  front: 'Front',
  back: 'Back',
  fit: 'Fit',
  side: 'Side',
  detail: 'Chest detail',
  print: 'Back print',
  fabric: 'Fabric',
  label: 'Label',
};
export const viewOrder: ViewKey[] = ['front', 'back', 'fit', 'side', 'detail', 'print', 'fabric', 'label'];

export const altFor = (p: Product, v: ViewKey) => p.alts?.[v] ?? `${p.name} in ${p.colour.name} — ${viewLabels[v].toLowerCase()}.`;

export const skuFor = (p: Product, size: string) => `LC001-${p.sku}-${p.colour.code}-${size.replace(/\s+/g, '').toUpperCase()}`;

export const formatPrice = (n: number) => `$${n.toFixed(n % 1 ? 2 : 0)} AUD`;
