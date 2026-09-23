// Placeholder catalogue for launch. Shape mirrors what a Shopify Storefront
// API product maps to, so this file can later be swapped for live data.

export type ViewKey = 'front' | 'back' | 'side' | 'detail' | 'fabric' | 'fit';

export interface Colourway {
  name: string;
  swatch: string; // CSS colour used for the swatch dot only
}

export interface Product {
  slug: string;
  name: string;
  family: string; // products in the same family are colourways of each other
  category: 'tees' | 'hoodies';
  collections: string[];
  price: number;
  colour: Colourway;
  sizes: { label: string; available: boolean }[];
  /** image keys under src/assets/images; null = shoot pending */
  gallery: Partial<Record<ViewKey, string | null>>;
  badge?: string;
  status?: 'available' | 'coming-soon';
  blurb: string;
  description: string[];
  fit: string[];
  fabric: string[];
  care: string[];
}

const teeSizes = (soldOut: string[] = []) =>
  ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((label) => ({ label, available: !soldOut.includes(label) }));

const teeFit = [
  'Oversized, boxy fit — take your usual size for the intended drape.',
  'Dropped shoulders, wide short sleeves, cropped straight hem.',
  'Model is 183cm / 78kg and wears size L.',
];
const teeFabric = [
  '100% combed cotton, 280gsm heavyweight jersey.',
  'Garment dyed and mineral washed for a lived-in, uneven finish.',
  'Thick 3cm ribbed neck with tape-reinforced shoulders.',
  'Screen-printed LC chest emblem. Oversized cracked-ink back graphic.',
];
const teeCare = [
  'Cold wash inside out with similar colours.',
  'Each piece is washed individually — tone and pattern will vary.',
  'Hang dry. Do not tumble dry. Do not iron the print.',
];

function washedTee(
  slug: string,
  name: string,
  colour: Colourway,
  image: string,
  extra: Partial<Product> = {},
): Product {
  return {
    slug,
    name,
    family: 'core-washed-tee',
    category: 'tees',
    collections: ['core-washed', 'tees'],
    price: 70,
    colour,
    sizes: teeSizes(),
    gallery: {
      front: `products/${image}-front`,
      back: `products/${image}-back`,
      side: null,
      detail: `products/${image}-detail`,
      fabric: `products/${image}-fabric`,
      fit: 'hero-campaign-mobile',
    },
    status: 'available',
    blurb: 'Oversized heavyweight tee. LC emblem front, flagship Lane Change graphic back.',
    description: [
      `The ${name} in ${colour.name.toLowerCase()} — our core silhouette. Cut boxy and heavy, washed until it looks like it has already done the miles.`,
      'Small LC emblem and compass star on the chest. Full flagship graphic across the back: International Street Sports, Designed To Win.',
    ],
    fit: teeFit,
    fabric: teeFabric,
    care: teeCare,
    ...extra,
  };
}

export const products: Product[] = [
  washedTee('global-tee-washed-black', 'Global Tee', { name: 'Washed Black', swatch: '#2b2c2c' }, 'washed-black', {
    badge: 'Flagship',
  }),
  washedTee('compass-tee-concrete-grey', 'Compass Tee', { name: 'Concrete Grey', swatch: '#8d8c8a' }, 'concrete-grey', {
    sizes: teeSizes(['XS']),
  }),
  washedTee('roads-tee-forest-green', 'Roads Tee', { name: 'Washed Forest Green', swatch: '#3c4338' }, 'forest-green'),
  washedTee('checker-tee-faded-blue', 'Checker Tee', { name: 'Faded Blue', swatch: '#46516a' }, 'faded-blue', {
    sizes: teeSizes(['XXL']),
  }),
  washedTee('beyond-limits-tee-dusty-pink', 'Beyond Limits Tee', { name: 'Dusty Pink', swatch: '#b47a7c' }, 'dusty-pink', {
    badge: 'Low stock',
    sizes: teeSizes(['XS', 'S']),
  }),
  {
    slug: 'flagship-hoodie-washed-black',
    name: 'Flagship Hoodie',
    family: 'flagship-hoodie',
    category: 'hoodies',
    collections: ['hoodies'],
    price: 130,
    colour: { name: 'Washed Black', swatch: '#232323' },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'].map((label) => ({ label, available: false })),
    gallery: { back: 'category-hoodies', front: null, side: null, detail: null, fabric: null, fit: null },
    status: 'coming-soon',
    badge: 'Coming soon',
    blurb: 'Heavyweight washed hoodie with the tonal Lane Change back graphic.',
    description: [
      'Bigger moves. Colder days. A 450gsm brushed-back fleece hoodie, garment dyed and washed to match the core tees.',
      'Tonal LANE CHANGE gothic graphic across the back, International Street Sports above.',
    ],
    fit: ['Oversized fit with dropped shoulders.', 'Double-layer hood, no drawcords. Deep kangaroo pocket.'],
    fabric: ['100% cotton 450gsm brushed fleece.', 'Garment dyed, enzyme and mineral washed.'],
    care: ['Cold wash inside out.', 'Hang dry. Do not tumble dry.'],
  },
];

export const collections = [
  {
    slug: 'core-washed',
    title: 'Core Washed',
    season: 'SS25 — Drop 01',
    image: 'hero-campaign',
    intro: 'Five colourways. One silhouette. Heavyweight washed tees built to be worn in — the foundation of Lane Change.',
  },
  {
    slug: 'tees',
    title: 'Tees',
    season: 'Everyday essentials. Built different.',
    image: 'category-tees',
    intro: 'Oversized, boxy, 280gsm. Emblem on the chest, the full story on the back.',
  },
  {
    slug: 'hoodies',
    title: 'Hoodies',
    season: 'Bigger moves. Colder days.',
    image: 'category-hoodies',
    intro: 'Heavyweight washed fleece for early starts and late drives. Landing winter 2025.',
  },
] as const;

export const featuredSlugs = products.filter((p) => p.family === 'core-washed-tee').map((p) => p.slug);

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const colourwaysOf = (p: Product) => products.filter((x) => x.family === p.family);
export const inCollection = (slug: string) => products.filter((p) => p.collections.includes(slug));

export const viewLabels: Record<ViewKey, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
  detail: 'Detail',
  fabric: 'Fabric',
  fit: 'Fit',
};
export const viewOrder: ViewKey[] = ['front', 'back', 'side', 'detail', 'fabric', 'fit'];

export const formatPrice = (n: number) => `$${n.toFixed(n % 1 ? 2 : 0)} AUD`;
