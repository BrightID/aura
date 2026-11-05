#!/usr/bin/env node
// Screenshot check for the Aura UI. Builds each app's test pages (tests/ in
// core, interface and the dashboard, in dark and light; interface's design
// page only in dark, as interface has no light theme), opens them in headless
// Chrome, waits for each page's own checks to finish, and compares the
// screenshot and the check's result text with the baselines in tests/visual/.
//
//   node scripts/visual-check.mjs            compare; exit 1 on any difference
//   node scripts/visual-check.mjs --update   write new baselines
//   node scripts/visual-check.mjs core-dark  only the named pages
//
// Needs Node 22+ and Chrome (CHROME_PATH, or google-chrome-stable / chromium
// on PATH). Fonts differ between machines, so make baselines on the machine
// (or CI image) that runs the check. On a failure, tests/visual/out/ has the
// new screenshot and a diff image with changed pixels in red.

import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = join(ROOT, 'tests/visual');
const OUT = join(BASE, 'out');

const PAGES = [
  { name: 'core-dark', app: 'apps/core', file: 'tests/cards.html', width: 760 },
  {
    name: 'core-light',
    app: 'apps/core',
    file: 'tests/cards-light.html',
    width: 760,
  },
  {
    name: 'interface-dark',
    app: 'apps/interface',
    file: 'tests/design.html',
    width: 1100,
  },
  {
    name: 'widgets-dark',
    app: 'apps/interface',
    file: 'tests/widgets.html',
    width: 1000,
  },
  {
    name: 'widgets-light',
    app: 'apps/interface',
    file: 'tests/widgets-light.html',
    width: 1000,
  },
  {
    name: 'dashboard-dark',
    app: 'apps/dashboard',
    file: 'tests/visual.html',
    width: 1100,
  },
  {
    name: 'dashboard-light',
    app: 'apps/dashboard',
    file: 'tests/visual-light.html',
    width: 1100,
  },
  {
    name: 'dashboard-mobile-sidebar',
    app: 'apps/dashboard',
    file: 'tests/sidebar.html',
    width: 390,
  },
];
// The page is done when its result line no longer says "Checking…".
const RESULT = `(document.querySelector('[data-testid="card-check-result"], #result')?.textContent ?? '').trim()`;
// A pixel counts as changed when a channel moves by more than this.
const PIXEL_THRESHOLD = 40;

const args = process.argv.slice(2);
const update = args.includes('--update');
const only = args.filter((a) => !a.startsWith('--'));
const pages = PAGES.filter((p) => !only.length || only.includes(p.name));
if (!pages.length) fail(`no page named ${only.join(', ')}`);

const work = mkdtempSync(join(tmpdir(), 'aura-visual-'));
const built = new Map();

for (const app of new Set(pages.map((p) => p.app))) {
  const out = join(work, app.replaceAll('/', '-'));
  process.stdout.write(`build ${app} … `);
  const r = spawnSync(
    'npx',
    ['vite', 'build', '--config', 'tests/vite.config.ts'],
    {
      cwd: join(ROOT, app),
      encoding: 'utf8',
      env: {
        ...process.env,
        VISUAL_OUT: out,
        // Fake Firebase settings for the dashboard: its pages render without
        // signing in.
        VITE_SOME_FIREBASE_API_KEY: 'visual-check',
        VITE_SOME_FIREBASE_AUTH_DOMAIN: 'visual-check.firebaseapp.com',
        VITE_SOME_FIREBASE_PROJECT_ID: 'visual-check',
        VITE_SOME_FIREBASE_APP_ID: '1:1:web:1',
      },
    },
  );
  if (r.status !== 0) fail(`build failed:\n${r.stdout}${r.stderr}`);
  console.log('ok');
  built.set(app, out);
}

const chrome = await startChrome();
let failed = 0;
try {
  for (const page of pages) {
    const url = 'file://' + join(built.get(page.app), page.file);
    const { png, result } = await capture(chrome, url, page.width);
    const pngPath = join(BASE, `${page.name}.png`);
    const resultPath = join(BASE, `${page.name}.txt`);
    if (update) {
      mkdirSync(BASE, { recursive: true });
      writeFileSync(pngPath, png);
      writeFileSync(resultPath, result + '\n');
      console.log(`${page.name}: baseline written (${result})`);
      continue;
    }
    if (!existsSync(pngPath)) {
      failed++;
      console.log(`${page.name}: FAIL, no baseline (run with --update)`);
      continue;
    }
    const expected = readFileSync(resultPath, 'utf8').trim();
    const diff = await compare(chrome, readFileSync(pngPath), png);
    const problems = [];
    if (result !== expected)
      problems.push(`result "${result}", expected "${expected}"`);
    if (diff.sizeChanged)
      problems.push(`size ${diff.size}, baseline ${diff.baseSize}`);
    else if (diff.changed) problems.push(`${diff.changed} pixels changed`);
    if (!problems.length) {
      console.log(`${page.name}: ok`);
      continue;
    }
    failed++;
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, `${page.name}.png`), png);
    if (diff.diffPng)
      writeFileSync(join(OUT, `${page.name}.diff.png`), diff.diffPng);
    console.log(`${page.name}: FAIL, ${problems.join('; ')}`);
  }
} finally {
  chrome.close();
}
if (failed) fail(`${failed} page(s) differ; see tests/visual/out/`);

// ---------------------------------------------------------------------------

function fail(message) {
  console.error(message);
  process.exit(1);
}

function findChrome() {
  const names = [
    process.env.CHROME_PATH,
    'google-chrome-stable',
    'google-chrome',
    'chromium',
    'chromium-browser',
  ];
  for (const n of names.filter(Boolean)) {
    if (spawnSync(n, ['--version'], { encoding: 'utf8' }).status === 0)
      return n;
  }
  fail('Chrome not found; set CHROME_PATH');
}

async function startChrome() {
  const profile = mkdtempSync(join(tmpdir(), 'aura-visual-chrome-'));
  const proc = spawn(
    findChrome(),
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      '--force-color-profile=srgb',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  // Chrome writes the port it picked into the profile.
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    target = list.find((t) => t.type === 'page');
    if (!target) await sleep(100);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(msg.error.message));
    else p.resolve(msg.result);
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (
      await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      })
    ).result.value;
  // Same random numbers on every run (mulberry32, fixed seed).
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `{ let a = 0x9e3779b9; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }`,
  });
  return {
    send,
    evaluate,
    close: () => {
      ws.close();
      proc.kill();
    },
  };
}

async function capture(chrome, url, width) {
  await chrome.send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await chrome.send('Page.navigate', { url });
  // Real time, not Chrome's virtual clock: the pages' own checks race timers
  // against animations, and virtual time can stall them.
  let result = '';
  for (let i = 0; i < 150; i++) {
    await sleep(200);
    result = (await chrome.evaluate(RESULT).catch(() => '')) ?? '';
    if (result && !/Checking/.test(result)) break;
  }
  await chrome.evaluate('document.fonts.ready.then(() => true)');
  await sleep(500); // let entry transitions settle
  // Freeze what moves on its own: end CSS animations (spinners), and hide
  // canvases (the dashboard's particle background redraws every frame).
  await chrome.evaluate(`{
    const s = document.createElement('style');
    s.textContent = '*, ::before, ::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; caret-color: transparent !important } canvas { visibility: hidden !important }';
    document.head.append(s);
  }`);
  const height = Math.min(
    6000,
    Math.ceil(await chrome.evaluate('document.documentElement.scrollHeight')),
  );
  await chrome.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(300);
  const shot = await chrome.send('Page.captureScreenshot', { format: 'png' });
  return { png: Buffer.from(shot.data, 'base64'), result };
}

/** Pixel diff, done in the browser with canvases: no image library needed. */
async function compare(chrome, basePng, newPng) {
  await chrome.send('Page.navigate', { url: 'about:blank' });
  await sleep(100);
  const r = await chrome.evaluate(`(async () => {
    const load = async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = new OffscreenCanvas(img.width, img.height);
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      return { w: img.width, h: img.height, data: x.getImageData(0, 0, img.width, img.height).data };
    };
    const a = await load(${JSON.stringify(basePng.toString('base64'))});
    const b = await load(${JSON.stringify(newPng.toString('base64'))});
    if (a.w !== b.w || a.h !== b.h)
      return { sizeChanged: true, size: b.w + 'x' + b.h, baseSize: a.w + 'x' + a.h };
    const out = new OffscreenCanvas(a.w, a.h);
    const ox = out.getContext('2d');
    const diff = ox.createImageData(a.w, a.h);
    let changed = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
      const hit = d > ${PIXEL_THRESHOLD};
      if (hit) changed++;
      diff.data.set(hit ? [255, 0, 0, 255] : [b.data[i] / 3, b.data[i + 1] / 3, b.data[i + 2] / 3, 255], i);
    }
    if (!changed) return { changed: 0 };
    ox.putImageData(diff, 0, 0);
    const blob = await out.convertToBlob({ type: 'image/png' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { changed, diff: btoa(s) };
  })()`);
  return { ...r, diffPng: r.diff ? Buffer.from(r.diff, 'base64') : undefined };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
