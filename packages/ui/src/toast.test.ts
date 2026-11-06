import { describe, expect, test } from 'bun:test';
import { subscribe, toast, type ToastData } from './toast';

globalThis.requestAnimationFrame = (cb) => {
  cb(0);
  return 0;
};

function snapshot(): ToastData[] {
  let list: ToastData[] = [];
  const stop = subscribe((next) => {
    list = next;
  });
  stop();
  return list;
}

describe('toast', () => {
  test('same id replaces instead of stacking', () => {
    toast.info('first', { id: 'pwa-update', duration: Infinity });
    toast.info('second', { id: 'pwa-update', duration: Infinity });
    const rows = snapshot().filter((item) => item.id === 'pwa-update');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.message).toBe('second');
    toast.dismiss('pwa-update');
  });

  test('dismiss fires onDismiss once', () => {
    let calls = 0;
    toast.info('update', {
      id: 'once',
      duration: Infinity,
      onDismiss: () => {
        calls += 1;
      },
    });
    toast.dismiss('once');
    toast.dismiss('once');
    expect(calls).toBe(1);
  });

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const live = (message: string) =>
    snapshot().find((item) => item.message === message);

  // The old toast with this id is still fading out when the new one arrives.
  test('a toast raised again while its id is closing is shown', () => {
    toast.info('old', { id: 'reraise', duration: Infinity });
    toast.dismiss('reraise');
    toast.success('new', { id: 'reraise', duration: Infinity });
    expect(live('new')?.visible).toBe(true);
    toast.dismiss('reraise');
  });

  test('toast.promise shows its result', async () => {
    await toast.promise(Promise.resolve(1), {
      loading: 'promise loading',
      success: 'promise done',
      error: 'promise failed',
    });
    expect(live('promise done')?.visible).toBe(true);
  });

  test('replacing a toast restarts its auto-dismiss timer', async () => {
    toast.info('first try', { id: 'restart', duration: 100 });
    await wait(60);
    toast.info('second try', { id: 'restart', duration: 300 });
    await wait(90); // past the first toast's deadline, inside the second's
    expect(live('second try')?.visible).toBe(true);
    toast.dismiss('restart');
  });

  test('a loading toast replaced by a timed one auto-dismisses', async () => {
    toast.loading('saving', { id: 'saved' });
    toast.success('saved', { id: 'saved', duration: 50 });
    await wait(120);
    expect(live('saved')?.visible ?? false).toBe(false);
  });
});
