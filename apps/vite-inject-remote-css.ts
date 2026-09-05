import type { Plugin } from 'vite';

/** Injects extracted CSS into remoteEntry.js so the host can load the remote as a module. */
export function injectRemoteCss(base: string): Plugin {
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return {
    name: 'inject-remote-css',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const css = Object.keys(bundle).filter((file) => file.endsWith('.css'));
      const mount = bundle['remoteEntry.js'];
      if (!mount || mount.type !== 'chunk' || css.length === 0) return;
      const inject = css
        .map((file) => {
          const href = `${prefix}${file}`;
          return `(()=>{const l=document.createElement("link");l.rel="stylesheet";l.href=${JSON.stringify(href)};document.head.appendChild(l)})();`;
        })
        .join('');
      mount.code = inject + mount.code;
    },
  };
}
