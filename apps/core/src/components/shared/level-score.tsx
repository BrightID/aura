import { Show } from "solid-js"
import { compactFormat } from "@/shared/lib/number"

/** The "Level: X  Score: Y" line used by profile and subject cards. */
export default function LevelScore(props: {
  level: number | null
  score: number | null
  testid?: string
}) {
  return (
    <div class="text-sm text-muted-foreground">
      Level:{" "}
      <span
        data-testid={props.testid ? `${props.testid}-level` : undefined}
        class="font-medium text-foreground"
      >
        {props.level ?? "-"}
      </span>
      <span class="ml-2">
        Score:{" "}
        <span
          data-testid={props.testid ? `${props.testid}-score` : undefined}
          class="font-medium text-foreground"
        >
          <Show when={props.score} fallback="-">
            {compactFormat(props.score!)}
          </Show>
        </span>
      </span>
    </div>
  )
}
