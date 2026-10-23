import { expect, test } from 'bun:test';
import { publicRead } from './public-read-cache.ts';

test('serves a fresh read without querying again', async () => {
  let calls = 0;
  const key = `hit-${crypto.randomUUID()}`;
  const load = () => Promise.resolve(++calls);

  expect(await publicRead(key, load, 5_000)).toBe(1);
  expect(await publicRead(key, load, 5_000)).toBe(1);
  expect(calls).toBe(1);
});

test('queries again after the memory ttl', async () => {
  let calls = 0;
  const key = `ttl-${crypto.randomUUID()}`;
  const load = () => Promise.resolve(++calls);

  expect(await publicRead(key, load, 20)).toBe(1);
  await new Promise((resolve) => setTimeout(resolve, 40));
  expect(await publicRead(key, load, 20)).toBe(2);
});

test('collapses concurrent misses into one query', async () => {
  let calls = 0;
  let release: (value: number) => void = () => {};
  const gate = new Promise<number>((resolve) => {
    release = resolve;
  });
  const key = `dedupe-${crypto.randomUUID()}`;
  const load = () => {
    calls += 1;
    return gate;
  };

  const first = publicRead(key, load, 5_000);
  const second = publicRead(key, load, 5_000);
  release(7);

  expect(await first).toBe(7);
  expect(await second).toBe(7);
  expect(calls).toBe(1);
});

test('does not cache a failed read', async () => {
  let calls = 0;
  const key = `fail-${crypto.randomUUID()}`;
  const load = () => {
    calls += 1;
    if (calls === 1) return Promise.reject(new Error('neon down'));
    return Promise.resolve('ok');
  };

  await expect(publicRead(key, load, 5_000)).rejects.toThrow('neon down');
  expect(await publicRead(key, load, 5_000)).toBe('ok');
  expect(calls).toBe(2);
});
