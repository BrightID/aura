import type { Plugin } from 'vite';

/**
 * Prepends code to remoteEntry.js that adds a `<link rel="stylesheet">` to `<head>`
 * for each extracted CSS file. The host imports only remoteEntry.js, so without these
 * links the remote's CSS would never load. Each href is relative to remoteEntry.js,
 * so the CSS loads from wherever the remote is served.
 *
 * Each link has `data-remote-css="<base>"`. A remote's mount() can find its own links
 * by matching that against `import.meta.env.BASE_URL`, so `base` must equal the app's
 * Vite `base`.
 */
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
          return `(()=>{const l=document.createElement("link");l.rel="stylesheet";l.href=new URL(${JSON.stringify(file)},import.meta.url).href;l.dataset.remoteCss=${JSON.stringify(prefix)};document.head.appendChild(l)})();`;
        })
        .join('');
      mount.code = inject + mount.code;
    },
  };
}
