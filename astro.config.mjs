// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const fixtures = process.env.EUTENIA_CONTENT === 'fixtures';

export default defineConfig({
  site: process.env.SITE ?? 'https://eutenia.com.br',
  base: process.env.BASE ?? '/',
  trailingSlash: 'always',
  outDir: fixtures ? './dist-fixtures' : './dist',
  vite: { plugins: [tailwindcss()] },
});
