// Run on an isolated origin: bun run dev --port 5174, then /core/tests/cards.html.
import '../src/index.css';
import '@aura/ui';
import { Router, Route } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { For, createSignal, onMount } from 'solid-js';
import { render } from 'solid-js/web';
import EvaluationCard from '../src/components/evaluation/evaluation-card';
import SubjectCard from '../src/components/home/subject-card';
import EvaluateModal from '../src/components/evaluation/evaluate-modal';
import CredibilityDetails from '../src/components/evaluation/credibility-details';
import GlobalSearch from '../src/components/search/global-search';
import ChartHelp from '../src/components/charts/chart-help';
import EvidenceHelp from '../src/components/subject/evidence-help';
import SubjectListControls from '../src/components/home/subject-list-controls';
import { useSubjectsList } from '../src/hooks/use-subjects-list';
import type { DialogElement } from '@aura/ui';
import { authStore, setAuthStore } from '../src/store/auth';
import { operationsStore, setOperationsStore } from '../src/store/operations';
import {
  EvaluationCategory,
  EvaluationValue,
} from '@aura/domain/types/evaluations';
import type {
  BrightIdBackupConnection,
  BrightIdProfile,
} from '@aura/domain/types/aura';
import type { InboundEvaluation } from '../src/hooks/use-subject-inbound-evaluations';

const client = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, retry: false } },
});
const timestamp = Date.now() - 86400000;
const connections: BrightIdBackupConnection[] = [
  {
    id: 'card-positive',
    name: 'Alexandra Verylongunbrokenfamilynamefortesting',
    level: 'already known',
    timestamp,
    reportReason: null,
  },
  {
    id: 'card-negative',
    name: 'Morgan Negative',
    level: 'reported',
    timestamp,
    reportReason: null,
  },
  {
    id: 'card-unrated',
    name: 'New connection',
    level: 'aura only',
    timestamp,
    reportReason: null,
  },
];
connections.push({
  id: 'card-pending',
  name: 'Pending evaluation',
  level: 'just met',
  timestamp,
  reportReason: null,
});
const originalUser = authStore.user;
const originalOperations = operationsStore.byHash;
window.addEventListener('beforeunload', () => {
  setAuthStore('user', originalUser);
  setOperationsStore('byHash', originalOperations);
});
setAuthStore('user', { brightId: 'card-test-user', password: '' });
setOperationsStore('byHash', {
  pending: {
    hash: 'pending',
    evaluator: 'card-test-user',
    evaluated: 'card-pending',
    category: EvaluationCategory.SUBJECT,
    confidence: 4,
    evaluation: EvaluationValue.POSITIVE,
    timestamp,
    state: 'INIT',
  },
});
client.setQueryData(
  ['connections', 'outbound', 'card-test-user'],
  connections.slice(0, 2).map((c, i) => ({
    ...c,
    auraEvaluations: [
      {
        category: EvaluationCategory.SUBJECT,
        confidence: 4,
        evaluation: i ? EvaluationValue.NEGATIVE : EvaluationValue.POSITIVE,
        modified: timestamp,
      },
    ],
  })),
);
for (const [i, connection] of connections.entries()) {
  client.setQueryData(['brightid-profile', connection.id], {
    verifications: [
      {
        name: 'Aura',
        domains: [
          {
            name: 'BrightID',
            categories: [
              {
                name: EvaluationCategory.SUBJECT,
                level: i,
                score: i === 1 ? -100 : 0,
                impacts: Array.from({ length: 8 }, (_, n) => ({
                  evaluator: n === 0 ? 'card-test-user' : `evaluator-${n}`,
                  score: 0,
                  confidence: 4,
                  impact: 100 - n * 10,
                  modified: timestamp,
                })),
              },
            ],
          },
        ],
      },
    ],
  });
}
const profile = client.getQueryData<BrightIdProfile>([
  'brightid-profile',
  'card-positive',
])!;
const domain = profile.verifications[0]!.domains![0]!;
domain.categories.push(
  ...[
    EvaluationCategory.PLAYER,
    EvaluationCategory.TRAINER,
    EvaluationCategory.MANAGER,
  ].map((name) => ({ ...domain.categories[0]!, name, level: 1 })),
);
client.setQueryData(['brightid-profile', 'card-positive'], profile);
client.setQueryData(['profile-data', ''], {
  userData: { id: 'card-test-user', name: 'Test user' },
  connections,
  groups: [],
});
for (const c of connections) {
  client.setQueryData(['connections', 'inbound', c.id], []);
  client.setQueryData(['connections', 'outbound', c.id], []);
}
const evaluations: InboundEvaluation[] = connections
  .slice(0, 3)
  .map((c, i) => ({
    evaluatorId: c.id,
    name: c.name!,
    rating: i === 1 ? -4 : 4,
    confidence: 4,
    timestamp,
    level: i,
    score: i === 1 ? -100 : i === 2 ? null : 0,
    impactPercent: i === 2 ? null : 100,
    impacts:
      i === 2
        ? null
        : Array.from({ length: 8 }, (_, n) => ({
            evaluator: `evaluator-${n}`,
            score: 0,
            confidence: 4,
            impact: 100 - n * 10,
            modified: timestamp,
          })),
  }));

function Cards() {
  const [evaluating, setEvaluating] = createSignal<string | null>(null);
  const [details, setDetails] = createSignal<string | null>(null);
  const controls = useSubjectsList();
  const [action, setAction] = createSignal('No action');
  const [result, setResult] = createSignal('Checking…');
  onMount(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    const failures: string[] = [];
    const assert = (ok: boolean, message: string) => {
      if (!ok) failures.push(message);
    };
    for (const card of document.querySelectorAll('a-card')) {
      const rect = card.getBoundingClientRect();
      for (const el of card.querySelectorAll('*')) {
        if (el.closest('[slot="content"]')) continue;
        const child = el.getBoundingClientRect();
        assert(
          child.right <= rect.right + 1 && child.left >= rect.left - 1,
          `Overflow: ${card.getAttribute('data-testid')} / ${el.tagName}`,
        );
      }
    }
    assert(
      document
        .querySelector('[data-testid="fixture-subject-card-positive"]')
        ?.textContent?.includes('Score: 0') === true,
      'Zero score must be visible',
    );
    assert(
      document
        .querySelector('[data-testid="fixture-evaluation-card-unrated"]')
        ?.textContent?.includes('Score: -') === true,
      'Missing score must remain missing',
    );
    const subject = document.querySelector(
      '[data-testid="fixture-subject-card-positive"] a-card',
    )!;
    const path = location.pathname;
    (subject.querySelector('a-button') as HTMLElement).click();
    assert(
      action() === 'Evaluate card-positive' && location.pathname === path,
      'Evaluate must not open the profile',
    );
    const evaluation = document.querySelector(
      '[data-testid="fixture-evaluation-card-positive"] a-card',
    )!;
    assert(
      (subject as HTMLElement).tabIndex === 0 &&
        (evaluation as HTMLElement).tabIndex === 0,
      'Cards must be keyboard focusable',
    );
    for (const key of ['Enter', ' ']) {
      setAction('No action');
      evaluation.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true }),
      );
      assert(
        action() === 'Details card-positive',
        `Evaluation keyboard action: ${key}`,
      );
    }
    setAction('No action');
    subject
      .querySelector('a-button')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    assert(
      location.pathname === path,
      'Nested action key must not open the profile',
    );
    assert(
      document.querySelector(
        '[data-testid="fixture-subject-card-pending"] a-icon[name="loader-circle"]',
      ) !== null,
      'Pending evaluation must show a spinner',
    );
    // Exercise native modality and the existing delayed close/reopen contract.
    const overlay = document.createElement('a-dialog') as DialogElement;
    overlay.label = 'Overlay regression';
    overlay.innerHTML =
      '<button slot="trigger" type="button">Open regression</button><div slot="content" style="width:384px;max-width:100%"><button type="button">Inside</button></div>';
    document.body.append(overlay);
    await overlay.updateComplete;
    const trigger = overlay.querySelector('button')!;
    trigger.focus();
    overlay.show();
    await overlay.updateComplete;
    const native = overlay.shadowRoot!.querySelector('dialog')!;
    assert(native.matches(':modal'), 'Dialog must use the top layer');
    assert(
      overlay.contains(document.activeElement),
      'Dialog must receive focus',
    );
    const bounds = native.getBoundingClientRect();
    assert(
      bounds.left >= 0 && bounds.right <= innerWidth,
      'Dialog must fit the viewport',
    );
    let closed = 0;
    overlay.addEventListener('after-hide', () => closed++);
    overlay.hide();
    overlay.show();
    await new Promise((resolve) => setTimeout(resolve, 240));
    assert(
      native.open && closed === 0,
      'Reopening must cancel the pending close',
    );
    const hidden = new Promise((resolve) =>
      overlay.addEventListener('after-hide', resolve, { once: true }),
    );
    overlay.hide();
    await hidden;
    assert(!native.open && closed === 1, 'Close must finish once');
    assert(
      document.activeElement === trigger,
      'Dialog must restore trigger focus',
    );
    overlay.remove();
    const preview = subject.querySelector('a-hover-card')!;
    const previewTrigger = preview.querySelector('button')!;
    previewTrigger.focus();
    previewTrigger.click();
    await (preview as import('@aura/ui').HoverCardElement).updateComplete;
    const popup = preview.shadowRoot!.querySelector<HTMLElement>('[popover]')!;
    assert(popup.matches(':popover-open'), 'Avatar preview must open on click');
    preview.dispatchEvent(new MouseEvent('mouseleave'));
    await new Promise((resolve) => setTimeout(resolve, 240));
    assert(
      popup.matches(':popover-open'),
      'Focused avatar preview must stay open',
    );
    const popupBounds = popup.getBoundingClientRect();
    assert(
      popupBounds.left >= 15 &&
        popupBounds.right <= innerWidth - 15 &&
        popupBounds.top >= 15 &&
        popupBounds.bottom <= innerHeight - 15,
      'Avatar preview must stay on-screen',
    );
    assert(
      location.pathname === path,
      'Avatar preview must not open the profile',
    );
    previewTrigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      }),
    );
    await (preview as import('@aura/ui').HoverCardElement).updateComplete;
    assert(
      !popup.matches(':popover-open'),
      'Escape must dismiss avatar preview',
    );
    setResult(
      failures.length
        ? failures.join('\n')
        : 'PASS: cards, actions, modals and popups',
    );
  });
  return (
    <main class="mx-auto flex max-w-2xl flex-col gap-3 px-5 py-6 text-foreground">
      <button
        class="self-start"
        onClick={() => document.documentElement.classList.toggle('dark')}
      >
        Toggle theme
      </button>
      <p data-testid="card-check-result" class="whitespace-pre-wrap">
        {result()}
      </p>
      <p data-testid="card-action">{action()}</p>
      <div class="flex flex-wrap items-center gap-3">
        <GlobalSearch />
        <ChartHelp />
        <EvidenceHelp />
        <button type="button" onClick={() => setEvaluating('card-positive')}>
          Open evaluation
        </button>
        <button type="button" onClick={() => setDetails('card-positive')}>
          Open credibility
        </button>
      </div>
      <SubjectListControls controls={controls} count={connections.length} />
      <EvaluateModal
        subjectId={evaluating}
        onClose={() => setEvaluating(null)}
      />
      <CredibilityDetails
        subjectId={details}
        onClose={() => setDetails(null)}
      />
      <h1>Subject cards</h1>
      <For each={connections}>
        {(connection) => (
          <div data-testid={`fixture-subject-${connection.id}`}>
            <SubjectCard
              connection={connection}
              onEvaluate={(id) => setAction(`Evaluate ${id}`)}
            />
          </div>
        )}
      </For>
      <h1>Evaluation cards</h1>
      <For each={evaluations}>
        {(evaluation) => (
          <div data-testid={`fixture-evaluation-${evaluation.evaluatorId}`}>
            <EvaluationCard
              evaluation={evaluation}
              onClick={(id) => setAction(`Details ${id}`)}
            />
          </div>
        )}
      </For>
    </main>
  );
}
document.documentElement.classList.add('dark');
document.body.classList.add('bg-background');
render(
  () => (
    <QueryClientProvider client={client}>
      <Router>
        <Route path="*" component={Cards} />
      </Router>
    </QueryClientProvider>
  ),
  document.getElementById('root')!,
);
