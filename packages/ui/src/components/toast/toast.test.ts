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
});
