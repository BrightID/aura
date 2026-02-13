import activitiesIcon from '@/assets/icons/activities.svg'
import bellIcon from '@/assets/icons/bell.svg'
import homeIcon from '@/assets/icons/home.svg'
import shareIcon from '@/assets/icons/share.svg'
import { router } from '@/router'
import { SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

// import profileIcon from '@/assets/icons/profile.svg'

const menuItems = [
  {
    icon: homeIcon,
    href: '/home'
  },
  {
    icon: activitiesIcon,
    href: '/activities'
  },
  {
    icon: bellIcon,
    href: '/notifications',
    className: 'bell'
  },
  {
    icon: shareIcon,
    href: '/share'
  }
]

@customElement('app-footer')
export class AppFooter extends SignalWatcher(LitElement) {
  static styles = css`
    .navbar {
      background-image: linear-gradient(
        to bottom,
        rgba(46, 51, 90, 0.26),
        rgba(28, 27, 51, 0.26) 100%
      );

      z-index: 30;
      position: fixed;
      bottom: 23px;
      left: 50%;
      width: 350px;
      max-width: 98vw;
      transform: translateX(-50%);
      backdrop-filter: blur(24px);
      padding: 10px 16px;
      border: 1px solid #33333320;
      border-top: 1px solid #ffffff20;
      border-radius: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar button {
      background: transparent;
      outline: none;
      border: none;
      color: #aaaaaa;
      cursor: pointer;
    }

    .navbar a-icon {
      transition: all;
      transition-duration: 300ms;

      color: #aaaaaa;
      fill: #aaaaaa;
      width: 30px;
      height: 30px;
      background: transparent;
    }
    .active {
      color: white !important;
    }

    .bell {
      width: 25px !important;
      height: 25px !important;
    }
  `

  render() {
    return html`
      <a-card variant="glass" class="navbar">
        ${menuItems.map(
          (item) => html`
            <a href="${item.href}">
              <a-icon
                size="md"
                class="${router.get()?.link() === item.href ? 'active' : ''} ${item.className}"
                src="${item.icon}"
              ></a-icon>
            </a>
          `
        )}
      </a-card>
    `
  }
}
