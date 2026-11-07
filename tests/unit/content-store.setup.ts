import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';

/**
 * Vitest serves `astro:content` in dev mode, which reads `.astro/data-store.json`, a file only
 * `astro dev` writes. Sync the content layer (real data) and put the store where dev mode reads
 * it, so container-rendered components can query collections.
 */
export default function setup() {
  const env = { ...process.env };
  delete env.EUTENIA_CONTENT;
  execFileSync('npx', ['astro', 'sync'], { env, stdio: 'ignore' });
  mkdirSync('.astro', { recursive: true });
  copyFileSync('node_modules/.astro/data-store.json', '.astro/data-store.json');
}
