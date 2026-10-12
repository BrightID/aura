export default function Footer() {
  return (
    <footer class="site-footer page-width">
      <div class="footer-top">
        <a class="wordmark" href="/">
          aura<span class="wordmark-dot">.</span>
        </a>
        <p>
          Human trust. Open infrastructure.
          <br />
          Part of the BrightID ecosystem.
        </p>
        <nav aria-label="Footer navigation">
          <a href="/docs">Documentation ↗</a>
          <a href="/core">Aura Core ↗</a>
          <a href="https://discord.gg/y24xeXq7mj">Community ↗</a>
          <a href="https://github.com/Meta-Node/">GitHub ↗</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <span>© {new Date().getFullYear()} Aura</span>
        <span>Decentralized evaluation. Shared verification.</span>
        <a href="/interface/privacy-policy">Privacy policy</a>
      </div>
    </footer>
  );
}
