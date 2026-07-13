# Porting plan — `apps/aura` (old React) → `apps/core` (new Solid)

Read `AGENTS.md` first. Each task below is sized for one agent with a small
context window. Tasks list: **goal · old refs · target · scope/done · size ·
deps**. Do one, verify, summarize. Tackle milestones top-down; within a
milestone most tasks are independent unless `deps` says otherwise.

Size key: **S** ≈ <1h / one file · **M** ≈ a few files · **L** = split further
if it feels big (flag it in your summary).

---

## Status snapshot (what already exists in `apps/core`)

**Done:** login/recovery flow · settings page · `/home/:view` layout + Evaluate
list + Level Up tab · profile header/info cards · level-progress +
requirements-checklist · view-mode/session/backup/subjects-list/my-evaluations/
verifications hooks · connections+backup queries · auth/preferences/operations/
roles/recovery/onboarding stores · `@aura/domain` (crypto, http, channel,
recovery, levels, score, verifications, view-mode, types).

**Also done since:** M0 (subject-card badges, header gating, list controls) ·
M1 (evaluate operation builder/mutation/modal/wiring/overlay/notifications) ·
M2 T2.1–T2.4 (`/subject/:id` layout + Overview/Evaluations/Connections tabs,
`use-subject-inbound-evaluations` hook, `evaluation-card`) · T4.6 404
catch-all · passkey login (`@aura/domain/passkeys` + login page).

**Also done:** T4.1 `/role-management` · T4.4 `/contact-info` (contacts store +
bcrypt-hash mutation) · T4.5 `/onboarding` (URL-stepped, no Swiper) · glass
design pass (a-button `glass` variant in `@aura/ui`, applied with
`a-card[variant=glass]` across home/subject/settings).

**Also done:** M3 notifications (`@aura/domain/notifications` pure diff ·
notifications store + headless checker in providers · `/notifications` route ·
unread-badge bell in home header) · T4.2 `/dashboard` · T4.3 `/domain-overview`
(static stats, as planned).

**Also done:** T2.5 evaluations chart — lightweight CSS-bars
(`components/charts/evaluations-chart.tsx`, no chart lib), slotted into the
subject Overview tab + credibility-details dialog, plus a mini impact strip on
`subject-card`. Old drag-zoom replaced by explicit window-based zoom/pan
controls (`components/charts/zoom-controls.tsx`); strip no longer scrolls (bars
flex to fit, capped max-width).

**Also done:** T5.1 profile pictures (`components/home/avatar.tsx` — real
backup photo with initials fallback + hover preview) · T5.2 list states +
infinite scroll (`components/list/list-state.tsx` + `incremental-list.tsx`,
IntersectionObserver-paced `<For>`; adopted in home evaluate list, subject
evaluations/connections/activity tabs, notifications, contact-info).

**Also done:** T5.3 global search (`components/search/global-search.tsx` —
dialog with live connection results; row click → `/subject/:id`, Enter →
`/home/player?search=`; home-list search now lives in the `?search=` URL param
so deep links pre-filter) · persistent app header ported from the old
`DefaultHeader` (`components/shared/app-header.tsx` in the root layout: home /
search / bell / settings on all signed-in pages; home keeps its own header,
now with search + settings too; bell extracted to
`components/shared/notification-bell.tsx`) · subject page honors an injected
`?name=` for ids the backup can't resolve.

**Also done (aider-assisted pass):** chart help dialog
(`components/charts/chart-help.tsx` — palette strips per evaluator kind,
slotted next to the impact chart caption) · param-less `/subject` →
own-profile redirect (`routes/subject/index.tsx`) · IndexedDB-blocked
fallback screen on the splash (`shared/lib/db-check.ts` + gate in
`routes/index.tsx`) · `?gravatar=` injected avatar (Avatar `fallbackSrc`,
threaded through `subject-profile-card`; direct gravatar image URL — the old
gravatar-profile fetch was dropped). Old connections-help modal not ported:
its content explains smart-sort tiers that core deliberately dropped.

**Also done:** PWA — dependency-free (registry was unreachable, so no
`vite-plugin-pwa`): `sw-plugin.ts` emits `manifest.webmanifest` + a `sw.js`
that precaches the build (cache-first static, network-first navigation,
SKIP_WAITING activation); `shared/lib/pwa.ts` registers it (prod only,
hourly update poll) and exposes a `needRefresh` signal consumed by the
update toast (`components/shared/update-prompt.tsx`, mounted in providers)
and an Update button on the settings version card. Old push/periodic-sync
notifications NOT ported.

**Remaining (untracked follow-ups, all optional):** push notifications
(old `prompt-sw.ts` periodicsync + Notification API) · i18n (old i18next —
copy is English-only, likely fine to drop).

**Also done:** T2.6 credibility-details modal (collapsed to per-role stat rows,
no chart/tabs).

**Status:** all milestones M0–M5 done (task-level notes above). Active work is
polish/bugfixes on `aura/fix/rerender-issues`: chart zoom/pan + no-scroll bars,
passkey node-connection fallback for the evaluate list, apply-time cache
invalidation on settled ops, and the credibility "View profile" nav fix. Only
the optional untracked follow-ups (PWA, i18n) remain.

---

## M0 — Finish Home (low risk, builds on what exists)

### T0.1 — Subject-card per-row level/score · S
- **Old:** `apps/aura/src/components/evaluation/SubjectCard.tsx`
- **Target:** `apps/core/src/components/home/subject-card.tsx` (remove its `NOTE:`)
- **Done:** show the subject's level/score badge per row using
  `useSubjectVerifications(() => id, category)`. Keep the row lean — one small
  verifications read, no chart. If per-row fetching is heavy, note it and cap.

### T0.2 — Home-header role gating · S
- **Old:** role-locked tabs logic in `apps/aura` header/home + `useLevelupProgress`
- **Target:** `apps/core/src/components/home/home-header.tsx` (remove its `NOTE:`)
- **Done:** Trainer/Manager view buttons disabled until unlocked
  (`useLevelupProgress` per category). Mirror the Level Up tab gating already in
  `home/[view]/_layout.tsx`.

### T0.3 — Subjects list: filter + sort · M
- **Old:** `SubjectListControls.tsx`, `FiltersModal.tsx`, `SortsModal.tsx`,
  `useFilterAndSort.ts`, `useFilters.ts`, `useSorts.ts`
- **Target:** `apps/core/src/hooks/use-subjects-list.ts` (remove its `NOTE:`) +
  a `subject-list-controls.tsx` using `<a-dialog>`/`<a-select>`
- **Done:** filter by level/connection-state + sort by recency/score/name over
  the existing list. Keep filter/sort state local (signal), no new store unless
  needed. Collapse the old three-modal sprawl into one controls component.

---

## M1 — Evaluation flow (the core feature; do in order)

### T1.1 — Evaluate operation builder in `@aura/domain` · M
- **Old:** `apps/aura/src/features/brightid/utils/operations.ts`,
  `cryptoHelper.ts`, `api/brightId.ts` (the "add evaluation/connection op"
  paths), `EvaluateOperation` shape in `@aura/domain/types/evaluations`
- **Target:** new `packages/domain/src/operations.ts` (pure)
- **Done:** pure functions to build + sign an evaluate operation and post it to
  the node (reuse `@aura/domain/crypto` + `http`). No Solid/React. Return the
  op + hash so the store can track it. Unit-testable.
- **deps:** none — foundation for the rest of M1.

### T1.2 — `useEvaluateSubject` hook · M
- **Old:** `apps/aura/src/hooks/useEvaluateSubject.ts`
- **Target:** `apps/core/src/hooks/use-evaluate-subject.ts` +
  `apps/core/src/queries/` mutation
- **Done:** `createMutation` that calls T1.1, writes the pending op into the
  `operations` store, invalidates the right queries on settle. Optimistic.
- **deps:** T1.1.

### T1.3 — Evaluation modal UI · M
- **Old:** `EvaluationFlow.tsx`, `EvaluateModalBody.tsx` (rate ±, confidence)
- **Target:** `apps/core/src/components/evaluation/evaluate-modal.tsx` using
  `<a-dialog>`
- **Done:** pick positive/negative + confidence, submit via T1.2, show
  pending/error. Drop the old multi-step wizard if a single form is clearer —
  note the decision.
- **deps:** T1.2.

### T1.4 — Wire Evaluate button · S
- **Target:** `subject-card.tsx` + `home/[view]/index.tsx`
- **Done:** the existing `onEvaluate` opens the T1.3 modal for that subject.
- **deps:** T1.3.

### T1.5 — Optimistic overlay in `use-my-evaluations` · S
- **Old:** `selectEvaluateOperations` overlay referenced in core's `NOTE:`
- **Target:** `apps/core/src/hooks/use-my-evaluations.ts` (remove its `NOTE:`)
- **Done:** merge pending ops from the `operations` store over server ratings so
  a just-submitted evaluation shows immediately.
- **deps:** T1.1 (op shape).

### T1.6 — Operation status notifications · S
- **Old:** `EvaluationOpNotifications.tsx`
- **Target:** `apps/core/src/components/evaluation/op-notifications.tsx` using
  `@aura/ui` toaster (`toast`, see `providers.tsx`)
- **Done:** toast on op applied/failed by watching the `operations` store.
- **deps:** T1.2.

---

## M2 — Subject detail `/subject/:id`

### T2.1 — Route scaffold + header · M
- **Old:** `apps/aura/src/app/routes/_app.subject.$id/route.tsx` + `header`,
  `profile-tabs`
- **Target:** `apps/core/src/routes/subject/[id]/_layout.tsx` + `index.tsx`
- **Done:** route resolves `:id`, header shows name/avatar/level/score (reuse
  `profile-header-card` patterns + `useSubjectName`), three-tab nav (Overview /
  Evaluations / Connections) mirroring `home/[view]/_layout.tsx`.

### T2.2 — Overview tab · M
- **Old:** `components/Shared/ProfileOverview/index.tsx`
- **Target:** `apps/core/src/routes/subject/[id]/index.tsx` (overview)
- **Done:** score/level/impact summary. **Reuse** `level-progress.tsx` and the
  Evaluations summary already built on the Level Up page. **Skip** the echarts
  chart for now (separate task T2.5).
- **deps:** T2.1.

### T2.3 — Evaluations tab · M
- **Old:** `ProfileEvaluation/*`, `useSubjectInboundEvaluations.ts`
- **Target:** `apps/core/src/routes/subject/[id]/evaluations.tsx` + an
  `evaluation-card.tsx` component
- **Done:** port `useSubjectInboundEvaluations` to core (hook + query), list
  inbound evaluations as compact cards (evaluator, rating, confidence, time).
  Flatten the old 8-file `ProfileEvaluation` tree into one card component.
- **deps:** T2.1.

### T2.4 — Connections tab · M
- **Old:** `useSubjectInboundConnections.ts`, `connection-level.tsx`,
  `connection-list-search`
- **Target:** `apps/core/src/routes/subject/[id]/connections.tsx`
- **Done:** port the inbound-connections hook + a connections list.
- **deps:** T2.1.

### T2.5 — Evaluations chart (decision task) · M/L
- **Old:** `ProfileOverview/evaluations-chart/`, `utils/chart.ts` (recharts)
- **Target:** `apps/core/src/components/charts/`
- **Done:** FIRST decide & note: port a chart lib for Solid, or render a simple
  CSS/SVG impact bar list. Default to the lightweight option unless the user
  asks for parity. Then implement and slot into T2.2.
- **deps:** T2.2.

### T2.6 — Credibility details modal · S
- **Old:** `CredibilityDetailsModal.tsx`
- **Target:** `apps/core/src/components/evaluation/credibility-details.tsx`
- **Done:** `<a-dialog>` breakdown for a single evaluation; opened from T2.3/chart.
- **deps:** T2.3.

---

## M3 — Notifications

### T3.1 — Notification-diff logic in `@aura/domain` · M
- **Old:** `apps/aura/src/store/notifications.store.ts` (LEVEL_CHANGE=1,
  SCORE_CHANGE_PERCENTAGE=10 thresholds, alert building),
  `components/notifications/notifications-checker.tsx`
- **Target:** new `packages/domain/src/notifications.ts` (pure)
- **Done:** pure function: (prev backup/verifications, next) → alerts[]. No I/O.

### T3.2 — Notifications store + poller · M
- **Target:** `apps/core/src/store/notifications.ts` + a checker that runs T3.1
  on backup refresh
- **Done:** persist read/unread; produce alerts via T3.1. Reuse existing query
  refetch cadence, no new polling stack if backup query already refetches.
- **deps:** T3.1.

### T3.3 — `/notifications` route · M
- **Old:** `_app.notifications/route.tsx` (tabs by EvaluationCategory, cards)
- **Target:** `apps/core/src/routes/notifications.tsx`
- **Done:** list alerts grouped by category, mark-as-read, link to subject.
- **deps:** T3.2.

---

## M4 — Remaining routes (mostly independent, S/M each)

### T4.1 — `/role-management` · M
- **Old:** `_app.role-management/*` (player/trainer/manager role cards,
  `score-and-level.tsx`)
- **Target:** `apps/core/src/routes/role-management.tsx`
- **Done:** three role cards showing level/score/qualification via
  `useSubjectVerifications` per category + `useLevelupProgress`. Collapse the
  three near-identical card components into one parameterized card.

### T4.2 — `/dashboard` · M
- **Old:** `_app.dashboard/*` (domain + preferred-view cards, link grid,
  role-select modal)
- **Target:** `apps/core/src/routes/dashboard.tsx`
- **Done:** preferred-view selector (writes view to store/route) + link grid.

### T4.3 — `/domain-overview` · S
- **Old:** `_app.domain-overview/route.tsx` (currently hardcoded stats)
- **Target:** `apps/core/src/routes/domain-overview.tsx`
- **Done:** straight port of the static stat cards; wire real counts only if a
  domain query already exists — else keep static and note it.

### T4.4 — `/contact-info` · M
- **Old:** `_app.contact-info/route.tsx`, `contacts.store.ts`,
  `useStoreNewContactMutation`
- **Target:** `apps/core/src/routes/contact-info.tsx` + contacts store/mutation
- **Done:** list hashed contacts (masked), add dialog with validation. Reuse
  `apps/core/src/shared/lib/contacts.ts` (`normalizeContactValue`) + domain
  `hash`. Settings already links here.

### T4.5 — `/onboarding` carousel · M
- **Old:** `_landing.onboarding/*` (4 steps, swiper)
- **Target:** `apps/core/src/routes/onboarding.tsx`
- **Done:** 4-step tutorial; track step in URL; mark seen in `onboarding`
  store. Use a CSS/scroll carousel — don't pull in Swiper.

### T4.6 — 404 catch-all · S
- **Old:** `_app.$/route.tsx`
- **Target:** `apps/core/src/routes/[...404].tsx`
- **Done:** not-found page with home link. (Router already supports catch-all.)

---

## M5 — Shared building blocks (do when a task above needs them)

### T5.1 — Profile pictures · S
- **Old:** `BrightIdProfilePicture.tsx`, `GravatarProfilePicture.tsx`,
  `profile.ts` gravatar query
- **Target:** `apps/core/src/components/avatar` (extend existing `avatar.tsx`)
- **Done:** real image with initials fallback (already have the fallback).

### T5.2 — List states + infinite scroll · S
- **Old:** `EmptyAndLoadingStates/*`, `InfiniteScrollLocal.tsx`
- **Target:** `apps/core/src/components/list/`
- **Done:** shared empty/loading/`<For>`-based incremental list helpers; replace
  ad-hoc "Loading…/No items" divs in existing routes.

### T5.3 — Global search modal · M
- **Old:** `GlobalSearchModal.tsx`
- **Target:** `apps/core/src/components/search/`
- **Done:** search subjects/contacts, jump to `/subject/:id`.

---

## Suggested order for a single worker

M0 (warm-up, ships value) → **M1 in order** (unblocks the app's core verb) →
M2 → M3 → M4 (parallelizable) → M5 (pull in on demand). Pull an M5 task forward
whenever an earlier task is blocked on a shared piece.
