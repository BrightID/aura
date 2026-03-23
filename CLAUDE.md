> **LLMs:** Read `.llm/index.md` first for a compact workspace overview (structure, stacks, commands, memory, skills). Return here only when you need specific UI component APIs.

# Aura UI — Component Reference

This monorepo ships a Lit-based design system at `packages/ui` (`@aura/ui`). All apps in `./apps` consume it. Use this document when building any UI inside the apps.

## Setup

### Lit apps (interface, dashboard, players, docs)

```ts
// Import the components you need — side-effect imports register the custom elements
import "@aura/ui"  // registers all elements

// Or import selectively
import "@aura/ui/src/components/button"
import "@aura/ui/src/components/card"
```

Always wrap the root of your app (or `<body>`) with `<a-theme-provider>` once:

```html
<a-theme-provider>
  <!-- your entire app goes here -->
</a-theme-provider>
```

### React / Next.js apps (web)

React wrappers are auto-generated at build time into `packages/ui/src/react-wrappers/`. Import from there:

```tsx
import { AButton, ACard, AInput } from "@aura/ui/src/react-wrappers"
```

---

## Theme Provider

`<a-theme-provider>` injects all CSS custom properties used by every component. **Must be an ancestor of all UI components.**

```html
<a-theme-provider>
  <main>...</main>
</a-theme-provider>
```

### CSS custom properties (available everywhere inside the provider)

| Token | Use |
|---|---|
| `--background` | Page background |
| `--foreground` | Default text color |
| `--primary` / `--primary-foreground` | Brand color pair |
| `--secondary` / `--secondary-foreground` | Secondary color pair |
| `--muted` / `--muted-foreground` | Subdued backgrounds / text |
| `--accent` / `--accent-foreground` | Accent teal pair |
| `--destructive` / `--destructive-foreground` | Error/delete color pair |
| `--card` / `--card-foreground` | Card surface pair |
| `--border` | Borders and dividers |
| `--radius` | Base border radius (`0.75rem`) |
| `--aura-success` | Green success color |
| `--aura-warning` | Amber warning color |
| `--aura-info` | Blue info color |

---

## Components

### `<a-button>`

```html
<a-button>Click me</a-button>
<a-button variant="secondary" color="destructive" size="sm">Delete</a-button>
<a-button variant="ghost" disabled>Disabled</a-button>
```

| Prop | Type | Default | Values |
|---|---|---|---|
| `variant` | string | `"default"` | `"default"` `"secondary"` `"ghost"` |
| `color` | string | `"primary"` | `"primary"` `"secondary"` `"success"` `"warning"` `"destructive"` |
| `size` | string | `"md"` | `"sm"` `"md"` `"lg"` |
| `disabled` | boolean | `false` | — |

No events — wraps a `<slot>`, so nest a native `<button>` or listen on the element itself.

---

### `<a-input>`

```html
<a-input label="Email" type="email" placeholder="you@example.com"></a-input>

<!-- With icon slot -->
<a-input label="Search">
  <a-icon slot="icon" name="search"></a-icon>
</a-input>
```

| Prop | Type | Default |
|---|---|---|
| `type` | `"text"` `"email"` `"password"` `"number"` | `"text"` |
| `label` | string | — |
| `name` | string | `"input-text"` |
| `placeholder` | string | `""` |
| `value` | string | `""` |
| `disabled` | boolean | `false` |

**Slots:** `icon` — prepends an icon inside the input field.

**Events:**

| Event | Detail | Description |
|---|---|---|
| `change` | `string` (the current value) | Fires on every keystroke |

```js
input.addEventListener("change", (e) => console.log(e.detail))
```

---

### `<a-button>` + `<a-input>` together

```html
<a-flex gap="4" align="end">
  <a-input label="Name" name="name"></a-input>
  <a-button>Save</a-button>
</a-flex>
```

---

### `<a-badge>`

```html
<a-badge>Default</a-badge>
<a-badge variant="destructive" size="sm">Error</a-badge>
<a-badge variant="glass" rounded>Premium</a-badge>
<a-badge removable @remove=${handleRemove}>Tag</a-badge>
```

| Prop | Type | Default | Values |
|---|---|---|---|
| `variant` | string | `"default"` | `"default"` `"secondary"` `"outline"` `"destructive"` `"accent"` `"glass"` |
| `size` | string | `"md"` | `"xs"` `"sm"` `"md"` `"lg"` |
| `rounded` | boolean | `false` | — |
| `removable` | boolean | `false` | — |

**Events:**

| Event | Detail | Description |
|---|---|---|
| `remove` | `{ badge: BadgeElement }` | Fires when the × button is clicked |

---

### `<a-card>`

```html
<a-card>
  <a-head level="3">Title</a-head>
  <a-text variant="muted">Description text here.</a-text>
</a-card>

<a-card variant="glass">Glass morphism card</a-card>
```

| Prop | Type | Default | Values |
|---|---|---|---|
| `variant` | string | `"default"` | `"default"` `"glass"` |

CSS overrides: `--card-bg`, `--card-border`, `--blur` (for glass).

---

### `<a-dialog>`

```html
<a-dialog .open=${isOpen} @open-change=${(e) => isOpen = e.detail.open}>
  <a-button slot="trigger">Open dialog</a-button>

  <div slot="content">
    <a-head level="3">Confirm action</a-head>
    <a-text>Are you sure?</a-text>
    <a-button color="destructive">Yes, delete</a-button>
  </div>
</a-dialog>
```

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `false` |

**Slots:** `trigger` (click opens dialog), `content` (dialog body).

**Events:**

| Event | Detail | Description |
|---|---|---|
| `open-change` | `{ open: boolean }` | Fired when dialog opens or closes |

**Programmatic control:**

```js
const dialog = document.querySelector("a-dialog")
dialog.show()   // opens
dialog.hide()   // closes (with animation)
```

Backdrop click and Escape key both call `hide()` automatically.

---

### `<a-popover>`

```html
<a-popover side="bottom" align="start">
  <a-button slot="trigger">Options</a-button>

  <div slot="content">
    <p>Popover content here</p>
  </div>
</a-popover>
```

| Prop | Type | Default | Values |
|---|---|---|---|
| `open` | boolean | `false` | — |
| `side` | string | `"bottom"` | `"top"` `"right"` `"bottom"` `"left"` |
| `align` | string | `"center"` | `"start"` `"center"` `"end"` |
| `sideOffset` | number | `4` | px |

**Events:**

| Event | Detail | Description |
|---|---|---|
| `open-changed` | `{ open: boolean }` | Fires on open/close toggle |

Closes on outside click and Escape key.

---

### `<a-hover-card>`

Three-part component. The hover card opens after `openDelay` ms when hovering or focusing the trigger.

```html
<a-hover-card side="bottom">
  <a-hover-card-trigger slot="trigger">
    Hover me
  </a-hover-card-trigger>

  <a-hover-card-content slot="content">
    <a-text variant="small">Info shown on hover</a-text>
  </a-hover-card-content>
</a-hover-card>
```

| Prop | Type | Default | Values |
|---|---|---|---|
| `openDelay` | number | `100` | ms |
| `closeDelay` | number | `200` | ms |
| `side` | string | `"bottom"` | `"top"` `"bottom"` `"left"` `"right"` |

---

### `<a-tabs>` / `<a-tab>` / `<a-tab-panel>`

```html
<a-tabs value="overview">
  <a-tab value="overview">Overview</a-tab>
  <a-tab value="settings">Settings</a-tab>

  <a-tab-panel slot="panel" value="overview">
    <p>Overview content</p>
  </a-tab-panel>

  <a-tab-panel slot="panel" value="settings">
    <p>Settings content</p>
  </a-tab-panel>
</a-tabs>
```

| Component | Prop | Type | Default |
|---|---|---|---|
| `a-tabs` | `value` | string | `""` (auto-selects first) |
| `a-tab` | `value` | string | `""` |
| `a-tab-panel` | `value` | string | `""` |

**Note:** `a-tab-panel` elements must use `slot="panel"`.

**Events on `<a-tabs>`:**

| Event | Detail | Description |
|---|---|---|
| `change` | `{ value: string }` | Fires when active tab changes |

---

### `<a-icon>`

Uses Lucide icons by default (loaded from unpkg CDN). Icons are cached after first fetch.

```html
<!-- By name (Lucide icon) -->
<a-icon name="user"></a-icon>
<a-icon name="settings" size="lg"></a-icon>

<!-- From URL -->
<a-icon src="/icons/custom.svg" label="Custom icon"></a-icon>

<!-- Decorative (aria-hidden) — no label needed -->
<a-icon name="arrow-right"></a-icon>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | string | — | Lucide icon name (kebab-case) |
| `src` | string | — | Direct SVG URL (overrides `name`) |
| `size` | string | `""` | `"sm"` (1rem) `"md"` (1.5rem) `"lg"` (2rem) |
| `label` | string | `""` | Accessible label; if empty, icon is `aria-hidden` |

---

### `<a-toast>` (imperative API)

Add `<a-toaster>` once at the top level of your app:

```html
<a-theme-provider>
  <a-toaster></a-toaster>
  <!-- rest of app -->
</a-theme-provider>
```

Then call `toast()` from anywhere:

```ts
import { toast } from "@aura/ui"

toast("Saved successfully")
toast.success("Profile updated!")
toast.error("Something went wrong", { description: "Check your connection." })
toast.warning("Storage almost full")
toast.info("New version available")
toast.loading("Uploading...")

// With action button
toast("File deleted", {
  action: {
    label: "Undo",
    onClick: () => restoreFile(),
  },
})

// Promise helper
await toast.promise(uploadFile(), {
  loading: "Uploading...",
  success: "Upload complete!",
  error: (err) => `Failed: ${err.message}`,
})

// Dismiss programmatically
const id = toast.loading("Processing...")
toast.dismiss(id)
```

| Option | Type | Default |
|---|---|---|
| `id` | string | auto UUID |
| `duration` | number (ms) | `4000` (`Infinity` for loading) |
| `variant` | `"success"` `"error"` `"warning"` `"info"` `"loading"` `"default"` | `"default"` |
| `description` | string | — |
| `action` | `{ label: string; onClick: () => void }` | — |

---

### `<a-grid>`

```html
<!-- Slot-based usage -->
<a-grid cols-lg="3" cols-md="2" cols-xs="1" gap="1.5rem">
  <a-card>Item 1</a-card>
  <a-card>Item 2</a-card>
  <a-card>Item 3</a-card>

  <div slot="header">
    <a-head level="2">Grid title</a-head>
  </div>

  <p slot="empty">Nothing here yet.</p>
</a-grid>

<!-- Data-driven usage -->
<a-grid .items=${[
  { title: "Card 1", subtitle: "Subtitle", image: "/img/1.jpg" },
  { title: "Card 2" },
]}></a-grid>
```

| Prop | Type | Default |
|---|---|---|
| `cols-lg` | number | `4` (≥1024px) |
| `cols-md` | number | `3` (≥768px) |
| `cols-sm` | number | `2` (≥480px) |
| `cols-xs` | number | `1` |
| `gap` | string | `"1.25rem"` |
| `card-aspect` | string | `"4 / 3"` |
| `items` | `GridItem[]` | `[]` |

**Slots:** default (grid items), `header`, `empty`.

---

### `<a-flex>`

```html
<a-flex direction="row" gap="4" justify="between" align="center">
  <a-text>Left</a-text>
  <a-button>Right</a-button>
</a-flex>

<a-flex direction="col" gap="1">
  <a-input label="First name"></a-input>
  <a-input label="Last name"></a-input>
</a-flex>
```

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | string | `"row"` | `"row"` `"col"` |
| `gap` | number | `10` | `1` → `var(--sm)`, `4` → `var(--md)` |
| `wrap` | boolean | `false` | — |
| `justify` | string | `"start"` | `"start"` `"center"` `"end"` `"between"` |
| `align` | string | `"start"` | `"start"` `"center"` `"end"` |

---

### `<a-container>`

Responsive max-width wrapper (max `1920px`):

```html
<a-container>
  <a-head>Page title</a-head>
  <!-- content -->
</a-container>
```

---

### `<a-head>`

Semantic heading with responsive sizing. Does **not** render `<h1>`–`<h6>` HTML — it is purely visual. Use for visual hierarchy.

```html
<a-head level="1">Page title</a-head>
<a-head level="3">Section</a-head>
```

| Prop | Type | Default |
|---|---|---|
| `level` | `"1"`–`"6"` | `"2"` |

---

### `<a-text>`

```html
<a-text variant="lead">Subtitle paragraph</a-text>
<a-text variant="muted">Helper text</a-text>
<a-text variant="small">Fine print</a-text>
```

| Prop | Type | Default | Values |
|---|---|---|---|
| `variant` | string | `"body"` | `"title"` `"lead"` `"body"` `"small"` `"muted"` |

---

### `<a-separator>`

```html
<a-separator></a-separator>
```

Renders a 1px horizontal rule with `var(--border)` color. No props.

---

## Common patterns

### Form layout

```html
<a-card>
  <a-head level="3">Edit profile</a-head>
  <a-separator></a-separator>
  <a-flex direction="col" gap="1">
    <a-input label="Display name" name="name"></a-input>
    <a-input label="Email" type="email" name="email"></a-input>
  </a-flex>
  <a-flex justify="end" gap="4" style="margin-top: 1rem">
    <a-button variant="ghost">Cancel</a-button>
    <a-button>Save changes</a-button>
  </a-flex>
</a-card>
```

### Confirmation dialog

```html
<a-dialog .open=${open} @open-change=${(e) => open = e.detail.open}>
  <a-button slot="trigger" variant="ghost" color="destructive">Delete</a-button>
  <div slot="content">
    <a-head level="3">Are you sure?</a-head>
    <a-text variant="muted">This action cannot be undone.</a-text>
    <a-flex justify="end" gap="4" style="margin-top:1.5rem">
      <a-button variant="ghost" @click=${() => open = false}>Cancel</a-button>
      <a-button color="destructive" @click=${handleDelete}>Delete</a-button>
    </a-flex>
  </div>
</a-dialog>
```

### Status badge row

```html
<a-flex gap="1" align="center">
  <a-badge variant="accent" rounded size="sm">Live</a-badge>
  <a-badge variant="outline" size="sm">Draft</a-badge>
  <a-badge variant="destructive" size="sm">Error</a-badge>
</a-flex>
```

---

## Styling components

All components expose CSS custom properties. Set them on the element or a parent:

```css
/* Override radius for all buttons on a page */
a-button {
  --radius: 0.25rem;
}

/* Override card background */
.hero a-card {
  --card-bg: oklch(0.2 0.03 260 / 0.6);
}
```

You can also use `::part()` on components that expose `part` attributes (`a-grid` exposes `grid`, `item`, `empty`).

---

## What NOT to do

- Do not use `@aura/ui` components outside `<a-theme-provider>` — CSS variables will be missing.
- Do not set `open` on `<a-dialog>` and also use the trigger slot without binding `@open-change` — they will conflict. Either use the trigger slot (uncontrolled) or `.open` + `@open-change` (controlled), not both.
- Do not nest `<a-toaster>` more than once — duplicate toasters will show the same toasts twice.
- `<a-icon name="...">` loads from unpkg CDN. Ensure the app has network access, or provide `src` pointing to a locally bundled SVG.
- `<a-head>` does not produce semantic heading HTML. If SEO or screen reader heading hierarchy matters, use a native `<h1>`–`<h6>` and style it instead.
