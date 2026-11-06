# CLAUDE.md

`@aura/ui` is Aura's design system as CSS, consumed from source by the apps in `../../apps/`. README.md explains what it is and why. This file covers what to know when editing it.

## Commands

```bash
bun run test:visual   # from the repo root: screenshot check of every app (scripts/visual-check.mjs)
bun test              # toast store tests (src/toast.test.ts)
bun run check-types   # tsc for src/toast.ts and src/icon.ts
```

There is no build: the apps import `src/` directly through the `exports` in package.json.

## Files

- `src/tokens.css`: design tokens on `:root, .dark` and `.light, .aura-theme-light` (the same light palette; the dashboard's widget preview uses the second class). Every app and every component reads these, so a rename here breaks all of them.
- `src/aura.css`: imports the tokens, maps them to Tailwind colours in `@theme inline`, and defines the `.a-*` classes in `@layer components`.
- `src/icon.ts` and `src/icons/`: `iconUrl(name)` returns the bundled SVG for `.a-icon`. Only the icons copied into `src/icons/` exist; copy new ones from `node_modules/lucide-static/icons/` (pinned to `LUCIDE_VERSION`). `src/vite-env.d.ts` types `import.meta.glob` for this package's own type check.
- `src/toast.ts`: the toast store. It mutates each toast object in place and `emit()` sends the array, so a renderer must key its nodes by toast (or id) and still see in-place changes; keying by position reuses a dismissed toast's node for the next one. See `apps/core/src/components/ui/toaster.tsx` and `apps/dashboard/app/components/aura-toaster.tsx`.

## Rules for aura.css

- Keep every class in `@layer components`, so Tailwind utilities override it without `!important`.
- Name classes `a-<component>` and put variants in data attributes (`data-variant`, `data-size`, `data-color`), not modifier classes: a call site can write `data-variant={expr}` directly, where a modifier class would need string building.
- Don't rely on Tailwind's base reset. Interface loads aura.css without it, so each class sets the `font-family`, `border`, `margin` and `box-sizing` it needs.
- Use tokens (`var(--primary)`, `var(--radius)`), never literal colours.
- Document the expected markup in a comment above each class.
- Give every class for a focusable element a `:focus-visible` style, and add any new movement to the `prefers-reduced-motion` block.

After any change to aura.css or tokens.css, run `bun run test:visual` from the repo root. Rebaseline with `--update` only when every reported difference is intended, and look at each diff image in `tests/visual/out/` first.

If a class's markup changes, update its users: core (`apps/core/src`), the dashboard (`apps/dashboard/app`, including the shadcn wrappers in `components/ui/`), interface and the widgets (`apps/interface/src`, `packages/widgets/src`), and the docs registry (`apps/docs/app/components/_registry`).
