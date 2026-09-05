import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('a-flex')
export class FlexElement extends LitElement {
  @property({ reflect: true })
  declare direction: 'col' | 'row';

  @property({ type: Number, reflect: true })
  declare gap: number;

  @property({ type: Boolean, reflect: true })
  declare wrap: boolean;

  @property({ reflect: true })
  declare justify: 'start' | 'center' | 'end' | 'between';

  @property({ reflect: true })
  declare align: 'start' | 'end' | 'center';

  constructor() {
    super();
    this.direction = 'row';
    this.gap = 0;
    this.wrap = false;
    this.justify = 'start';
    this.align = 'start';
  }

  static styles?: CSSResultGroup = css`
    div {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
    }

    div[data-direction='col'] {
      flex-direction: column;
    }

    div[data-wrap='true'] {
      flex-wrap: wrap;
    }

    div[data-gap='0'] {
      gap: 0;
    }
    div[data-gap='1'] {
      gap: 0.25rem;
    }
    div[data-gap='2'] {
      gap: 0.5rem;
    }
    div[data-gap='3'] {
      gap: 0.75rem;
    }
    div[data-gap='4'] {
      gap: 1rem;
    }
    div[data-gap='5'] {
      gap: 1.25rem;
    }
    div[data-gap='6'] {
      gap: 1.5rem;
    }
    div[data-gap='7'] {
      gap: 1.75rem;
    }
    div[data-gap='8'] {
      gap: 2rem;
    }
    div[data-gap='10'] {
      gap: 2.5rem;
    }
    div[data-gap='12'] {
      gap: 3rem;
    }

    div[data-justify='start'] {
      justify-content: flex-start;
    }
    div[data-justify='end'] {
      justify-content: flex-end;
    }
    div[data-justify='between'] {
      justify-content: space-between;
    }
    div[data-justify='center'] {
      justify-content: center;
    }

    div[data-align='center'] {
      align-items: center;
    }
    div[data-align='start'] {
      align-items: flex-start;
    }
    div[data-align='end'] {
      align-items: flex-end;
    }
  `;

  protected render() {
    return html`<div
      data-direction=${this.direction}
      data-gap=${this.gap}
      data-wrap=${this.wrap}
      data-justify=${this.justify}
      data-align=${this.align}
    >
      <slot></slot>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-flex': FlexElement;
  }
}
