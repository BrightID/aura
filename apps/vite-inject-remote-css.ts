import type { Plugin } from 'vite';

/**
 * Prepends code to remoteEntry.js that adds a `<link rel="stylesheet">` to `<head>`
 * for each extracted CSS file. The host app (landing) imports only remoteEntry.js,
 * so without these links the remote's CSS would never load. The code runs once, when
 * the host first imports remoteEntry.js. Each href is relative to remoteEntry.js,
 * so the CSS loads from wherever the remote is served.
 *
 * Each link has `data-remote-css="<base>"`, with a trailing slash added if `base`
 * lacks one. Pass the app's Vite `base` here: a remote's own mount() can then find
 * its links with `link[data-remote-css="${import.meta.env.BASE_URL}"]`.
 *
 * With `{ disabled: true }`, the links are added disabled, and the remote's mount()
 * must find and enable them, or its styles never apply. Use it for a remote whose
 * CSS restyles the host page, such as Tailwind's preflight reset: the host then
 * picks up none of that CSS when it imports remoteEntry.js but never calls mount(),
 * for example because the user navigated away during the load.
 */
export function injectRemoteCss(
  base: string,
  { disabled = false } = {},
): Plugin {
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
          return `(()=>{const l=document.createElement("link");l.rel="stylesheet";l.href=new URL(${JSON.stringify(file)},import.meta.url).href;l.dataset.remoteCss=${JSON.stringify(prefix)};${disabled ? 'l.disabled=true;' : ''}document.head.appendChild(l)})();`;
        })
        .join('');
      mount.code = inject + mount.code;
    },
  };
}
