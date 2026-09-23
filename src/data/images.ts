import type { ImageMetadata } from 'astro';

// Every photo in src/assets/images is addressable by its path, e.g.
// img('products/washed-black-front'). Replace a file with real photography
// (same name) and every page that uses it updates on the next build.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

const byKey = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const key = path.replace('../assets/images/', '').replace(/\.(jpe?g|png|webp|avif)$/, '');
  byKey.set(key, mod.default);
}

export function img(key: string): ImageMetadata {
  const found = byKey.get(key);
  if (!found) throw new Error(`Missing image "${key}" in src/assets/images`);
  return found;
}

export function maybeImg(key: string): ImageMetadata | undefined {
  return byKey.get(key);
}
