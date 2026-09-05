import { createMemo, For, Show } from 'solid-js';
import { barColor } from '@/components/charts/colors';
import { authStore } from '@/store/auth';
import type { AuraImpactRaw } from '@aura/domain/types/aura';

/**
 * Shared mini impact strip: a subject's top evaluations by |impact| as tiny CSS
 * bars in the graded confidence palette (same colors as the big chart, so the
 * subject-list and evaluation cards read consistently). Renders nothing when
 * there are no impacts.
 */
export default function ImpactStrip(props: {
  impacts: () => AuraImpactRaw[] | null;
  /** Max bars (default 8). */
  max?: number;
  /** Extra classes, e.g. a height (`h-10`) and margin. */
  class?: string;
  title?: string;
  testid?: string;
}) {
  const bars = createMemo(() => {
    const limit = props.max ?? 8;
    const impacts = (props.impacts() ?? [])
      .filter((i) => i.impact !== 0)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, limit);
    const maxAbs = Math.max(...impacts.map((i) => Math.abs(i.impact)), 1);
    return impacts.map((i) => ({
      color: barColor(
        i.confidence * Math.sign(i.impact),
        i.evaluator,
        authStore.user?.brightId,
      ),
      height: Math.max(15, Math.round((Math.abs(i.impact) / maxAbs) * 100)),
    }));
  });

  return (
    <Show when={bars().length > 0}>
      <div
        data-testid={props.testid}
        title={props.title}
        class={`flex items-end gap-0.5 ${props.class ?? ''}`}
      >
        <For each={bars()}>
          {(bar) => (
            <span
              class="w-1.5 rounded-sm"
              style={{
                height: `${bar.height}%`,
                'background-color': bar.color,
              }}
            />
          )}
        </For>
      </div>
    </Show>
  );
}
