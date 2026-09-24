// Launch catalogue: the five confirmed Core Washed tees. The shape mirrors what
// a Shopify product maps to; `npm run shopify:csv` exports it as an import file.

export type ViewKey = 'front' | 'back' | 'side' | 'fit' | 'detail' | 'print' | 'fabric' | 'label';

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
  'Model is 183cm and wears size L.',
];
const teeFabric = [
  '100% cotton heavyweight jersey.',
  'Garment dyed and mineral washed for a lived-in, uneven finish.',
  'Ribbed crew neck. Woven LC neck label.',
  'Screen-printed chest emblem and oversized back graphic.',
];
const teeCare = [
  'Cold wash inside out with similar colours.',
  'Each piece is washed individually — tone and pattern will vary.',
  'Hang dry. Do not tumble dry. Do not iron the print.',
];

/** Every confirmed tee has the same lookbook set, built by tools/build_lookbook_products.py */
const lookbook = (slug: string) =>
  Object.fromEntries(
    (['front', 'back', 'side', 'fit', 'detail', 'print', 'fabric', 'label'] as ViewKey[]).map((v) => [v, `products/${slug}-${v}`]),
  ) as Record<ViewKey, string>;

function coreTee(slug: string, name: string, colour: Colourway, extra: Partial<Product>): Product {
  return {
    slug,
    name,
    family: 'core-washed-tee',
    category: 'tees',
    collections: ['core-washed', 'tees'],
    price: 70,
    grams: 300,
    colour,
    sizes: teeSizes(),
    gallery: lookbook(slug),
    status: 'available',
    blurb: '',
    description: [],
    fit: teeFit,
    fabric: teeFabric,
    care: teeCare,
    ...extra,
  };
}

export const products: Product[] = [
  coreTee('gothic-stack-tee-washed-black', 'Gothic Stack Tee', { name: 'Washed Black', swatch: '#2b2c2c' }, {
    badge: 'Flagship',
    blurb: 'LC emblem front. Layered triple LANE CHANGE gothic stack across the back.',
    description: [
      'The flagship. Washed black, cut boxy and heavy. The LC monogram and compass star sit small on the chest.',
      'On the back: International Street Sports over three stacked gothic LANE CHANGE wordmarks, International Street Sports — Designed To Win, the compass star and Est. 2025, AUS — Worldwide.',
    ],
  }),
  coreTee('compass-tee-concrete-grey', 'Compass Tee', { name: 'Concrete Grey', swatch: '#8d8c8a' }, {
    blurb: 'Arched Lane Change and compass emblem front. Dripping LANE CHANGE and angel statue back.',
    description: [
      'Concrete grey with washed black ink. Arched Lane Change wordmark and compass emblem on the chest with International Street Sports, Est. 2025.',
      'Across the back: dripping gothic LANE CHANGE over a winged statue, framed by Same Roads, Different Lanes and More Than Cars, A Mindset. International Street Sports — Designed To Win.',
    ],
  }),
  coreTee('roads-tee-forest-green', 'Roads Tee', { name: 'Washed Forest Green', swatch: '#3c4338' }, {
    blurb: 'LC emblem front. Gothic LANE CHANGE, globe and compass star back — Same Roads, Different Lanes.',
    description: [
      'Washed forest green. LC monogram and compass star on the chest.',
      'On the back: International Street Sports over the gothic LANE CHANGE wordmark, the globe and compass star, Same Roads, Different Lanes and More Than Cars, A Mindset — Designed To Win, Est. 2025.',
    ],
  }),
  coreTee('checker-tee-faded-blue', 'Checker Tee', { name: 'Faded Blue', swatch: '#46516a' }, {
    blurb: 'LC emblem front. Distressed chequered flag under LANE CHANGE back — Drive Your Own Direction.',
    description: [
      'Faded blue with cracked white ink. LC monogram and compass star on the chest.',
      'Across the back: gothic LANE CHANGE over a distressed chequered flag, Drive Your Own Direction, and a row of Lane Change marks around the globe.',
    ],
  }),
  coreTee('beyond-limits-tee-dusty-pink', 'Beyond Limits Tee', { name: 'Dusty Pink', swatch: '#b47a7c' }, {
    blurb: 'Black LC emblem front. Gothic LANE CHANGE over a portrait print back.',
    description: [
      'Dusty pink with washed black ink. LC monogram and compass star on the chest.',
      'On the back: gothic LANE CHANGE over a high-contrast portrait print, International Street Sports, Est. 2025, AUS — Worldwide.',
    ],
  }),
];

export const collections = [
  {
    slug: 'core-washed',
    title: 'Core Washed',
    season: 'SS25 — Drop 01',
    image: 'hero-campaign',
    intro: 'Five colourways. One silhouette. Heavyweight washed tees with statement backs — the first Lane Change drop.',
  },
  {
    slug: 'tees',
    title: 'Tees',
    season: 'Everyday essentials. Built different.',
    image: 'category-tees',
    intro: 'Oversized, boxy, heavyweight. Emblem on the chest, the full story on the back.',
  },
  {
    slug: 'hoodies',
    title: 'Hoodies',
    season: 'Bigger moves. Colder days.',
    image: 'category-hoodies',
    intro: 'Heavyweight washed fleece for early starts and late drives. Landing soon — join the lane to hear first.',
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
  fit: 'Fit',
  detail: 'Detail',
  print: 'Print',
  fabric: 'Fabric',
  label: 'Label',
};
export const viewOrder: ViewKey[] = ['front', 'back', 'side', 'fit', 'detail', 'print', 'fabric', 'label'];

export const formatPrice = (n: number) => `$${n.toFixed(n % 1 ? 2 : 0)} AUD`;
