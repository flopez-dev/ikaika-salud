// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Todavía no hay dominio propio: los defaults son la copia de develop en GitHub Pages
// (https://flopez-dev.github.io/ikaika-salud/). El base path que no es la raíz es además
// lo que hace que `npm run dev`, el CI y los tests ejerciten withBase() en cada enlace
// interno. Cuando haya dominio, su despliegue construirá con SITE_URL=<dominio> BASE_PATH=/.
const site = process.env.SITE_URL ?? 'https://flopez-dev.github.io';
const base = process.env.BASE_PATH ?? '/ikaika-salud/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },

  integrations: [sitemap()],

  vite: { plugins: [tailwindcss()] },
});
