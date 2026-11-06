// The parts of Vite's `import.meta` that src/icon.ts uses, for this package's
// own type check. The apps get the real types from `vite/client`; they don't
// include this file, since nothing imports it.
interface ImportMeta {
  glob<T>(
    pattern: string,
    options: { eager: true; query: string; import: string },
  ): Record<string, T>;
  env?: { DEV?: boolean };
}
