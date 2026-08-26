#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const client = resolve(import.meta.dirname, '../build/client');
const dest = resolve(client, 'dashboard');
mkdirSync(dest, { recursive: true });

for (const name of ['assets', 'images', 'favicon.ico', 'index.html']) {
  const from = resolve(client, name);
  if (existsSync(from)) {
    cpSync(from, resolve(dest, name), { recursive: true });
    rmSync(from, { recursive: true, force: true });
  }
}
