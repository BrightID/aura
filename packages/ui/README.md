# @aura/ui

Aura's design system, as CSS, plus two small helpers:

- **`@aura/ui/tokens.css`**: the colour, radius and spacing tokens as custom properties on `:root`. Dark by default; add the `light` class to `<html>` for the light palette.
- **`@aura/ui/aura.css`**: imports the tokens, maps them to Tailwind colours (`bg-primary`, `text-muted-foreground`, …) and defines the component classes.
- **`@aura/ui/toast`**: a small toast store (`toast()`, `toast.success()`, `subscribe()`) with no framework dependency. Each app renders it with its own toaster.
- **`@aura/ui/icon`**: `iconUrl(name)`, the URL of a Lucide icon for `.a-icon`. The icons ship in `src/icons/` and the bundler inlines them, so nothing loads from a CDN.

## Use it

Import the stylesheet once, after Tailwind:

```css
@import 'tailwindcss';
@import '@aura/ui/aura.css';
```

Then put a class on a native element. Variants are data attributes:

```html
<button class="a-button" type="button" data-variant="ghost" data-size="sm">Edit</button>
<div class="a-card" data-variant="default">…</div>
<input class="a-input" placeholder="Email" />
```

The classes are `.a-button`, `.a-card`, `.a-badge`, `.a-text`, `.a-head`, `.a-input`, `.a-input-group`, `.a-field`, `.a-switch`, `.a-slider`, `.a-tabs`/`.a-tab`, `.a-dialog`, `.a-sheet`, `.a-menu`, `.a-popover`, `.a-skeleton`, `.a-separator`, `.a-progress`, `.a-avatar`, `.a-icon` and `.a-toast`. Each one's markup is in a comment above it in `src/aura.css`. The docs app (`apps/docs`, served at `/docs`) has a live playground for each of them except `.a-icon`.

Any Tailwind utility on the same element overrides a component class: the classes are in `@layer components`, below `utilities`.

Every class for a focusable element has a `:focus-visible` style, and under `prefers-reduced-motion: reduce` the classes stop pulsing, scaling and sliding.

## Why a stylesheet and not components

Every Aura app uses a different framework: core is Solid, the dashboard is React, interface and the widgets are Lit. One set of classes on native elements works in all of them, ships no JavaScript, and never sits behind a shadow root that Tailwind can't reach. Behaviour comes from the platform (`<dialog>`, the `popover` attribute, native form controls) or from each app's own small components.

The class names start with `a-` because landing loads several apps into one document, and a generic name such as `.badge` is already taken there.

## Change it

Edit `src/aura.css` or `src/tokens.css`. There is no build step: the apps import the source.

Then run the screenshot check from the repository root: `bun run test:visual`. It builds the apps' test pages (core, interface, the widgets and the dashboard, in dark and light), screenshots them in headless Chrome, and compares each with its baseline in `tests/visual/`. A failure leaves the new screenshot and a diff image, changed pixels in red, in `tests/visual/out/`. When a change is intended, run `bun run test:visual --update` and commit the new baselines. Fonts differ between machines, so make baselines where the check runs.

Run `bun test` for the toast store's tests and `bun run check-types` for the TypeScript.

To use a new icon, copy it from the pinned Lucide release: `cp node_modules/lucide-static/icons/<name>.svg src/icons/`. An icon missing from `src/icons/` renders empty, with a warning in development.

To move to a newer Lucide release, bump `lucide-static` in package.json and `LUCIDE_VERSION` in `src/icon.ts`, then copy the icons in `src/icons/` again from the new release. Lucide renames icons between releases, so check that each name still exists.
