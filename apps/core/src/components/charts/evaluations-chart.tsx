import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import { barColor } from "@/components/charts/colors"
import ZoomControls from "@/components/charts/zoom-controls"
import Avatar from "@/components/home/avatar"
import { useNameResolver } from "@/hooks/use-backup"
import { compactFormat } from "@/shared/lib/number"
import { formatDuration } from "@/shared/lib/time"
import { authStore } from "@/store/auth"
import { confidenceLabel } from "@aura/domain/labels"
import type { AuraImpactRaw } from "@aura/domain/types/aura"

// Old chart showed evaluator pictures for up to 20 bars, 16–40px by count.
const MAX_AVATARS = 20

const avatarSize = (count: number) =>
  Math.round(40 - ((40 - 16) / (MAX_AVATARS - 1)) * (count - 1))

interface Bar {
  id: string
  name: string
  /** Share of the subject's total absolute impact, signed (-100..100). */
  percent: number
  color: string
  /** Raw values carried for the hover tooltip (old recharts tooltip parity). */
  score: number | null
  confidence: number
  modified: number
}

/**
 * Evaluation-impacts chart (plan T2.5) — the old recharts chart rebuilt as
 * plain CSS bars: one bar per evaluator, height = share of the subject's
 * total impact, negatives below the baseline. Bars use the old confidence
 * palettes (purple = you, orange = the focused subject) and carry the
 * evaluator's picture underneath when the visible window is small enough.
 * Click opens the evaluator; hover shows the old tooltip (score, impact,
 * confidence, age).
 *
 * The strip never scrolls — bars flex to fill the width and shrink as small as
 * needed, capped at a max width so a handful of bars don't sprawl. To inspect
 * a crowded chart, the old drag-zoom is replaced by explicit zoom/pan controls
 * that slide a window over the bars (see {@link ZoomControls}).
 */
export default function EvaluationsChart(props: {
  impacts: () => AuraImpactRaw[] | null
  onBarClick?: (evaluatorId: string) => void
  /** Highlighted subject (orange palette), e.g. the profile being viewed. */
  focusedSubjectId?: () => string
  /** Show a skeleton instead of the empty state while the data loads. */
  loading?: () => boolean
}) {
  const nameOf = useNameResolver()

  const allBars = createMemo<Bar[]>(() => {
    const impacts = (props.impacts() ?? []).filter((i) => i.impact !== 0)
    const total = impacts.reduce((sum, i) => sum + Math.abs(i.impact), 0)
    if (!total) return []
    return [...impacts]
      .sort((a, b) => a.impact - b.impact)
      .map((i) => ({
        id: i.evaluator,
        name: nameOf(i.evaluator),
        percent: (i.impact / total) * 100,
        color: barColor(
          i.confidence * Math.sign(i.impact),
          i.evaluator,
          authStore.user?.brightId,
          props.focusedSubjectId?.(),
        ),
        score: i.score,
        confidence: i.confidence * Math.sign(i.impact),
        modified: i.modified,
      }))
  })

  // Visible window [start, end] into allBars(). Reset to the full range
  // whenever the data changes.
  const [start, setStart] = createSignal(0)
  const [end, setEnd] = createSignal(0)
  createEffect(() => {
    setStart(0)
    setEnd(Math.max(0, allBars().length - 1))
  })

  const count = () => allBars().length
  const bars = createMemo(() => allBars().slice(start(), end() + 1))

  // Heights are normalized to the tallest bar *in the window*, so zooming into
  // a flat region still spreads the bars across the full plot height.
  const windowMaxAbs = createMemo(() =>
    Math.max(1, ...bars().map((b) => Math.abs(b.percent))),
  )
  const heightOf = (percent: number) =>
    Math.max(8, Math.round((Math.abs(percent) / windowMaxAbs()) * 100))

  const showAvatars = () => bars().length <= MAX_AVATARS
  // Only reserve plot halves that have bars — an all-positive window would
  // otherwise leave an empty bottom half between the bars and the avatars.
  const hasPositive = createMemo(() => bars().some((b) => b.percent > 0))
  const hasNegative = createMemo(() => bars().some((b) => b.percent < 0))

  const isFull = () => start() === 0 && end() === count() - 1

  const zoom = (dir: 1 | -1) => {
    const s = start()
    const e = end()
    const win = e - s
    const step = Math.max(1, Math.round(win * 0.15))
    if (dir === 1) {
      // zoom in — shrink the window toward its center
      if (win < 2) return
      const mid = (s + e) / 2
      setStart(Math.min(s + step, Math.floor(mid)))
      setEnd(Math.max(e - step, Math.ceil(mid)))
    } else {
      setStart(Math.max(0, s - step))
      setEnd(Math.min(count() - 1, e + step))
    }
  }

  const pan = (dir: 1 | -1) => {
    const win = end() - start()
    if (dir === -1) {
      const ns = Math.max(0, start() - Math.max(1, Math.round(win * 0.5)))
      setStart(ns)
      setEnd(ns + win)
    } else {
      const ne = Math.min(count() - 1, end() + Math.max(1, Math.round(win * 0.5)))
      setEnd(ne)
      setStart(ne - win)
    }
  }

  // Hovered/focused bar → single floating tooltip (old recharts tooltip). We
  // track the bar plus its horizontal center relative to the strip container.
  let strip: HTMLDivElement | undefined
  const [hovered, setHovered] = createSignal<{ bar: Bar; left: number } | null>(
    null,
  )
  const showTip = (e: { currentTarget: HTMLElement }, bar: Bar) => {
    if (!strip) return
    const r = e.currentTarget.getBoundingClientRect()
    const p = strip.getBoundingClientRect()
    setHovered({ bar, left: r.left - p.left + r.width / 2 })
  }
  const signed = (n: number) => (n > 0 ? `+${n}` : String(n))

  return (
    <Show
      when={!props.loading?.()}
      fallback={
        <div
          data-testid="evaluations-chart-skeleton"
          class="flex h-36 items-end gap-1 pb-1"
        >
          <For each={[70, 40, 90, 55, 30, 65, 45, 80, 50, 35]}>
            {(h) => (
              <span
                class="flex-1 animate-pulse rounded-t-sm bg-foreground/10"
                style={{ height: `${h}%` }}
              />
            )}
          </For>
        </div>
      }
    >
      <Show
        when={count() > 0}
        fallback={
          <div class="py-6 text-center text-sm text-muted-foreground">
            No evaluation impacts yet.
          </div>
        }
      >
        <div class="flex flex-col gap-1">
          <Show when={count() > 1}>
            <ZoomControls
              onReset={() => {
                setStart(0)
                setEnd(count() - 1)
              }}
              onZoomIn={() => zoom(1)}
              onZoomOut={() => zoom(-1)}
              onPanLeft={() => pan(-1)}
              onPanRight={() => pan(1)}
              disabledZoomIn={end() - start() < 2}
              disabledZoomOut={isFull()}
              disabledPanLeft={start() === 0}
              disabledPanRight={end() === count() - 1}
            />
          </Show>

          <div
            ref={strip}
            data-testid="evaluations-chart"
            class="relative flex items-stretch gap-0.5"
          >
            {/* Floating tooltip for the hovered/focused bar. */}
            <Show when={hovered()}>
              {(h) => (
                <div
                  data-testid="evaluations-chart-tooltip"
                  class="pointer-events-none absolute bottom-full z-10 mb-1 w-max max-w-48 -translate-x-1/2 rounded-md border border-border bg-background/95 p-2 text-xs shadow-md backdrop-blur"
                  style={{ left: `${h().left}px` }}
                >
                  <p class="truncate font-medium text-foreground">
                    {h().bar.name}
                  </p>
                  <div class="mt-1 flex flex-col gap-0.5 text-muted-foreground">
                    <Show when={h().bar.score !== null}>
                      <span>
                        Score:{" "}
                        <span class="text-foreground">
                          {compactFormat(h().bar.score ?? 0)}
                        </span>
                      </span>
                    </Show>
                    <span>
                      Impact:{" "}
                      <span class="text-foreground">
                        {signed(Number(h().bar.percent.toFixed(1)))}%
                      </span>
                    </span>
                    <span>
                      Confidence:{" "}
                      <span class="text-foreground">
                        {signed(h().bar.confidence)} (
                        {confidenceLabel(h().bar.confidence)})
                      </span>
                    </span>
                    <span>{formatDuration(h().bar.modified)}</span>
                  </div>
                </div>
              )}
            </Show>

            <For each={bars()}>
              {(bar) => (
                <button
                  type="button"
                  data-testid={`evaluations-chart-bar-${bar.id}`}
                  title={`${bar.name}: ${signed(Number(bar.percent.toFixed(1)))}%`}
                  onClick={() => props.onBarClick?.(bar.id)}
                  onMouseEnter={(e) => showTip(e, bar)}
                  onFocus={(e) => showTip(e, bar)}
                  onMouseLeave={() => setHovered(null)}
                  onBlur={() => setHovered(null)}
                  class="flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 opacity-90 transition-opacity hover:opacity-100"
                >
                  <span class="flex h-36 w-full flex-col">
                    {/* positive half */}
                    <Show when={hasPositive()}>
                      <span class="flex flex-1 items-end justify-center">
                        <Show when={bar.percent > 0}>
                          <span
                            class="w-full max-w-5 rounded-t-sm"
                            style={{
                              height: `${heightOf(bar.percent)}%`,
                              "background-color": bar.color,
                            }}
                          />
                        </Show>
                      </span>
                    </Show>
                    <span class="border-border block border-t" />
                    {/* negative half */}
                    <Show when={hasNegative()}>
                      <span class="flex flex-1 items-start justify-center">
                        <Show when={bar.percent < 0}>
                          <span
                            class="w-full max-w-5 rounded-b-sm"
                            style={{
                              height: `${heightOf(bar.percent)}%`,
                              "background-color": bar.color,
                            }}
                          />
                        </Show>
                      </span>
                    </Show>
                  </span>
                  <Show when={showAvatars()}>
                    <Avatar
                      name={bar.name}
                      subjectId={bar.id}
                      noHover
                      class="text-[10px]"
                      style={{
                        width: `${avatarSize(bars().length)}px`,
                        height: `${avatarSize(bars().length)}px`,
                      }}
                    />
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>
    </Show>
  )
}
