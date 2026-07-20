import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface GridItem {
  title?: string;
  subtitle?: string;
  image?: string;
  [key: string]: any;
}

@customElement('a-grid')
export class GridElement extends LitElement {
  @property({ type: Number, attribute: 'cols-lg', reflect: true })
  declare colsLg: number;

  @property({ type: Number, attribute: 'cols-md', reflect: true })
  declare colsMd: number;

  @property({ type: Number, attribute: 'cols-sm', reflect: true })
  declare colsSm: number;

  @property({ type: Number, attribute: 'cols-xs', reflect: true })
  declare colsXs: number;

  @property({ type: String, attribute: 'gap', reflect: true })
  declare gap: string;

  @property({ attribute: false })
  declare items: GridItem[];

  @property({ type: String, attribute: 'card-aspect' })
  declare cardAspect: string;

  @state() private declare _hasSlottedContent: boolean;

  constructor() {
    super();
    this.colsLg = 4;
    this.colsMd = 3;
    this.colsSm = 2;
    this.colsXs = 1;
    this.gap = '1.25rem';
    this.items = [];
    this.cardAspect = '4 / 3';
    this._hasSlottedContent = false;
  }

  static styles = css`
    :host {
      display: block;
    }

    .header {
      margin-block-end: 1.5rem;
    }

    .grid {
      display: grid;
      gap: var(--grid-gap, 1.25rem);
      grid-template-columns: repeat(var(--cols-xs, 1), 1fr);

      @media (min-width: 480px) {
        grid-template-columns: repeat(var(--cols-sm, 2), 1fr);
      }
      @media (min-width: 768px) {
        grid-template-columns: repeat(var(--cols-md, 3), 1fr);
      }
      @media (min-width: 1024px) {
        grid-template-columns: repeat(var(--cols-lg, 4), 1fr);
      }
    }

    ::slotted(*) {
      display: contents;
    }

    .card {
      background: var(--card-bg, var(--card));
      border-radius: var(--radius, 0.75rem);
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
      overflow: hidden;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      display: flex;
      flex-direction: column;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md, 0 10px 25px -5px rgba(0,0,0,0.1));
    }

    .card-image {
      aspect-ratio: var(--card-aspect, 4 / 3);
      background: var(--muted);
      position: relative;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .card:hover .card-image img {
      transform: scale(1.06);
    }

    .card-content {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .card-title {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0;
    }

    .card-subtitle {
      color: var(--muted-foreground);
      font-size: 0.875rem;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--muted-foreground);
    }
  `;

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('colsLg')) this.style.setProperty('--cols-lg', String(this.colsLg));
    if (changedProperties.has('colsMd')) this.style.setProperty('--cols-md', String(this.colsMd));
    if (changedProperties.has('colsSm')) this.style.setProperty('--cols-sm', String(this.colsSm));
    if (changedProperties.has('colsXs')) this.style.setProperty('--cols-xs', String(this.colsXs));
    if (changedProperties.has('gap')) this.style.setProperty('--grid-gap', this.gap);
    if (changedProperties.has('cardAspect')) this.style.setProperty('--card-aspect', this.cardAspect);
  }

  private _onDefaultSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasSlottedContent = slot.assignedElements().length > 0;
  }

  render() {
    const hasItems = this.items.length > 0;
    const showEmpty = !hasItems && !this._hasSlottedContent;

    return html`
      <div class="header">
        <slot name="header"></slot>
      </div>

      <!-- Always in DOM so slotchange fires even when grid is hidden -->
      <div class="grid" part="grid" ?hidden=${showEmpty}>
        ${hasItems
          ? this.items.map(item => this._renderItem(item))
          : html`<slot @slotchange=${this._onDefaultSlotChange}></slot>`}
      </div>

      ${showEmpty
        ? html`
            <div class="empty-state" part="empty">
              <slot name="empty">No items to display</slot>
            </div>
          `
        : ''}
    `;
  }

  private _renderItem(item: GridItem) {
    return html`
      <div class="card" part="item">
        ${item.image
          ? html`
              <div class="card-image">
                <img src=${item.image} alt=${item.title || 'card image'} loading="lazy" />
              </div>
            `
          : ''}
        <div class="card-content">
          ${item.title ? html`<h3 class="card-title">${item.title}</h3>` : ''}
          ${item.subtitle ? html`<p class="card-subtitle">${item.subtitle}</p>` : ''}
          <slot name="item-content"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-grid': GridElement;
  }
}
