// Global brand + store settings. Edit here, not in components.
export const site = {
  name: 'Lane Change',
  line: 'International Street Sports',
  origin: 'AUS — Worldwide',
  est: 'Est. 2025',
  currency: 'AUD',
  description:
    'Lane Change — International Street Sports. Australian streetwear built on car culture, street sports and training. Different lanes. Same vision.',
  freeShippingThreshold: 150,
  // Point at your email platform (Klaviyo / Shopify / Mailchimp form action).
  // Left empty, the form confirms locally so the UI can be reviewed.
  newsletterEndpoint: '',
  social: {
    instagram: 'https://instagram.com/lanechange.aus',
    tiktok: 'https://tiktok.com/@lanechange.aus',
    youtube: 'https://youtube.com/@lanechange.aus',
  },
} as const;

export const primaryNav = [
  { label: 'Shop', href: '/shop', menu: [
    { label: 'All Products', href: '/shop' },
    { label: 'Tees', href: '/collections/tees' },
    { label: 'Hoodies', href: '/collections/hoodies' },
    { label: 'Wishlist', href: '/wishlist' },
  ] },
  { label: 'Collections', href: '/collections', menu: [
    { label: 'Core Washed — SS25', href: '/collections/core-washed' },
    { label: 'Tees', href: '/collections/tees' },
    { label: 'Hoodies', href: '/collections/hoodies' },
  ] },
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/journal' },
] as const;

export const footerNav = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/journal' },
  { label: 'Contact', href: '/contact' },
] as const;
