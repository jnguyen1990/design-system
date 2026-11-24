#!/usr/bin/env node
// Pin a release: copy the files apps load, exactly as they are in a commit,
// to v/<short-sha>/ with a manifest of sha384 integrity hashes, and point
// v/current.json at it. The unversioned files at the root keep working
// (no-cache, always latest); a versioned path never changes once published,
// so _headers serves v/* as immutable for a year and an app can pin one
// release and verify it with integrity="…".
//
//   mise exec node@22 -- node scripts/release.mjs          # release HEAD
//   mise exec node@22 -- node scripts/release.mjs <rev>    # release another commit
//
// Then commit v/ ("Release <sha>") and push it with (or after) the change.
// Old releases are kept: an app may still pin one. Delete a v/<sha>/ only
// once no app's personal_app config names it.
//
// The copies are byte-for-byte the commit's files, with one rewrite: the
// stylesheet's relative font URLs (fonts/…) become ../../fonts/… so that
// v/<sha>/design-system.css still finds the shared, unversioned fonts/ (font
// files are content-stable and not part of a release).

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Keep in step with PersonalAppClient::Configuration::DS_FILES in the gem.
const CORE_FILES = [ 'design-system.css', 'shared-core.js', 'modal-keys.js', 'apps-launcher.js', 'session-render.js', 'goal-render.js' ];

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'buffer', maxBuffer: 64 << 20 });
const rev = process.argv[2] || 'HEAD';
const full = git('rev-parse', '--verify', `${rev}^{commit}`).toString().trim();
const short = full.slice(0, 12);
const dir = path.join(ROOT, 'v', short);
// Plus each app's own stylesheet (apps/<app>.css, PLAT-27): the shell loads it
// right after design-system.css from the same release.
const APP_CSS = git('ls-tree', '--name-only', `${full}:apps`).toString().split('\n').filter(f => f.endsWith('.css')).map(f => `apps/${f}`);
const FILES = [ ...CORE_FILES, ...APP_CSS ];

// Releasing a commit whose files equal the current release is a no-op (e.g.
// running it again right after committing "Release …").
const integrity = buf => 'sha384-' + createHash('sha384').update(buf).digest('base64');
const files = {};
const bodies = {};
for (const f of FILES) {
    let body = git('show', `${full}:${f}`);
    if (f.endsWith('.css')) body = Buffer.from(body.toString('utf8').replace(/url\((["']?)fonts\//g, 'url($1../../fonts/'));
    bodies[f] = body;
    files[f] = integrity(body);
}
const currentPath = path.join(ROOT, 'v', 'current.json');
if (existsSync(currentPath)) {
    const cur = JSON.parse(readFileSync(currentPath, 'utf8'));
    if (JSON.stringify(cur.files) === JSON.stringify(files)) {
        console.log(`nothing to release: ${short} has the same files as the current release v/${cur.sha}/`);
        process.exit(0);
    }
}

mkdirSync(dir, { recursive: true });
for (const f of FILES) { mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); writeFileSync(path.join(dir, f), bodies[f]); }
const manifest = {
    sha: short,
    commit: full,
    date: git('show', '-s', '--format=%cI', full).toString().trim(),
    base: `/v/${short}/`,
    files,
};
const json = JSON.stringify(manifest, null, 2) + '\n';
writeFileSync(path.join(dir, 'manifest.json'), json);
writeFileSync(currentPath, json);
console.log(`released ${short} → v/${short}/ (${FILES.length} files) and v/current.json`);
console.log(`commit it: git add v && git commit -m "Release ${short}"`);
