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
    const missing = files.filter((f) => !manifest.includes(`\`${relative('.', f)}\``));
    expect(missing).toEqual([]);
  });

  test('every placeholder path in the data files exists under public/', () => {
    const data = ['products', 'wallpapers', 'press', 'fan-kit']
      .map((name) => readFileSync(`src/content/data/${name}.json`, 'utf8'))
      .join('\n');
    const paths = [...data.matchAll(/"(placeholders\/[^"]+)"/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.filter((p) => !existsSync(join('public', p)))).toEqual([]);
  });
});

describe('DEPLOY-01', () => {
  type Step = { uses?: string; run?: string; with?: Record<string, unknown> };
  type Job = { needs?: string; environment?: { name: string }; steps: Step[] };

  test('DEPLOY-01 workflow deploys on push to main and daily 09:00 UTC', () => {
    const wf = parse(readFileSync('.github/workflows/deploy.yml', 'utf8'));
    expect(wf.on.push.branches).toEqual(['main']);
    expect(wf.on).toHaveProperty('workflow_dispatch');
    expect(wf.on.schedule).toEqual([{ cron: '0 9 * * *' }]);
    expect(wf.permissions).toEqual({ contents: 'read', pages: 'write', 'id-token': 'write' });
    expect(wf.concurrency.group).toBe('pages');

    const build: Job = wf.jobs.build;
    const runs = build.steps.map((s) => s.run).filter(Boolean);
    expect(runs).toEqual(['npm ci', 'npx vitest run --project unit', 'npm run build']);
    const setupNode = build.steps.find((s) => s.uses?.startsWith('actions/setup-node@'));
    expect(setupNode?.with).toMatchObject({ 'node-version': 24, cache: 'npm' });
    const upload = build.steps.find((s) => s.uses?.startsWith('actions/upload-pages-artifact@'));
    expect(upload?.with).toEqual({ path: 'dist' });
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
    for (const name of [
      'releases',
      'videos',
      'shows',
      'products',
      'wallpapers',
      'press',
      'fan-kit',
      'mural',
      'vip',
      'stats',
    ])
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
      'telegramUrl',
    ])
      expect(readme, key).toContain(key);
    // Base path and domain
    for (const text of ['`BASE`', '`SITE`', 'public/CNAME', 'BASE: /', 'eutenia.net'])
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
