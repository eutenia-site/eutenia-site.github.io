import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { persistStats } from '../../scripts/persist-stats.mjs';

const directories: string[] = [];
const original = [{ id: 'youtube_views', valor: '+1.7M', rotulo: 'Views Youtube' }];
const updated = [{ ...original[0], valor: '+1.8M' }];
const file = 'src/content/data/stats.json';
function git(cwd: string, ...args: string[]) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function identity(cwd: string) {
  git(cwd, 'config', 'user.name', 'Test');
  git(cwd, 'config', 'user.email', 'test@example.com');
  git(cwd, 'config', 'core.autocrlf', 'false');
}
function setup() {
  const root = mkdtempSync(join(tmpdir(), 'eutenia-persist-'));
  directories.push(root);
  const remote = join(root, 'remote.git');
  const cwd = join(root, 'repo');
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  mkdirSync(cwd);
  git(cwd, 'init', '--initial-branch=main');
  identity(cwd);
  mkdirSync(join(cwd, 'src/content/data'), { recursive: true });
  writeFileSync(join(cwd, file), JSON.stringify(original, null, 2) + '\n');
  writeFileSync(join(cwd, 'README.md'), 'Preserve this file.\n');
  git(cwd, 'add', '.');
  git(cwd, 'commit', '-m', 'Initial');
  git(cwd, 'remote', 'add', 'origin', remote);
  git(cwd, 'push', '-u', 'origin', 'main');
  return {
    cwd,
    remote,
    root,
    sourceSha: git(cwd, 'rev-parse', 'HEAD'),
    log: { info: vi.fn(), warn: vi.fn() },
  };
}
afterEach(() => {
  for (const dir of directories.splice(0)) {
    if (!dir.startsWith(join(tmpdir(), 'eutenia-persist-')))
      throw new Error('Unexpected test directory');
    rmSync(dir, { recursive: true, force: true });
  }
});

test('pushes only published stats, even if another file is staged', () => {
  const options = setup();
  writeFileSync(join(options.cwd, 'README.md'), 'Unrelated staged edit.\n');
  git(options.cwd, 'add', 'README.md');
  expect(persistStats({ ...options, statsJson: JSON.stringify(updated) })).toBe('saved');
  expect(git(options.cwd, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD')).toBe(file);
  expect(
    JSON.parse(git(options.root, '--git-dir', options.remote, 'show', `main:${file}`)),
  ).toEqual(updated);
  expect(git(options.root, '--git-dir', options.remote, 'show', 'main:README.md')).toBe(
    'Preserve this file.',
  );
});

test('identical values do not generate another commit', () => {
  const options = setup();
  expect(persistStats({ ...options, statsJson: JSON.stringify(original) })).toBe('unchanged');
  expect(git(options.cwd, 'rev-parse', 'HEAD')).toBe(options.sourceSha);
});

test('does not overwrite main when a user pushes during deployment', () => {
  const options = setup();
  const other = join(options.root, 'other');
  git(options.root, 'clone', options.remote, other);
  identity(other);
  writeFileSync(join(other, file), JSON.stringify([{ ...original[0], valor: '+2.0M' }]));
  git(other, 'add', file);
  git(other, 'commit', '-m', 'User edit');
  git(other, 'push', 'origin', 'main');
  const remoteHead = git(other, 'rev-parse', 'HEAD');
  expect(persistStats({ ...options, statsJson: JSON.stringify(updated) })).toBe('stale');
  expect(git(options.root, '--git-dir', options.remote, 'rev-parse', 'main')).toBe(remoteHead);
  expect(JSON.parse(readFileSync(join(options.cwd, file), 'utf8'))).toEqual(original);
});
