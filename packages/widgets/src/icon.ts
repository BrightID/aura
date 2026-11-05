import { html } from 'lit';
import { iconUrl } from '@aura/ui/icon';

/**
 * A bundled icon as `.a-icon` (see @aura/ui/icon): 1em square, in the text
 * colour, hidden from screen readers. `name` is "lucide:house" or "house",
 * or "set:name" for the few non-Lucide icons. `style` adds declarations,
 * e.g. 'width: 1.25em; height: 1.25em'.
 */
export const icon = (name: string, className = '', style = '') =>
  html`<span
    class="a-icon ${className}"
    aria-hidden="true"
    style="--icon-url: url('${iconUrl(name)}');${style}"
  ></span>`;
