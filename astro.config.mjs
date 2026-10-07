// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lanechange.com.au',
  trailingSlash: 'ignore',
  // old collection URL from before the Collection 001 rename
  redirects: { '/collections/core-washed': '/collections/collection-001' },
  image: {
    // campaign photography is served responsively from src/assets/images
    responsiveStyles: false,
  },
  build: { inlineStylesheets: 'auto' },
});
