/** "Evidence" section heading with its explainer dialog. */
export default function EvidenceHelp() {
  return (
    <div class="flex items-center gap-2">
      <p class="text-lg font-bold text-foreground">Evidence</p>
      <a-dialog>
        <button
          slot="trigger"
          type="button"
          aria-label="What is the evidence section?"
          data-testid="evidence-help"
          class="text-muted-foreground"
        >
          <a-icon name="info" />
        </button>
        <div slot="content" class="flex w-80 max-w-full flex-col gap-3">
          <p class="font-bold text-foreground">
            Understanding the Evidence section
          </p>
          <a-text size="sm" class="text-muted-foreground">
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
          </a-text>
          <a
            href="https://brightid.gitbook.io/aura"
            target="_blank"
            rel="noreferrer"
          >
            <a-button variant="glass" size="sm" class="w-full">
              <a-icon name="external-link" /> Learn more
            </a-button>
          </a>
        </div>
      </a-dialog>
    </div>
  );
}
