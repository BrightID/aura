import { icon } from '@aura/widgets/icon';
import { LightElement } from '@aura/widgets/light-element';
import { currentPath, pushRouter, toAppPath } from '@/router';
import { SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './footer.css';

const menuItems = [
  { icon: 'lucide:house', href: '/home', label: 'Home' },
  { icon: 'lucide:activity', href: '/activities', label: 'Activity' },
  {
    icon: 'lucide:bell',
    href: '/notifications',
    label: 'Alerts',
  },
  { icon: 'lucide:share-2', href: '/share', label: 'Share' },
  { icon: 'lucide:user', href: '/profile', label: 'Profile' },
];

@customElement('app-footer')
export class AppFooter extends SignalWatcher(LightElement) {
  private _onPopState = () => currentPath.set(window.location.pathname);

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this._onPopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this._onPopState);
  }

  private navigate(e: Event, href: string) {
    e.preventDefault();
    pushRouter(href);
  }

  private isActive(href: string) {
    const path = currentPath.get();
    return path === href || path.startsWith(href + '/');
  }

  render() {
    return html`
      <nav class="navbar" role="navigation" aria-label="Main navigation">
        ${menuItems.map(
          (item) => html`
            <a
              href="${toAppPath(item.href)}"
              class="nav-item ${this.isActive(item.href) ? 'active' : ''}"
              aria-current="${this.isActive(item.href) ? 'page' : 'false'}"
              @click="${(e: Event) => this.navigate(e, item.href)}"
            >
              <div class="icon-wrap">${icon(item.icon)}</div>
              <span class="nav-label">${item.label}</span>
            </a>
          `,
        )}
      </nav>
    `;
  }
}
