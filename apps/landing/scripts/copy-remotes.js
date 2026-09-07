#!/usr/bin/env node

import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../dist');

const remotes = [
  ['core', resolve(import.meta.dirname, '../../core/dist')],
  ['dashboard', resolve(import.meta.dirname, '../../dashboard/dist')],
  ['demo', resolve(import.meta.dirname, '../../demo-integration/dist')],
  ['interface', resolve(import.meta.dirname, '../../interface/dist')],
];

for (const [name, from] of remotes) {
  if (!existsSync(from)) {
    throw new Error(`Missing remote build at ${from}. Build ${name} first.`);
  }
  const to = resolve(dist, name);
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  // Host SPA owns these URLs. Each remote folder is a real static directory,
  // so a hard refresh of /dashboard/ 404s unless it has an index.html.
  // Serve the landing shell; remotes still load via remoteEntry.js.
  cpSync(resolve(dist, 'index.html'), resolve(to, 'index.html'));
}

console.log('Copied Module Federation remotes into landing dist');
