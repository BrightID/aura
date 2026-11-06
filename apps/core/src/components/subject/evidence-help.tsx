import Icon from '@/components/ui/icon';
import Dialog from '@/components/ui/dialog';
/** "Evidence" section heading with its explainer dialog. */
export default function EvidenceHelp() {
  return (
    <div class="flex items-center gap-2">
      <p class="text-lg font-bold text-foreground">Evidence</p>
      <Dialog
        label="Understanding evidence"
        trigger={
          <button
            class="a-button"
            type="button"
            data-size="icon"
            data-variant="glass"
            aria-label="What is the evidence section?"
            data-testid="evidence-help"
          >
            <Icon name="info" />
          </button>
        }
      >
        <div class="flex w-80 max-w-full flex-col gap-3">
          <p class="font-bold text-foreground">
            Understanding the Evidence section
          </p>
          <p
            class="a-text text-muted-foreground"
            data-size="sm"
            data-variant="muted"
          >
            Evidence is what other participants think of this subject.
            <span class="mt-2 block">
              <span class="font-medium text-foreground">Evaluations</span> — who
              rated this subject in the current role, with their confidence and
              impact.
            </span>
            <span class="mt-2 block">
              <span class="font-medium text-foreground">Connections</span> /{' '}
              <span class="font-medium text-foreground">Activity</span> — their
              BrightID connections (Player view), or the evaluations they have
              made themselves (Trainer/Manager views).
            </span>
            <span class="mt-2 block">
              Use it to decide your own evaluation — tap any row for a full
              credibility breakdown.
            </span>
          </p>
          <a
            class="a-button w-full"
            data-variant="glass"
            data-size="sm"
            href="https://brightid.gitbook.io/aura"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="external-link" /> Learn more
          </a>
        </div>
      </Dialog>
    </div>
  );
}
