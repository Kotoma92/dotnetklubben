import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dotnetklubben.org',
  integrations: [sitemap()],
  compressHTML: true,
});
