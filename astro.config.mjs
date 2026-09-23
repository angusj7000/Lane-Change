// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lanechange.com.au',
  trailingSlash: 'ignore',
  image: {
    // campaign photography is served responsively from src/assets/images
    responsiveStyles: false,
  },
  build: { inlineStylesheets: 'auto' },
});
