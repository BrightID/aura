// Every icon an app names must be in src/icons: an icon missing there renders
// blank (see icon.ts). The scan covers the shapes the apps use to name icons:
// <Icon name="…">, icon="…" props, either one as an expression
// ({on ? 'a' : 'b'}), icon: '…' or any …Icon: '…' key, icon maps,
// iconUrl('…') and the Lit icon('…') helper.
import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '../../..');
const SOURCES = ['apps/core/src', 'apps/interface/src', 'packages/widgets/src'];

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(ts|tsx)$/.test(name)) yield path;
  }
}

function namesIn(src: string): string[] {
  const out: string[] = [];
  const add = (re: RegExp) => {
    for (const m of src.matchAll(re)) out.push(m[1]!);
  };
  add(/<Icon\b[^>]*?\bname="([a-z0-9:-]+)"/g);
  add(/\bicon="([a-z0-9:-]+)"/g);
  add(/\b\w*[iI]con:\s*'([a-z0-9:-]+)'/g); // icon: '…', ctaIcon: '…'
  add(/\biconUrl\('([a-z0-9:-]+)'\)/g);
  add(/\$\{icon\('([a-z0-9:-]+)'/g);
  // Expressions such as name={on ? 'thumbs-up' : 'thumbs-down'} or
  // icon(isDark() ? 'moon' : 'sun'): every quoted literal in them.
  for (const m of src.matchAll(
    /(?:<Icon\b[^>]*?\bname=|\bicon=)\{([^}]*)\}|\bicon\(([^)]*\?[^)]*)\)/g,
  ))
    for (const v of (m[1] ?? m[2])!.matchAll(/'([a-z0-9:-]+)'/g))
      out.push(v[1]!);
  // Maps of names: roleIcon = { … }, LEVEL_ICONS: Record<…> = { … }, …
  for (const m of src.matchAll(
    /(?:Icon|ICON)S?\w*\s*(?::[^={]+)?=\s*\{([^}]*)\}/g,
  ))
    for (const v of m[1]!.matchAll(/:\s*'([a-z0-9:-]+)'/g)) out.push(v[1]!);
  return out;
}

const file = (name: string) =>
  name.replace(/^lucide:/, '').replace(':', '--') + '.svg';

describe('the icon scan', () => {
  test('reads a name under any …Icon key', () => {
    expect(namesIn("ctaIcon: 'lucide:users', icon: 'bell'")).toEqual(
      expect.arrayContaining(['lucide:users', 'bell']),
    );
  });
});

describe('bundled icons', () => {
  const used = new Map<string, string>();
  for (const dir of SOURCES)
    for (const path of files(join(ROOT, dir)))
      for (const name of namesIn(readFileSync(path, 'utf8')))
        if (!used.has(name)) used.set(name, path.slice(ROOT.length + 1));

  test('the scan finds the apps’ icons', () => {
    expect(used.size).toBeGreaterThan(30);
  });

  test('every icon an app uses is in src/icons', () => {
    const missing = [...used]
      .filter(
        ([name]) => !existsSync(join(import.meta.dir, 'icons', file(name))),
      )
      .map(([name, where]) => `${name} (${where})`);
    expect(missing).toEqual([]);
  });
});
