import { Task } from '@lit/task';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { marked } from 'marked';

@customElement('c-markdown')
export class MarkdownElement extends LitElement {
  @property({
    type: String,
  })
  markdown!: string;

  static styles = css`
    :host {
      display: block;
      color: var(--foreground);
      line-height: 1.55;
      overflow-wrap: anywhere;
    }

    h1,
    h2,
    h3 {
      color: var(--foreground);
      font-weight: 600;
      line-height: 1.25;
    }

    h1 {
      font-size: 1.875rem;
      margin: 0 0 12px;
    }

    h2 {
      font-size: 1.25rem;
      margin: 1.25rem 0 0.5rem;
    }

    h3 {
      font-size: 1.05rem;
      margin: 1rem 0 0.35rem;
    }

    p,
    li {
      margin: 0.35rem 0;
    }

    ul,
    ol {
      margin: 0.35rem 0;
      padding-left: 1.25rem;
    }

    a {
      color: var(--primary);
      font-weight: 600;
    }
  `;

  private _compiledMarkdown = new Task(this, {
    task: async ([markdown]) => await marked.parse(markdown),
    args: () => [this.markdown],
  });

  render() {
    return this._compiledMarkdown.render({
      pending: () => html`<p></p>`,
      complete: (content) => unsafeHTML(content),
      error: (e) => html`<p>Error: ${e}</p>`,
    });
  }
}
