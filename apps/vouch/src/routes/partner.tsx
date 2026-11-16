import { For } from 'solid-js';
import { useApp } from '@/app';
import { Back } from '@/components';
import { level } from '@/model/derive';
import { Q, QUESTIONS, QUESTION_TEXT } from '@/model/questions';
import { partnerAnswer } from '@/model/view';

/** What Interfold reads about the persona: their key and each question's answer. */
export default function Partner() {
  const { api } = useApp();
  const p = () => api.state.persona;
  const key = () => api.data.ids[p()] || p();
  return (
    <>
      <Back />
      <h1 class="a-head" data-level="2">
        What Interfold sees
      </h1>
      <section class="a-card flex flex-col gap-3" data-variant="default">
        <p class="a-text break-all" data-variant="small">
          Public key · <span title={key()}>{key()}</span>
        </p>
        <For each={QUESTIONS}>
          {(q) => (
            <div class="flex flex-col gap-1">
              <span class="font-medium">{Q[q]}</span>
              <p class="a-text" data-variant="small">
                {QUESTION_TEXT[q]}
              </p>
              <span class="text-sm">
                {partnerAnswer(api, p(), q)} · Level {level(api, p(), q)}
              </span>
            </div>
          )}
        </For>
        <p class="a-text" data-variant="muted">
          Signed by the Aura node
        </p>
      </section>
    </>
  );
}
