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
  category: 'tees' | 'hoodies' | 'accessories';
  collections: string[];
  price: number;
  colour: Colourway;
  sizes: { label: string; available: boolean }[];
  /** image keys under src/assets/images; null = shoot pending */
  gallery: Partial<Record<ViewKey, string | null>>;
  badge?: string;
  status?: 'available' | 'coming-soon';
  /** shipping weight in grams (Shopify import) */
  grams?: number;
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
    grams: 300,
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

function graphicTee(slug: string, name: string, colour: Colourway, extra: Partial<Product>): Product {
  return {
    slug,
    name,
    family: slug,
    category: 'tees',
    collections: ['graphic-tees', 'tees'],
    price: 70,
    grams: 300,
    colour,
    sizes: teeSizes(),
    gallery: {},
    status: 'available',
    blurb: '',
    description: [],
    fit: teeFit,
    fabric: teeFabric.map((f) => f.replace('Screen-printed LC chest emblem. Oversized cracked-ink back graphic.', 'Screen-printed front and back graphics with a cracked-ink finish.')),
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
    grams: 900,
    colour: { name: 'Washed Black', swatch: '#232323' },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'].map((label) => ({ label, available: true })),
    gallery: {
      front: 'products/flagship-hoodie-washed-black-front',
      back: 'products/flagship-hoodie-washed-black-back',
      detail: 'products/flagship-hoodie-washed-black-detail',
    },
    status: 'available',
    badge: 'New',
    blurb: 'Heavyweight washed hoodie. Clean front, gothic Lane Change statement back.',
    description: [
      'Bigger moves. Colder days. A 450gsm brushed-back fleece hoodie, garment dyed and washed to match the core tees.',
      'Small Lane Change wordmark on the chest. Gothic LANE CHANGE, thorn emblem and International Street Sports — Designed To Win across the back.',
    ],
    fit: ['Oversized fit with dropped shoulders.', 'Double-layer hood, no drawcords. Deep kangaroo pocket.', 'Model is 183cm and wears size L.'],
    fabric: ['100% cotton 450gsm brushed fleece.', 'Garment dyed, enzyme and mineral washed.', 'Screen-printed back graphic with cracked-ink finish.'],
    care: ['Cold wash inside out.', 'Hang dry. Do not tumble dry.', 'Do not iron the print.'],
  },
  graphicTee('gothic-stack-tee-washed-black', 'Gothic Stack Tee', { name: 'Washed Black', swatch: '#2b2c2c' }, {
    gallery: {
      front: 'products/gothic-stack-tee-washed-black-front',
      back: 'products/gothic-stack-tee-washed-black-back',
      detail: 'products/gothic-stack-tee-washed-black-detail',
      fit: 'products/gothic-stack-tee-washed-black-fit',
    },
    badge: 'Style 01',
    blurb: 'Road-knot chest logo. Layered triple LANE CHANGE gothic stack across the back.',
    description: [
      'Style 01 — Gothic Stack. The Lane Change chest logo up front: arched wordmark, road-knot emblem and Drive Progress Daily.',
      'On the back: Lane Change Studios over three stacked gothic LANE CHANGE wordmarks, International Street Sports — Designed To Win, the compass star and Est. 2025, AUS — Worldwide.',
    ],
  }),
  graphicTee('worldwide-tee-washed-black', 'Worldwide Tee', { name: 'Washed Black', swatch: '#2b2c2c' }, {
    gallery: {
      front: 'products/worldwide-tee-washed-black-front',
      back: 'products/worldwide-tee-washed-black-back',
      detail: 'products/worldwide-tee-washed-black-detail',
      fit: 'products/worldwide-tee-washed-black-fit',
    },
    blurb: 'LC emblem front. Arched LANE CHANGE, thorn star and globe back — Different Lanes. Same Vision.',
    description: [
      'Small LC monogram and compass star on the chest.',
      'Across the back: arched LANE CHANGE, the thorn star and globe, International Street Sports, Est. 2025, AUS — Worldwide, signed off with Different Lanes. Same Vision.',
    ],
  }),
  graphicTee('distressed-tee-concrete-grey', 'Distressed Tee', { name: 'Concrete Grey', swatch: '#8d8c8a' }, {
    gallery: {
      front: 'products/distressed-tee-concrete-grey-front',
      back: 'products/distressed-tee-concrete-grey-back',
      detail: 'products/distressed-tee-concrete-grey-detail',
    },
    badge: 'Style 02',
    blurb: 'Minimal front, bold back. Dripping LANE CHANGE and thorn emblem in washed black ink.',
    description: [
      'Style 02 — Distressed. LC monogram and International Street Sports lockup on the chest.',
      'Oversized dripping LANE CHANGE wordmark with the thorn emblem across the back, finished with the compass star and Est. 2025.',
    ],
  }),
  graphicTee('globe-tee-washed-black', 'Globe Tee', { name: 'Washed Black', swatch: '#2b2c2c' }, {
    gallery: {
      front: 'products/globe-tee-washed-black-front',
      back: 'products/globe-tee-washed-black-back',
      detail: 'products/globe-tee-washed-black-detail',
    },
    blurb: 'LC and wordmark front. Varsity-arched LANE CHANGE over the globe on the back.',
    description: [
      'LC monogram on the right chest, Lane Change wordmark on the left.',
      'Arched LANE CHANGE over the globe with International Street Sports, Est. 2025 and three icon marks across the back.',
    ],
  }),
  graphicTee('same-roads-tee-washed-black', 'Same Roads Tee', { name: 'Washed Black', swatch: '#2b2c2c' }, {
    gallery: {
      front: 'products/same-roads-tee-washed-black-front',
      back: 'products/same-roads-tee-washed-black-back',
      detail: 'products/same-roads-tee-washed-black-detail',
    },
    blurb: 'All-over mountain road print front. Thorn star with Same Roads, Different Lanes back.',
    description: [
      'A washed mountain-pass illustration wraps the front, with the Lane Change wordmark on the chest.',
      'Back: the thorn star emblem over Same Roads, Different Lanes — International Street Sports, Est. 2025.',
    ],
  }),
  graphicTee('overpass-tee-concrete-grey', 'Overpass Tee', { name: 'Concrete Grey', swatch: '#8d8c8a' }, {
    gallery: {
      front: 'products/overpass-tee-concrete-grey-front',
      back: 'products/overpass-tee-concrete-grey-back',
      detail: 'products/overpass-tee-concrete-grey-detail',
    },
    blurb: 'Twin chest prints. Photographic overpass back print under an arched LANE CHANGE.',
    description: [
      'Lane Change wordmark and gothic tag on the chest.',
      'Across the back: arched LANE CHANGE over a black-and-white overpass photograph, International Street Sports and the compass star.',
    ],
  }),
  graphicTee('raglan-jersey-grey-black', 'Raglan Jersey', { name: 'Concrete / Black', swatch: 'linear-gradient(90deg,#8d8c8a 50%,#232323 50%)' }, {
    price: 85,
    grams: 330,
    gallery: {
      front: 'products/raglan-jersey-grey-black-front',
      back: 'products/raglan-jersey-grey-black-back',
      detail: 'products/raglan-jersey-grey-black-detail',
    },
    badge: 'New',
    blurb: 'Sports-inspired raglan with contrast black panels and piping. Gothic Lane Change front and back.',
    description: [
      'Our take on the football jersey — washed concrete body with black raglan panels, contrast piping and side inserts.',
      'Lane Change gothic chest print. Arched LANE CHANGE, thorn emblem and International Street Sports on the back.',
    ],
    fit: ['Relaxed, slightly cropped jersey fit.', 'Raglan sleeves with contrast panels.', 'Model is 183cm and wears size L.'],
    fabric: ['Heavyweight 260gsm washed cotton jersey body.', 'Contrast black raglan panels and white piping.', 'Screen-printed graphics.'],
  }),
  {
    slug: 'lc-cap-washed-black',
    name: 'LC Cap',
    family: 'lc-cap',
    category: 'accessories',
    collections: ['accessories'],
    price: 45,
    grams: 120,
    colour: { name: 'Washed Black', swatch: '#232323' },
    sizes: [{ label: 'One Size', available: true }],
    gallery: {
      front: 'products/lc-cap-washed-black-front',
      back: 'products/lc-cap-washed-black-back',
    },
    status: 'available',
    blurb: 'Washed six-panel dad cap with the embroidered LC monogram.',
    description: [
      'Six-panel unstructured cap in washed black cotton twill, curved brim.',
      'Raised LC monogram embroidery on the front. Adjustable strap with metal slider at the back.',
    ],
    fit: ['One size. Adjustable back strap.', 'Low, unstructured crown.'],
    fabric: ['100% cotton twill, garment washed.', '3D embroidered LC monogram.'],
    care: ['Spot clean only.', 'Reshape and air dry.'],
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
    slug: 'graphic-tees',
    title: 'Graphic Tees',
    season: 'Quiet front. Loud back.',
    image: 'products/gothic-stack-tee-washed-black-back',
    intro: 'Statement back graphics on the same heavyweight washed blank — gothic stacks, globes, roads and overpasses.',
  },
  {
    slug: 'hoodies',
    title: 'Hoodies',
    season: 'Bigger moves. Colder days.',
    image: 'category-hoodies',
    intro: 'Heavyweight washed fleece for early starts and late drives.',
  },
  {
    slug: 'accessories',
    title: 'Accessories',
    season: 'Finish the fit.',
    image: 'products/lc-cap-washed-black-front',
    intro: 'Caps and small goods carrying the LC monogram.',
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
