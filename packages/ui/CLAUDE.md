# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the Vite dev server (component playground)
bun dev

# Build the library (runs prebuild automatically)
bun build
# prebuild = bun analyze && bun generate:components

# Regenerate custom-elements.json manifest
bun analyze

# Regenerate React wrappers from the manifest
bun generate:components
```

No test suite exists yet (see README TODO list).

## Architecture

This is the `@aura/ui` Lit-based design system library, consumed by apps in `../../apps/`.

### Component authoring

- Each component lives in `src/components/<name>.ts` as a standard `LitElement` with `@customElement('a-<name>')`.
- All components are barrel-exported from `src/components/index.ts` → `src/index.ts`.
- Styles use CSS custom properties from `<a-theme-provider>` (defined in `theme-provider.ts`). Always use these tokens (`--primary`, `--border`, `--radius`, etc.) rather than hard-coded values.
- Register the element's tag name in the `declare global { interface HTMLElementTagNameMap }` block at the bottom of the file.

### Build pipeline

1. `bun analyze` — `@custom-elements-manifest/analyzer` reads `src/components/**` and writes `custom-elements.json`.
2. `bun generate:components` — `scripts/generate-react-wrappers.ts` reads `custom-elements.json` and generates `src/react-wrappers/<name>.react.tsx` files (one per custom element) plus `src/react-wrappers/index.ts`. **Never edit these files by hand.**
3. `tsc && vite build` — compiles TypeScript and bundles the library into `dist/` with `preserveModules` (one `.mjs` per source file), plus `.d.ts` declarations via `vite-plugin-dts`.

The build uses `rolldown-vite` (a faster Vite fork) — the `overrides` field in `package.json` aliases `vite` to it.

### Package exports

The package exports source directly (not `dist/`) for workspace consumers:
```json
".":  "./src/index.ts"
"./*": "./src/*"
```
`dist/` is only produced for publishing.

### React wrappers

Generated wrappers use `@lit/react`'s `createComponent`. They are optional peer dependencies — React apps import from `@aura/ui/src/react-wrappers`.
