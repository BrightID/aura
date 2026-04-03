import 'iconify-icon'
import { currentPath, pushRouter } from '@/router'
import { SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

const menuItems = [
  { icon: 'lucide:house', href: '/home' },
  { icon: 'lucide:activity', href: '/activities' },
  { icon: 'lucide:bell', href: '/notifications', small: true },
  { icon: 'lucide:share-2', href: '/share' }
]

@customElement('app-footer')
export class AppFooter extends SignalWatcher(LitElement) {
  private _onPopState = () => currentPath.set(window.location.pathname)

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('popstate', this._onPopState)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('popstate', this._onPopState)
  }

  private navigate(e: Event, href: string) {
    e.preventDefault()
    pushRouter(href)
  }

  private isActive(href: string) {
    const path = currentPath.get()
    return path === href || path.startsWith(href + '/')
  }

  static styles = css`
    :host {
      display: block;
    }

    /* ── Mobile-first: full-width bar pinned to bottom ── */
    .navbar {
      z-index: 30;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 6px 0;
      padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
      background: linear-gradient(
        to bottom,
        rgba(46, 51, 90, 0.35),
        rgba(28, 27, 51, 0.6) 100%
      );
      backdrop-filter: blur(24px);
      border-top: 1px solid rgba(255, 255, 255, 0.07);
    }

    /* ── Larger screens: floating pill ── */
    @media (min-width: 480px) {
      .navbar {
        bottom: 22px;
        left: 50%;
        right: auto;
        width: 380px;
        transform: translateX(-50%);
        border-radius: 22px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        padding: 8px 12px;
      }
    }

    /* ── Nav item ── */
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 48px;
      gap: 4px;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
      cursor: pointer;
    }

    /* ── Icon wrapper ── */
    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 34px;
      border-radius: 12px;
      background: transparent;
      transition: background 220ms ease, transform 180ms ease;
    }

    .nav-item.active .icon-wrap {
      background: rgba(160, 150, 220, 0.15);
    }

    /* ── Icon ── */
    iconify-icon {
      width: 24px;
      height: 24px;
      font-size: 24px;
      color: rgba(150, 150, 180, 0.55);
      transition: color 200ms ease;
    }

    .nav-item.active iconify-icon {
      color: rgba(195, 185, 255, 0.9);
    }

    .small-icon {
      width: 20px !important;
      height: 20px !important;
      font-size: 20px !important;
    }

    /* ── Active dot ── */
    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(195, 185, 255, 0.75);
      opacity: 0;
      transform: scale(0);
      transition: opacity 200ms ease, transform 200ms ease;
    }

    .nav-item.active .dot {
      opacity: 1;
      transform: scale(1);
    }
  `

  render() {
    return html`
      <nav class="navbar" role="navigation" aria-label="Main navigation">
        ${menuItems.map(
          (item) => html`
            <a
              href="${item.href}"
              class="nav-item ${this.isActive(item.href) ? 'active' : ''}"
              aria-current="${this.isActive(item.href) ? 'page' : 'false'}"
              @click="${(e: Event) => this.navigate(e, item.href)}"
            >
              <div class="icon-wrap">
                <iconify-icon
                  icon="${item.icon}"
                  class="${item.small ? 'small-icon' : ''}"
                ></iconify-icon>
              </div>
              <div class="dot"></div>
            </a>
          `
        )}
      </nav>
    `
  }
}
