import { For } from "solid-js"
import {
  subjectRatingColorMap,
  userRatingColorMap,
  valueColorMap,
} from "@/components/charts/colors"

/** Info dialog explaining the impact chart's bar colors. */
export default function ChartHelp() {
  const Strip = (props: { label: string; map: Record<string, string> }) => (
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium text-foreground">{props.label}</p>
      <div class="flex w-full">
        <For each={["-4", "-3", "-2", "-1", "1", "2", "3", "4"]}>
          {(key) => (
            <div
              class="h-3 flex-1 first:rounded-l last:rounded-r"
              style={{ "background-color": props.map[key] }}
            />
          )}
        </For>
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>-4 (negative)</span>
        <span>+4 (positive)</span>
      </div>
    </div>
  )

  return (
    <a-dialog>
      <button
        slot="trigger"
        type="button"
        aria-label="How to read this chart"
        data-testid="chart-help"
        class="text-muted-foreground"
      >
        <a-icon name="info" />
      </button>
      <div slot="content" class="flex w-80 max-w-full flex-col gap-3">
        <p class="font-bold text-foreground">Reading the impact chart</p>
        <a-text size="sm" class="text-muted-foreground">
          Each bar is one evaluator; its height is that evaluation's share of
          the subject's total impact. Bars below the line are negative
          evaluations. Darker shades mean higher confidence.
        </a-text>
        <Strip label="Other evaluators" map={valueColorMap} />
        <Strip label="You" map={userRatingColorMap} />
        <Strip label="This subject" map={subjectRatingColorMap} />
        <a
          href="https://brightid.gitbook.io/aura/evidence/impact-bar-chart"
          target="_blank"
          rel="noreferrer"
        >
          <a-button variant="glass" size="sm" class="w-full">
            <a-icon name="external-link" /> Learn more
          </a-button>
        </a>
      </div>
    </a-dialog>
  )
}
