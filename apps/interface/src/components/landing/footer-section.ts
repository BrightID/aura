import { LightElement } from '@aura/widgets/light-element';
import brightIDIcon from '@/assets/icons/brightid.svg';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './footer-section.css';

@customElement('footer-section')
export class FooterSectionElement extends LightElement {
  protected render() {
    return html` <div class="bottom-bar">
      <div class="brand">
        <span
          class="a-icon text-2xl"
          aria-hidden="true"
          style="--icon-url: url(${brightIDIcon})"
        ></span>

        <span class="brand-name">BrightID</span>
      </div>
      <a href="/interface/privacy-policy" class="privacy">Privacy Policy</a>
    </div>`;
  }
}
