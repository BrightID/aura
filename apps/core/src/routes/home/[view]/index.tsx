import { createSignal } from 'solid-js';
import EvaluateModal from '@/components/evaluation/evaluate-modal';
import SubjectCard from '@/components/home/subject-card';
import SubjectListControls from '@/components/home/subject-list-controls';
import IncrementalList from '@/components/list/incremental-list';
import ListState from '@/components/list/list-state';
import { useSubjectsList } from '@/hooks/use-subjects-list';

export default function HomeEvaluate() {
  const controls = useSubjectsList();
  const { subjects } = controls;
  const [evaluating, setEvaluating] = createSignal<string | null>(null);
  const filtered = () =>
    !!controls.search().trim() ||
    controls.levels().length > 0 ||
    controls.ratedState() !== 'all';

  return (
    <div class="flex grow flex-col gap-3">
      <SubjectListControls
        controls={controls}
        count={subjects()?.length ?? 0}
      />
      <ListState
        loading={controls.loading()}
        error={controls.failed()}
        errorText="Couldn't load connections."
        empty={(subjects()?.length ?? 0) === 0}
        emptyText={
          filtered()
            ? 'No connections match these filters.'
            : 'No connections to evaluate yet.'
        }
      >
        <IncrementalList items={subjects() ?? []} class="flex flex-col gap-3">
          {(connection) => (
            <SubjectCard connection={connection} onEvaluate={setEvaluating} />
          )}
        </IncrementalList>
      </ListState>

      <EvaluateModal
        subjectId={evaluating}
        onClose={() => setEvaluating(null)}
      />
    </div>
  );
}
