/**
 * The Lucide icons the apps use, copied into ./icons from lucide-static
 * (a devDependency pinned to the release below). The bundler (Vite) turns
 * each into a URL, inlining the small ones, so no icon is fetched from a CDN.
 *
 * To add an icon: cp node_modules/lucide-static/icons/<name>.svg src/icons/
 *
 * A few icons come from other Iconify sets, saved as <set>--<name>.svg with
 * their license in a comment. Refer to them in code as "set:name", e.g.
 * iconUrl('simple-icons:google').
 */
export const LUCIDE_VERSION = '0.544.0';

const urls = import.meta.glob<string>('./icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

/**
 * URL of a Lucide icon's SVG, for `.a-icon`'s `--icon-url`:
 * `<span class="a-icon" style="--icon-url: url('…')"></span>`.
 * `name` is a Lucide name ("house", or Iconify style "lucide:house"), or
 * "set:name" for the other sets in ./icons. An icon that isn't in ./icons
 * renders empty, with a warning in dev.
 */
export function iconUrl(name: string): string {
  // "lucide:house" is "house"; "mdi:shutdown" is the file mdi--shutdown.svg.
  const file = name.replace(/^lucide:/, '').replace(':', '--');
  const url = urls[`./icons/${file}.svg`];
  if (!url && import.meta.env?.DEV)
    console.warn(`@aura/ui/icon: no "${name}" icon; copy it into src/icons`);
  // Inlined icons are data: URIs with quotes in them (class='lucide …').
  // Percent-encode both kinds, so the URL works in url('…') and url("…").
  return (url ?? '').replace(/'/g, '%27').replace(/"/g, '%22');
}
