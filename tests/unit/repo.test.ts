import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, test } from 'vitest';
import { parse } from 'yaml';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('DATA-03', () => {
  test('DATA-03 every placeholder file is listed in PLACEHOLDERS.md', () => {
    const manifest = readFileSync('PLACEHOLDERS.md', 'utf8');
    const files = walk('public/placeholders');
    expect(files.length).toBeGreaterThan(0);
    const missing = files.filter(
      (f) => !manifest.includes(`\`${relative('.', f).replaceAll('\\', '/')}\``),
    );
    expect(missing).toEqual([]);
  });

  test('every product and contractor asset exists under public/', () => {
    const data = ['products', 'press']
      .map((name) => readFileSync(`src/content/data/${name}.json`, 'utf8'))
      .join('\n');
    const paths = [...data.matchAll(/"((?:placeholders|produtos|midia)\/[^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.filter((p) => !existsSync(join('public', p)))).toEqual([]);
  });
});

describe('DEPLOY-01', () => {
  type Step = {
    uses?: string;
    run?: string;
    with?: Record<string, unknown>;
    env?: Record<string, string>;
  };
  type Job = {
    needs?: string | string[];
    environment?: { name: string };
    permissions?: Record<string, string>;
    steps: Step[];
  };

  test('DEPLOY-01 workflow deploys on push to main and daily 09:00 UTC', () => {
    const wf = parse(readFileSync('.github/workflows/deploy.yml', 'utf8'));
    expect(wf.on.push.branches).toEqual(['main']);
    expect(wf.on).toHaveProperty('workflow_dispatch');
    expect(wf.on.schedule).toEqual([{ cron: '0 9 * * *' }]);
    expect(wf.permissions).toEqual({ contents: 'read', pages: 'write', 'id-token': 'write' });
    expect(wf.concurrency.group).toBe('pages');

    const build: Job = wf.jobs.build;
    const runs = build.steps.map((s) => s.run).filter(Boolean);
    expect(runs).toEqual([
      'npm ci',
      'npx vitest run --project unit',
      'node scripts/update-stats.mjs',
      'npm run build',
    ]);
    const setupNode = build.steps.find((s) => s.uses?.startsWith('actions/setup-node@'));
    expect(setupNode?.with).toMatchObject({ 'node-version': 24, cache: 'npm' });
    const upload = build.steps.find((s) => s.uses?.startsWith('actions/upload-pages-artifact@'));
    expect(upload?.with).toEqual({ path: 'dist' });
    expect(build.steps.find((s) => s.run === 'npm run build')?.env).toEqual({
      SITE: 'https://eutenia.com.br',
      BASE: '/',
    });
    expect(readFileSync('public/CNAME', 'utf8').trim()).toBe('eutenia.com.br');
    // Tests run before the build, the build before the upload.
    const order = (pred: (s: Step) => boolean) => build.steps.findIndex(pred);
    expect(order((s) => s.run === 'npx vitest run --project unit')).toBeLessThan(
      order((s) => s.run === 'npm run build'),
    );
    expect(order((s) => s.run === 'npm run build')).toBeLessThan(build.steps.indexOf(upload!));

    const deploy: Job = wf.jobs.deploy;
    expect(deploy.needs).toBe('build');
    expect(deploy.environment?.name).toBe('github-pages');
    expect(deploy.steps.some((s) => s.uses?.startsWith('actions/deploy-pages@'))).toBe(true);
    const persist: Job = wf.jobs['persist-stats'];
    expect(persist.needs).toEqual(['build', 'deploy']);
    expect(persist.permissions).toEqual({ contents: 'write' });
    expect(persist.steps.find((s) => s.run === 'node scripts/persist-stats.mjs')?.env).toEqual({
      UPDATED_STATS: '${{ needs.build.outputs.stats }}',
    });
    expect(build.steps.some((s) => s.uses?.startsWith('actions/cache@'))).toBe(false);
  });
});

describe('DEPLOY-02', () => {
  test('DEPLOY-02 README covers run, data, form endpoint, store url, base path', () => {
    const readme = readFileSync('README.md', 'utf8');
    // Local run and tests
    for (const cmd of [
      'npm install',
      'npm run dev',
      'npm run build',
      'npm test',
      'npx playwright test',
      'npm run captures',
      'npx lhci autorun',
      'CHROME_PATH',
    ])
      expect(readme, cmd).toContain(cmd);
    // Every data file, by path
    for (const name of ['releases', 'videos', 'shows', 'products', 'press', 'vip', 'stats'])
      expect(readme, name).toContain(`src/content/data/${name}.json`);
    expect(readme).toContain('src/config/site.json');
    // Fields an editor must know
    for (const field of ['precoCentavos', 'ingressoUrl', 'status', 'destaque', 'faixas', 'icone'])
      expect(readme, field).toContain(`\`${field}\``);
    // Optional sections from the examples folder
    expect(readme).toContain('src/content/_exemplos/');
    // Site configuration
    for (const key of [
      'formEndpoint',
      'Formspree',
      'newsletterEndpoint',
      'votoCidadeEndpoint',
      'lojaUrl',
    ])
      expect(readme, key).toContain(key);
    // Base path and domain
    for (const text of ['`BASE`', '`SITE`', 'public/CNAME', 'BASE: /', 'eutenia.com.br'])
      expect(readme, text).toContain(text);
    // Deploy: push to main, daily rebuild, Pages source
    expect(readme).toContain('main');
    expect(readme).toMatch(/06:00 de Brasília/);
    expect(readme).toContain('09:00 UTC');
    expect(readme).toContain('GitHub Actions');
    // Placeholders and Spotify links
    expect(readme).toContain('PLACEHOLDERS.md');
    expect(readme).toMatch(/gerad[ao]s? por IA/);
    expect(readme).toContain('links.spotify');
    expect(readme).toContain('spotifyEmbed');
  });
});
