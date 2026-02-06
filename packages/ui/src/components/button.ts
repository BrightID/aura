import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export type ButtonVariant = 'default' | 'secondary' | 'ghost'

@customElement('a-button')
export class ButtonElement extends LitElement {
  @property()
  variant: ButtonVariant = 'default'

  @property()
  size: 'sm' | 'md' | 'lg' = 'md'

  @property()
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' = 'primary'

  @property({ type: Boolean })
  disabled: boolean = false

  static styles?: CSSResultGroup = css`
    button {
      --bg: transparent;
      --fg: currentColor;
      --border: transparent;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      font-weight: 500;
      transition: all 0.15s ease;
      cursor: pointer;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--fg);
    }

    button:active {
      transform: scale(0.95);
    }

    button:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    /* sizes */
    button[data-size='sm'] {
      height: 2rem;
      padding: 0 0.75rem;
      font-size: 0.8125rem;
    }

    button[data-size='md'] {
      height: 2.5rem;
      padding: 0 1rem;
      font-size: 0.875rem;
    }

    button[data-size='lg'] {
      height: 3rem;
      padding: 0 1.5rem;
      font-size: 1rem;
    }

    /* color palette */
    button[data-color='primary'] {
      --color: var(--primary);
      --color-fg: var(--primary-foreground);
    }

    button[data-color='secondary'] {
      --color: var(--secondary);
      --color-fg: var(--secondary-foreground);
    }

    button[data-color='success'] {
      --color: var(--aura-success);
      --color-fg: white;
    }

    button[data-color='warning'] {
      --color: var(--aura-warning);
      --color-fg: white;
    }

    button[data-color='destructive'] {
      --color: oklch(0.65 0.25 25);
      --color-fg: white;
    }

    /* variants */
    button[data-variant='default'] {
      --bg: var(--color);
      --fg: var(--color-fg);
    }

    button[data-variant='default']:hover:not(:disabled) {
      --bg: oklch(from var(--color) calc(l + 0.05) c h);
    }

    button[data-variant='secondary'] {
      --bg: color-mix(in oklch, var(--color) 15%, transparent);
      --fg: var(--color);
    }

    button[data-variant='secondary']:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 25%, transparent);
    }

    button[data-variant='ghost'] {
      --bg: transparent;
      --fg: var(--color);
    }

    button[data-variant='ghost']:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 20%, transparent);
    }
  `

  protected render(): unknown {
    return html`
      <button
        ?disabled=${this.disabled}
        data-color=${this.color}
        data-size=${this.size}
        data-variant=${this.variant}
      >
        <slot></slot>
      </button>
    `
  }
}
