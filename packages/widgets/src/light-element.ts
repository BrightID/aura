import { LitElement } from 'lit';

/**
 * A LitElement that renders into itself instead of a shadow root, so page CSS
 * (Tailwind, @aura/ui/aura.css) reaches its content.
 *
 * Its styles live in a CSS file next to it, under
 * `@scope (its-tag) to (:scope [data-c] > *)`. Every host gets `data-c`, so
 * that lower bound, `:scope [data-c] > *`, is the content of any component
 * nested inside; a component's rules stop there.
 *
 * Light DOM has no <slot>: the child nodes the page put inside the element are
 * kept in `slotted`, and the template renders `${this.slotted}` where the slot
 * was.
 */
export class LightElement extends LitElement {
  protected slotted: Node[] = [];

  protected createRenderRoot(): HTMLElement {
    this.slotted = [...this.childNodes];
    this.toggleAttribute('data-c', true);
    return this;
  }
}
