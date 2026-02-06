import { Task } from '@lit/task'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

import { marked } from 'marked'

@customElement('c-markdown')
export class MarkdownElement extends LitElement {
  @property({
    type: String
  })
  markdown!: string

  private _compiledMarkdown = new Task(this, {
    task: async ([markdown]) => await marked.parse(markdown),
    args: () => [this.markdown]
  })

  render() {
    return this._compiledMarkdown.render({
      pending: () => html`<p></p>`,
      complete: (content) => unsafeHTML(content),
      error: (e) => html`<p>Error: ${e}</p>`
    })
  }
}
