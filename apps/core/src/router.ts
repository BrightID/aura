import type { RouteDefinition } from '@solidjs/router';
import { type Component, lazy } from 'solid-js';

/**
 * File-system routing for @solidjs/router.
 *
 * Every `*.tsx` under `./routes` becomes a route. Vite's `import.meta.glob`
 * discovers them at build time and each page is `lazy()`-loaded (code-split).
 *
 * File / folder name            URL                  Note
 * ------------------------------------------------------------------------
 * routes/index.tsx              /
 * routes/about.tsx              /about
 * routes/subject/[id].tsx       /subject/:id         dynamic param
 * routes/[...404].tsx           *                    catch-all
 * routes/_layout.tsx            (wraps its folder)   layout, renders the
 *                                                    matched child via
 *                                                    `props.children`
 * routes/_app/dashboard.tsx     /dashboard           folders starting with
 * routes/_app/_layout.tsx       (wraps _app/*)       `_` are PATHLESS: they
 *                                                    share a layout without
 *                                                    adding a URL segment
 *                                                    (cf. react-router `_app`)
 */

type Mod = { default: Component<any> };
type Loader = () => Promise<Mod>;

type Node = {
  layout?: Loader; // `_layout.tsx`   — wraps this folder
  index?: Loader; //  `index.tsx`    — this folder's own path
  pages: Record<string, Loader>; // other files, keyed by URL segment
  dirs: Record<string, Node>; //     sub-folders, keyed by raw folder name
};

const newNode = (): Node => ({ pages: {}, dirs: {} });

/** A folder/file name that maps to nothing in the URL. */
const isPathless = (name: string) => name.startsWith('_');

/** `[id]` -> `:id`, `[...rest]` -> `*`, otherwise the name unchanged. */
const toSegment = (name: string): string => {
  if (name.startsWith('[...')) return '*';
  const param = name.match(/^\[(.+)\]$/);
  return param ? `:${param[1]}` : name;
};

/** Group the flat glob result into a directory tree. */
function buildTree(files: Record<string, Loader>): Node {
  const root = newNode();
  for (const [file, loader] of Object.entries(files)) {
    const parts = file
      .replace(/^\.\/routes\//, '')
      .replace(/\.tsx$/, '')
      .split('/');
    const name = parts.pop()!;

    let node = root;
    for (const dir of parts) node = node.dirs[dir] ??= newNode();

    if (name === '_layout') node.layout = loader;
    else if (name === 'index') node.index = loader;
    else node.pages[toSegment(name)] = loader;
  }
  return root;
}

/** Route definitions for a node's pages, relative to the node's own path. */
function toRoutes(node: Node): RouteDefinition[] {
  const routes: RouteDefinition[] = [];

  if (node.index) routes.push({ path: '/', component: lazy(node.index) });
  for (const [segment, loader] of Object.entries(node.pages)) {
    routes.push({ path: segment, component: lazy(loader) });
  }

  for (const [dir, child] of Object.entries(node.dirs)) {
    const children = toRoutes(child);
    const segment = isPathless(dir) ? '' : toSegment(dir);

    if (child.layout) {
      // A layout folder becomes a nested parent route. Solid joins the
      // parent + child paths; a pathless parent (no `path`) joins nothing.
      const component = lazy(child.layout);
      routes.push(
        segment
          ? { path: segment, component, children }
          : { component, children },
      );
    } else if (segment) {
      // Plain folder, no layout: flatten its pages under the folder segment.
      for (const route of children) {
        routes.push({ ...route, path: join(segment, route.path) });
      }
    } else {
      // Pathless folder, no layout: pure grouping — lift pages as-is.
      routes.push(...children);
    }
  }

  return routes;
}

const join = (segment: string, path?: string) =>
  !path || path === '/' ? segment : `${segment}/${path.replace(/^\//, '')}`;

const root = buildTree(import.meta.glob<Mod>('./routes/**/*.tsx'));
const routes = toRoutes(root);

export const appRoutes: RouteDefinition[] = root.layout
  ? [{ path: '/', component: lazy(root.layout), children: routes }]
  : routes;
