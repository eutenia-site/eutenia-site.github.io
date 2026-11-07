// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const fixtures = process.env.EUTENIA_CONTENT === 'fixtures';

export default defineConfig({
  site: process.env.SITE ?? 'https://eutenia-site.github.io',
  base: process.env.BASE ?? '/eutenia-site',
  trailingSlash: 'always',
  outDir: fixtures ? './dist-fixtures' : './dist',
  vite: { plugins: [tailwindcss()] },
});
