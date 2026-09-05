import type { JSX } from 'solid-js';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'a-button': JSX.HTMLAttributes<HTMLButtonElement> & {
        variant?: string;
        size?: string;
      };
      'a-icon': JSX.HTMLAttributes<HTMLElement> & {
        name?: string;
      };
      'a-badge': JSX.HTMLAttributes<HTMLSpanElement> & {
        variant?: string;
      };
    }
  }
}

export {};
