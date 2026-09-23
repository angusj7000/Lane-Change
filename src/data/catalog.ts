import { getImage } from 'astro:assets';
import { products, formatPrice } from './products';
import { maybeImg } from './images';

export interface ClientProduct {
  slug: string;
  name: string;
  colour: string;
  price: number;
  priceLabel: string;
  thumb: string;
  category: string;
  status: string;
  keywords: string;
}

/** Compact catalogue shipped to the browser for cart, wishlist and search. */
export async function clientCatalog(): Promise<ClientProduct[]> {
  return Promise.all(
    products.map(async (p) => {
      const key = p.gallery.front ?? p.gallery.back;
      const src = key ? maybeImg(key) : undefined;
      const thumb = src ? (await getImage({ src, width: 320, format: 'webp', quality: 72 })).src : '';
      return {
        slug: p.slug,
        name: p.name,
        colour: p.colour.name,
        price: p.price,
        priceLabel: formatPrice(p.price),
        thumb,
        category: p.category,
        status: p.status ?? 'available',
        keywords: [p.name, p.colour.name, p.category, p.family, p.blurb].join(' ').toLowerCase(),
      };
    }),
  );
}
