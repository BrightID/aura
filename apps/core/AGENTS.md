# AGENTS.md — porting the old Aura app into `apps/core`

You are porting one small slice of the **old React app** (`apps/aura`) into the
**new SolidJS app** (`apps/core`). Pick up a single task from `PORTING_PLAN.md`,
finish it end to end, leave the tree green. Assume a fresh, small context — this
file plus your one task is all you need.

## The two apps

| | Old app (source of truth for *behavior*) | New app (where you write code) |
|---|---|---|
| Path | `apps/aura` | `apps/core` |
| Framework | React 18 + React Router | **SolidJS** + `@solidjs/router` |
| State | Zustand + Redux (brightid feature) | `solid-js/store` + `makePersisted` |
| Data | React Query | `@tanstack/solid-query` |
| Styling | Tailwind + shadcn | Tailwind + `@aura/ui` web components (`<a-*>`) |
| Shared logic | inline in app | `packages/domain` (`@aura/domain`) |

**Port behavior, not code.** The old files tell you *what the feature does*. Do
not transliterate JSX or hooks 1:1 — rewrite idiomatically for Solid and lean on
what `apps/core` and `@aura/domain` already provide.

## Golden rules

1. **Reuse before you write.** Before adding anything, grep `apps/core/src`,
   `packages/domain/src`, and `packages/ui/src`. Most scoring, crypto,
   view-mode, and type logic already lives in `@aura/domain`. Custom UI
   primitives (`a-button`, `a-card`, `a-tabs`, `a-dialog`, …) already exist in
   `@aura/ui`. If the old app had a 200-line component and the data already
   exists in a hook, your port may be 40 lines.

2. **Simplify as you go — this is expected, not optional.** The old app carries
   dead code, commented-out blocks, duplicated helpers, and over-deep prop
   drilling. Drop it. If a logic path can be smaller or clearer in Solid
   (`createMemo`, `Show`, `Switch`, `For` instead of nested ternaries and
   `.map`), do that. Leave the new code smaller than the old. Note in your
   summary anything you intentionally dropped.

3. **Match `apps/core` conventions exactly** (not the old app's):
   - Double quotes, no semicolons. 2-space indent.
   - `class=` not `className=`. `@/` is `apps/core/src`.
   - Reactive values are **accessors** (`foo()`), pass them as `() => x`, never
     read-then-pass. Derive with `createMemo`. Effects with `createEffect`.
   - Data fetching = a `queryOptions`-style function in `src/queries/` + a
     `createQuery` wrapper; components consume a hook in `src/hooks/`.
   - Persisted state via `makePersisted`; sensitive/decrypted data stays
     memory-only (see `providers.tsx` allowlist).
   - Look at a sibling file before writing a new one and mirror its shape.

4. **Shared logic goes in `@aura/domain`, not the app.** Pure functions
   (scoring, parsing, crypto, diffing, formatting that other apps would want)
   belong in `packages/domain/src`. UI-only glue stays in `apps/core`. If your
   task needs a pure helper, add it to domain and import it.

5. **Stay in your lane.** Do only your task. If you discover an adjacent gap,
   write it down in your summary as a suggested follow-up task — don't expand
   scope. Don't touch unrelated files. Don't reformat files you didn't change.

## Workflow

1. Read your task in `PORTING_PLAN.md`. Open every old-app file it references.
2. Grep `apps/core` + `@aura/domain` for anything reusable. List what you'll
   reuse vs. what you must add.
3. Write the smallest correct Solid implementation. Prefer pure helpers in
   `@aura/domain` + a thin component/hook in `apps/core`.
4. Verify (see below). Fix until green.
5. Write a short summary: what you ported, what you reused, what you
   deliberately simplified/dropped, and any follow-up tasks you spotted.

## Verify before you finish

Run from `apps/core`:

```bash
bunx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "<files you touched>"
```

- **There are pre-existing tsc/biome errors** in the repo (`about.tsx`,
  `packages/ui` Lit decorators, etc.). They are not yours. Filter tsc output to
  the files you changed and make sure *those* are clean.
- The repo `biome.json` says single-quote/semicolons, but **`apps/core` is
  actually written double-quote/no-semicolon** — every existing core file
  "fails" biome. Match the existing core files, not biome.
- If your task is visible UI, describe the manual check (route to hit, state to
  reach). Use the `run` skill / dev server only if the task says to.

## Definition of done

- Feature behaves like the old app (or the documented reduced scope).
- Only your task's files changed; `tsc` clean for them.
- New code is smaller/clearer than the old; no dead or commented-out code.
- Reused `@aura/domain` / `@aura/ui` wherever possible.
- Summary written, including dropped scope + suggested follow-ups.
