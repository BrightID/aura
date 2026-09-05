import { type CSSResultGroup, css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type AvatarSize = 'sm' | 'md' | 'lg';

@customElement('a-avatar')
export class AvatarElement extends LitElement {
  @property() declare src?: string;
  @property() declare alt: string;
  @property() declare fallback: string;
  @property({ reflect: true }) declare size: AvatarSize;

  @state() declare private _errored: boolean;

  constructor() {
    super();
    this.src = undefined;
    this.alt = '';
    this.fallback = '';
    this.size = 'md';
    this._errored = false;
  }

  static styles: CSSResultGroup = css`
    :host {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 50%;
      background: var(--muted);
      color: var(--muted-foreground);
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1;
      user-select: none;
      vertical-align: middle;
    }

    :host([size='sm']) {
      width: 1.5rem;
      height: 1.5rem;
      font-size: 0.625rem;
    }

    :host,
    :host([size='md']) {
      width: 2rem;
      height: 2rem;
    }

    :host([size='lg']) {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 0.875rem;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      aspect-ratio: 1 / 1;
      border-radius: inherit;
      display: block;
    }
  `;

  render() {
    const showImg = this.src && !this._errored;
    return showImg
      ? html`<img
          src=${this.src as string}
          alt=${this.alt}
          @error=${this._onError}
        />`
      : html`<span part="fallback">${this.fallback}</span>`;
  }

  private _onError() {
    this._errored = true;
  }

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('src')) this._errored = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-avatar': AvatarElement;
  }
}
