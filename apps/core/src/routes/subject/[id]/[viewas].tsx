import { A, useNavigate, useParams, useSearchParams } from "@solidjs/router"
import { createEffect, createMemo, createSignal, For, Match, Show, Switch } from "solid-js"
import EvaluationsChart from "@/components/charts/evaluations-chart"
import ChartHelp from "@/components/charts/chart-help"
import CredibilityDetails from "@/components/evaluation/credibility-details"
import EvaluateModal from "@/components/evaluation/evaluate-modal"
import EvaluationCard from "@/components/evaluation/evaluation-card"
import ProfileNotFoundHint from "@/components/home/profile-not-found-hint"
import IncrementalList from "@/components/list/incremental-list"
import ListState from "@/components/list/list-state"
import { roleColor, roleIcon } from "@/shared/lib/role-style"
import ConnectionCard from "@/components/subject/connection-card"
import EvidenceHelp from "@/components/subject/evidence-help"
import SubjectProfileCard from "@/components/subject/subject-profile-card"
import { useRequireSession } from "@/hooks/use-require-session"
import {
  useSubjectInboundConnections,
  useSubjectInboundEvaluations,
  useSubjectOutboundEvaluations,
} from "@/hooks/use-subject-inbound-evaluations"
import { useSubjectVerifications } from "@/hooks/use-subject-verifications"
import { useViewMode } from "@/hooks/use-view-mode"
import { authStore } from "@/store/auth"
import { isNotFound } from "@aura/domain/http"
import { categoryLabel } from "@aura/domain/labels"
import { PreferredView } from "@aura/domain/types/dashboard"
import { EvaluationCategory } from "@aura/domain/types/evaluations"

type ProfileTab = "overview" | "evaluations" | "connections" | "activity"

/** Which category an "Activity" tab shows per view (one role below). */
const ACTIVITY_CATEGORY: Partial<Record<PreferredView, EvaluationCategory>> = {
  [PreferredView.TRAINER]: EvaluationCategory.SUBJECT,
  [PreferredView.MANAGER_EVALUATING_TRAINER]: EvaluationCategory.PLAYER,
  [PreferredView.MANAGER_EVALUATING_MANAGER]: EvaluationCategory.TRAINER,
}

/**
 * Subject profile — ported from the old app's `_app.subject.$id`: a single
 * page with a view-as switcher, profile info (incl. your own evaluation) and
 * the Evidence tabs (Overview / Connections-or-Activity / Evaluations).
 * Dropped from the old page: the player-history breadcrumb sequence and the
 * manager-on-manager extra activity tab.
 */
export default function SubjectPage() {
  const params = useParams()
  useRequireSession()
  const navigate = useNavigate()
  const [query, setQuery] = useSearchParams()

  const subjectId = () => params.id ?? ""
  const vm = useViewMode()
  const category = vm.currentEvaluationCategory
  const v = useSubjectVerifications(subjectId, category)

  const [evaluating, setEvaluating] = createSignal<string | null>(null)
  const [detailsId, setDetailsId] = createSignal<string | null>(null)
  const [search, setSearch] = createSignal("")

  // ── Tabs (tracked in ?tab=, like the old app) ───────────
  const isPlayerView = () => vm.currentViewMode() === PreferredView.PLAYER
  const tab = createMemo<ProfileTab>(() => {
    const t = query.tab
    if (t === "evaluations" || t === "overview") return t
    if (t === "connections" && isPlayerView()) return t
    if (t === "activity" && !isPlayerView()) return t
    return "overview"
  })
  const setTab = (t: ProfileTab) => {
    setSearch("")
    setQuery({ tab: t })
  }
  // Leaving the view that owns the current tab resets to overview.
  createEffect(() => {
    if (query.tab === "connections" && !isPlayerView()) setTab("overview")
    if (query.tab === "activity" && isPlayerView()) setTab("overview")
  })

  // ── Data ────────────────────────────────────────────────
  const inbound = useSubjectInboundEvaluations(subjectId, category)
  const connections = useSubjectInboundConnections(subjectId)
  const activity = useSubjectOutboundEvaluations(
    subjectId,
    () => ACTIVITY_CATEGORY[vm.currentViewMode()] ?? EvaluationCategory.SUBJECT,
  )

  // View-as options: Subject always; a role once the subject has activity in
  // it (same gating as the old header's authorized tabs).
  const activityIn = {
    [EvaluationCategory.PLAYER]: useSubjectOutboundEvaluations(subjectId, () => EvaluationCategory.PLAYER),
    [EvaluationCategory.TRAINER]: useSubjectOutboundEvaluations(subjectId, () => EvaluationCategory.TRAINER),
    [EvaluationCategory.MANAGER]: useSubjectOutboundEvaluations(subjectId, () => EvaluationCategory.MANAGER),
  }
  const authorizedViewAs = createMemo(() =>
    Object.values(EvaluationCategory).filter(
      (c) =>
        c === EvaluationCategory.SUBJECT ||
        (activityIn[c as keyof typeof activityIn].evaluations()?.length ?? 0) > 0,
    ),
  )

  const profileMissing = () => isNotFound(v.query.error)
  const isSelf = () => subjectId() === authStore.user?.brightId

  // ── Search (shared signal, cleared on tab switch) ───────
  const matches = (id: string, name: string) => {
    const q = search().trim().toLowerCase()
    return !q || name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
  }
  const filteredEvaluations = createMemo(
    () => inbound.evaluations()?.filter((e) => matches(e.evaluatorId, e.name)) ?? [],
  )
  const filteredActivity = createMemo(
    () => activity.evaluations()?.filter((e) => matches(e.evaluatorId, e.name)) ?? [],
  )
  const filteredConnections = createMemo(
    () =>
      connections
        .connections()
        ?.filter((c) => matches(c.id, connections.nameOf(c.id))) ?? [],
  )

  // Component (not a shared element) — each panel needs its own DOM node.
  const SearchInput = () => (
    <a-input
      type="text"
      data-testid="subject-list-search"
      placeholder="Name or ID…"
      value={search()}
      onChange={(e: CustomEvent<string>) => setSearch(e.detail)}
    >
      <a-icon name="search" slot="prefix" />
    </a-input>
  )

  return (
    <div class="flex flex-col gap-4 px-5 pt-6 pb-10">
      {/* ── Header: back link + view-as switcher (each role is a route) ── */}
      <div class="flex items-center justify-between gap-2">
        <A
          href="/home"
          class="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <a-icon name="arrow-left" /> Back
        </A>
        <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <For each={authorizedViewAs()}>
            {(c) => (
              <a-button
                size="sm"
                data-testid={`subject-view-${categoryLabel[c]}`}
                variant="glass"
                selected={category() === c}
                title={categoryLabel[c]}
                aria-label={categoryLabel[c]}
                onClick={() =>
                  navigate(
                    `/subject/${subjectId()}/${c}${
                      query.tab ? `?tab=${query.tab}` : ""
                    }`,
                  )
                }
              >
                <a-icon name={roleIcon[c]} style={{ color: roleColor[c] }} />
                {/* Compact: only the active role keeps its label. */}
                <Show when={category() === c}>{categoryLabel[c]}</Show>
              </a-button>
            )}
          </For>
        </div>
      </div>

      <SubjectProfileCard
        subjectId={subjectId}
        onEvaluate={() => setEvaluating(subjectId())}
        fallbackName={() =>
          typeof query.name === "string" ? query.name : undefined
        }
        fallbackPhoto={() =>
          typeof query.gravatar === "string" && query.gravatar
            ? `https://www.gravatar.com/avatar/${query.gravatar}?s=256&d=identicon`
            : undefined
        }
      />

      <Show when={profileMissing()}>
        <ProfileNotFoundHint subjectId={subjectId()} self={isSelf()} />
      </Show>

      {/* ── Evidence tabs ── */}
      <EvidenceHelp />
      <a-tabs
        value={tab()}
        on:change={(e: CustomEvent<{ value: string }>) =>
          setTab(e.detail.value as ProfileTab)
        }
      >
        <a-tab value="overview">Overview</a-tab>
        <Show
          when={isPlayerView()}
          fallback={<a-tab value="activity">Activity</a-tab>}
        >
          <a-tab value="connections">Connections</a-tab>
        </Show>
        <a-tab value="evaluations">Evaluations</a-tab>

        <a-tab-panel slot="panel" value="overview">
          <div class="flex flex-col gap-4 pt-2">
            <a-card class="flex items-center justify-around p-4 text-center">
              <div class="flex flex-col">
                <span
                  data-testid="subject-positive-count"
                  class="text-xl font-bold text-aura-success"
                >
                  {inbound.positiveCount() ?? "-"}
                </span>
                <span class="text-sm text-muted-foreground">Positive</span>
              </div>
              <div class="flex flex-col">
                <span
                  data-testid="subject-negative-count"
                  class="text-xl font-bold text-destructive"
                >
                  {inbound.negativeCount() ?? "-"}
                </span>
                <span class="text-sm text-muted-foreground">Negative</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-bold text-foreground">
                  {inbound.evaluations()?.length ?? "-"}
                </span>
                <span class="text-sm text-muted-foreground">Total</span>
              </div>
            </a-card>

            <a-card class="flex flex-col gap-2 p-4">
              <div class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">
                  Evaluation impacts — tap a bar for details
                </p>
                <ChartHelp />
              </div>
              <EvaluationsChart
                impacts={() => v.auraImpacts()}
                onBarClick={setDetailsId}
                loading={() => v.loading()}
              />
            </a-card>

            <a-button
              variant="glass"
              data-testid="subject-show-evidence"
              onClick={() => setTab("evaluations")}
            >
              View evaluations
            </a-button>
          </div>
        </a-tab-panel>

        <a-tab-panel slot="panel" value="evaluations">
          <div class="flex flex-col gap-3 pt-2">
            <SearchInput />
            <ListState
              loading={inbound.loading()}
              empty={filteredEvaluations().length === 0}
              emptyText="No evaluations yet."
            >
              <IncrementalList
                items={filteredEvaluations()}
                class="flex flex-col gap-3"
              >
                {(evaluation) => (
                  <EvaluationCard evaluation={evaluation} onClick={setDetailsId} />
                )}
              </IncrementalList>
            </ListState>
          </div>
        </a-tab-panel>

        <Switch>
          <Match when={isPlayerView()}>
            <a-tab-panel slot="panel" value="connections">
              <div class="flex flex-col gap-3 pt-2">
                <SearchInput />
                <ListState
                  loading={connections.loading()}
                  empty={filteredConnections().length === 0}
                  emptyText="No connections yet."
                >
                  <IncrementalList
                    items={filteredConnections()}
                    class="flex flex-col gap-3"
                  >
                    {(connection) => (
                      <ConnectionCard
                        connection={connection}
                        name={connections.nameOf(connection.id)}
                        onClick={setDetailsId}
                      />
                    )}
                  </IncrementalList>
                </ListState>
              </div>
            </a-tab-panel>
          </Match>
          <Match when={!isPlayerView()}>
            <a-tab-panel slot="panel" value="activity">
              <div class="flex flex-col gap-3 pt-2">
                <SearchInput />
                <ListState
                  loading={activity.loading()}
                  empty={filteredActivity().length === 0}
                  emptyText="No activity yet."
                >
                  <IncrementalList
                    items={filteredActivity()}
                    class="flex flex-col gap-3"
                  >
                    {(evaluation) => (
                      <EvaluationCard evaluation={evaluation} onClick={setDetailsId} />
                    )}
                  </IncrementalList>
                </ListState>
              </div>
            </a-tab-panel>
          </Match>
        </Switch>
      </a-tabs>

      <EvaluateModal subjectId={evaluating} onClose={() => setEvaluating(null)} />
      <CredibilityDetails subjectId={detailsId} onClose={() => setDetailsId(null)} />
    </div>
  )
}
