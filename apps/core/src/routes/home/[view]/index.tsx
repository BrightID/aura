import { createSignal, For, Show } from "solid-js"
import EvaluateModal from "@/components/evaluation/evaluate-modal"
import SubjectCard from "@/components/home/subject-card"
import SubjectListControls from "@/components/home/subject-list-controls"
import { useSubjectsList } from "@/hooks/use-subjects-list"

export default function HomeEvaluate() {
  const controls = useSubjectsList()
  const { subjects, loading } = controls
  const [evaluating, setEvaluating] = createSignal<string | null>(null)

  return (
    <div class="flex grow flex-col gap-3">
      <SubjectListControls
        controls={controls}
        count={subjects()?.length ?? 0}
      />
      <Show
        when={!loading()}
        fallback={<div class="py-8 text-center text-muted-foreground">Loading…</div>}
      >
        <Show
          when={(subjects()?.length ?? 0) > 0}
          fallback={
            <div class="py-8 text-center text-muted-foreground">
              No connections to evaluate yet.
            </div>
          }
        >
          <For each={subjects()}>
            {(connection) => (
              <SubjectCard connection={connection} onEvaluate={setEvaluating} />
            )}
          </For>
        </Show>
      </Show>

      <EvaluateModal subjectId={evaluating} onClose={() => setEvaluating(null)} />
    </div>
  )
}
