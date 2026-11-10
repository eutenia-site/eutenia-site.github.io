import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Commit only the statistics published by this run, without overwriting a newer main. */
export function persistStats({
  cwd = process.cwd(),
  statsJson = process.env.UPDATED_STATS,
  sourceSha = process.env.GITHUB_SHA,
  log = { info: console.info, warn: console.warn },
} = {}) {
  if (!statsJson || !sourceSha) throw new Error('Missing published statistics or source commit');
  const stats = JSON.parse(statsJson);
  if (
    !Array.isArray(stats) ||
    !stats.every(
      (stat) =>
        stat &&
        typeof stat.id === 'string' &&
        typeof stat.valor === 'string' &&
        typeof stat.rotulo === 'string',
    )
  )
    throw new Error('Invalid published statistics');
  const file = 'src/content/data/stats.json';
  const target = join(cwd, file);
  if (JSON.stringify(JSON.parse(readFileSync(target, 'utf8'))) === JSON.stringify(stats)) {
    log.info('Statistics unchanged; no commit needed.');
    return 'unchanged';
  }
  const git = (args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  if (git(['rev-parse', 'HEAD']) !== sourceSha) throw new Error('Unexpected checkout commit');
  git(['fetch', 'origin', 'main']);
  if (git(['rev-parse', 'FETCH_HEAD']) !== sourceSha) {
    log.warn(
      '::notice::Main advanced during deployment; leaving newer edits intact. The next deployment will refresh statistics.',
    );
    return 'stale';
  }
  writeFileSync(target, JSON.stringify(stats, null, 2) + '\n');
  git(['config', 'user.name', 'github-actions[bot]']);
  git(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  git(['add', '--', file]);
  git(['commit', '--only', '-m', 'chore: update public statistics', '--', file]);
  try {
    git(['push', 'origin', 'HEAD:refs/heads/main']);
  } catch {
    throw new Error(
      'GitHub rejected the statistics commit. Check contents:write and main branch rules, or a concurrent push. The site has already been deployed.',
    );
  }
  log.info('Published statistics saved to stats.json in main.');
  return 'saved';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) persistStats();
