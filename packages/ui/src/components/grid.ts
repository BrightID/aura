import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface GridItem {
  title?: string;
  subtitle?: string;
  image?: string;
  [key: string]: any;
}

/**
 * Responsive, customizable grid / cards component
 *
 * @slot - default slot = grid items (usually <div class="card">...</div>)
 * @slot header - optional header content above the grid
 * @slot empty - content shown when no items are present
 * @csspart grid - the grid container
 * @csspart item - each grid item wrapper (when using items array)
 */
@customElement('a-grid')
export class GridElement extends LitElement {

  /**
   * Number of columns on wide screens (≥1024px)
   */
  @property({ type: Number, attribute: 'cols-lg', reflect: true })
  colsLg = 4;

  /**
   * Number of columns on medium screens (≥768px)
   */
  @property({ type: Number, attribute: 'cols-md', reflect: true })
  colsMd = 3;

  /**
   * Number of columns on small screens (≥480px)
   */
  @property({ type: Number, attribute: 'cols-sm', reflect: true })
  colsSm = 2;

  /**
   * Number of columns on very small screens
   */
  @property({ type: Number, attribute: 'cols-xs', reflect: true })
  colsXs = 1;

  /**
   * Gap between grid items (can be overridden with --grid-gap)
   */
  @property({ type: String, attribute: 'gap', reflect: true })
  gap = '1.25rem';

  /**
   * Optional: supply data array instead of slotted items
   */
  @property({ attribute: false })
  items: GridItem[] = [];

  /**
   * Aspect ratio for auto-generated cards when using .items
   * Examples: '1 / 1', '4 / 3', '16 / 9', '3 / 4'
   */
  @property({ type: String, attribute: 'card-aspect' })
  cardAspect = '4 / 3';

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

    /* When using slotted content */
    ::slotted([slot=""]) {
      display: contents;
    }

    /* Default card styling (used when providing .items) */
    .card {
      background: var(--card-bg, white);
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
      background: var(--muted, #e2e8f0);
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
      color: var(--muted-foreground, #64748b);
      font-size: 0.875rem;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--muted-foreground);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.style.setProperty('--cols-lg', String(this.colsLg));
    this.style.setProperty('--cols-md', String(this.colsMd));
    this.style.setProperty('--cols-sm', String(this.colsSm));
    this.style.setProperty('--cols-xs', String(this.colsXs));
    this.style.setProperty('--grid-gap', this.gap);
    this.style.setProperty('--card-aspect', this.cardAspect);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('colsLg')) this.style.setProperty('--cols-lg', String(this.colsLg));
    if (changedProperties.has('colsMd')) this.style.setProperty('--cols-md', String(this.colsMd));
    if (changedProperties.has('colsSm')) this.style.setProperty('--cols-sm', String(this.colsSm));
    if (changedProperties.has('colsXs')) this.style.setProperty('--cols-xs', String(this.colsXs));
    if (changedProperties.has('gap')) this.style.setProperty('--grid-gap', this.gap);
    if (changedProperties.has('cardAspect')) this.style.setProperty('--card-aspect', this.cardAspect);
  }

  render() {
    const hasItems = this.items.length > 0;
    const hasDefaultSlotContent = Array.from(this.children).some(
      el => !el.hasAttribute('slot') || el.getAttribute('slot') === ''
    );

    return html`
      <div class="header">
        <slot name="header"></slot>
      </div>

      ${hasItems || hasDefaultSlotContent 
        ? html`
            <div class="grid" part="grid">
              ${hasItems
                ? this.items.map(item => this.renderItem(item))
                : html`<slot></slot>`}
            </div>
          `
        : html`
            <div class="empty-state" part="empty">
              <slot name="empty">No items to display</slot>
            </div>
          `}
    `;
  }

  private renderItem(item: GridItem) {
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
