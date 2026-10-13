import { createSignal, Show } from 'solid-js';

export default function Header() {
  const [open, setOpen] = createSignal(false);
  const close = () => setOpen(false);

  return (
    <header
      class="site-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          close();
          document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
        }
      }}
    >
      <a class="wordmark" href="/" aria-label="Aura home">
        <img
          class="brand-mark"
          src="/favicon.ico"
          width="36"
          height="36"
          alt=""
        />
        aura<span class="wordmark-dot">.</span>
      </a>
      <nav class="desktop-nav" aria-label="Main navigation">
        <a href="/#why" rel="external">
          Protocol
        </a>
        <a href="/#how-it-works" rel="external">
          Integrate
        </a>
        <a href="/docs">Docs ↗</a>
      </nav>
      <a class="header-cta" href="/dashboard">
        Launch app <span aria-hidden="true">↗</span>
      </a>
      <button
        class="menu-toggle"
        type="button"
        aria-label={open() ? 'Close menu' : 'Open menu'}
        aria-expanded={open()}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(!open())}
      >
        {open() ? 'Close −' : 'Menu +'}
      </button>
      <Show when={open()}>
        <nav
          id="mobile-navigation"
          class="mobile-nav"
          aria-label="Mobile navigation"
        >
          <a href="/#why" rel="external" onClick={close}>
            Protocol
          </a>
          <a href="/#how-it-works" rel="external" onClick={close}>
            Integrate
          </a>
          <a href="/docs" onClick={close}>
            Docs ↗
          </a>
          <a href="/interface/login" onClick={close}>
            Get verified ↗
          </a>
        </nav>
      </Show>
    </header>
  );
}
