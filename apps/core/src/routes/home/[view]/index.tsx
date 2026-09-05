import { createSignal, Show } from 'solid-js';
import EvaluateModal from '@/components/evaluation/evaluate-modal';
import SubjectCard from '@/components/home/subject-card';
import SubjectListControls from '@/components/home/subject-list-controls';
import IncrementalList from '@/components/list/incremental-list';
import { useSubjectsList } from '@/hooks/use-subjects-list';

export default function HomeEvaluate() {
  const controls = useSubjectsList();
  const { subjects } = controls;
  const [evaluating, setEvaluating] = createSignal<string | null>(null);

  return (
    <div class="flex grow flex-col gap-3">
      <SubjectListControls
        controls={controls}
        count={subjects()?.length ?? 0}
      />
      <Show
        when={(subjects()?.length ?? 0) > 0}
        fallback={
          <div class="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <a-icon name="inbox" class="text-2xl opacity-60" />
            <span class="text-sm">No connections to evaluate yet.</span>
          </div>
        }
      >
        <IncrementalList items={subjects() ?? []} class="flex flex-col gap-3">
          {(connection) => (
            <SubjectCard connection={connection} onEvaluate={setEvaluating} />
          )}
        </IncrementalList>
      </Show>

      <EvaluateModal
        subjectId={evaluating}
        onClose={() => setEvaluating(null)}
      />
    </div>
  );
}
