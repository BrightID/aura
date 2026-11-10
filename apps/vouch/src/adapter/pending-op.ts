import { createSignal } from 'solid-js';

export type OpStatus = 'holding' | 'sent' | 'applied' | 'failed';

/**
 * A write held for `delay` ms so the user can undo it, then sent. `send` runs
 * once, when the hold ends; `onCommit` runs after a successful send.
 */
export class PendingOp {
  readonly id = `op-${Math.random().toString(36).slice(2)}`;
  readonly done: Promise<OpStatus>;
  reason?: 'undone';
  error?: unknown;
  private readonly signal = createSignal<OpStatus>('holding');
  private timer?: ReturnType<typeof setTimeout>;
  private resolve!: (status: OpStatus) => void;

  constructor(
    send: () => void,
    {
      delay = 1500,
      onCommit = () => {},
    }: { delay?: number; onCommit?: () => void } = {},
  ) {
    this.done = new Promise((resolve) => (this.resolve = resolve));
    this.timer = setTimeout(() => {
      this.set('sent');
      try {
        send();
        this.set('applied');
      } catch (error) {
        this.error = error;
        this.set('failed');
      }
      this.resolve(this.status);
      // The write is applied and `done` has resolved. An error in onCommit (the
      // room sync) is logged and the op stays 'applied': marking it failed
      // would tell the user that a write which happened did not.
      if (this.status === 'applied')
        try {
          onCommit();
        } catch (error) {
          console.error(error);
        }
    }, delay);
  }

  get status() {
    return this.signal[0]();
  }

  private set(status: OpStatus) {
    this.signal[1](status);
  }

  /** Cancel the op while it is still holding. Returns false once it has been sent. */
  undo() {
    if (this.status !== 'holding') return false;
    clearTimeout(this.timer);
    this.reason = 'undone';
    this.set('failed');
    this.resolve('failed');
    return true;
  }
}
