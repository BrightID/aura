import 'react';

type AuraElement<T = Record<string, unknown>> = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  T & { class?: string };

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-theme-provider': AuraElement;
      'a-button': AuraElement<{
        variant?: string;
        size?: string;
        color?: string;
        type?: string;
        disabled?: boolean;
        selected?: boolean;
      }>;
      'a-badge': AuraElement<{
        variant?: string;
        size?: string;
        rounded?: boolean;
        removable?: boolean;
      }>;
      'a-card': AuraElement<{ variant?: string; interactive?: boolean }>;
      'a-input': AuraElement<{
        type?: string;
        label?: string;
        name?: string;
        placeholder?: string;
        value?: string;
        disabled?: boolean;
      }>;
      'a-text': AuraElement<{ variant?: string; size?: string }>;
      'a-separator': AuraElement<{ orientation?: string }>;
    }
  }
}
