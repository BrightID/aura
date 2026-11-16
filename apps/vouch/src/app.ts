import { createSignal } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import { createMockAdapter } from '@/adapter/mock';
import { PendingOp } from '@/adapter/pending-op';
import { choiceKey } from '@/model/derive';
import { createSeed } from '@/model/seed';
import { ownAnswer, type AnswerKind } from '@/model/view';
import { createRoomSync } from '@/sync/room';

// The page's one practice adapter, its room sync when the page was opened with
// ?room=<name>, and the answers and Later/Ignore choices still in their undo
// window. Created on first use and kept for the life of the page.

const storage = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignored: storage is a convenience
    }
  },
};

/** The room named in the URL, if it is a valid room name. */
function readRoom() {
  const value = new URLSearchParams(location.search).get('room');
  return /^https?:$/.test(location.protocol) &&
    /^[a-z0-9-]{3,40}$/.test(value || '')
    ? value
    : null;
}

function readBrowserId() {
  let value = storage.get('auraMock_browserId');
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(value || '')) {
    value = `browser_${crypto.randomUUID().replace(/-/g, '')}`;
    storage.set('auraMock_browserId', value);
  }
  return value!;
}

interface PendingAnswer {
  yes: boolean;
  conf: number;
  subject: string;
  persona: string;
  op: PendingOp;
}

export const answerKey = (
  persona: string,
  kind: AnswerKind,
  subject: string,
  question: number,
) => [persona, kind, 'interfold', subject, question].join(':');

function createApp() {
  const room = readRoom();
  let sync: ReturnType<typeof createRoomSync> | undefined;
  const api = createMockAdapter(
    createSeed({ demo: !!room }),
    room ? { shared: true, onCommit: () => sync?.commit() } : {},
  );
  const initial = structuredClone(unwrap(api.state));
  const personaKey = room
    ? `auraMock_room_${room}_persona`
    : 'auraMock_persona';
  const saved = storage.get(personaKey);
  // In a room, a saved persona may be an identity someone created there, which
  // is unknown until the room's data arrives from the server. So it is restored
  // as is, and the room sync sets it back to 'newcomer' if the room lacks it.
  if (saved && (room || saved in api.data.ids)) api.setState('persona', saved);

  const [practiceOpen, setPracticeOpen] = createSignal(false);
  const [pendingAnswers, setPendingAnswers] = createStore<
    Record<string, PendingAnswer | undefined>
  >({});
  const [pendingChoices, setPendingChoices] = createStore<
    Record<string, { kind: 'later' | 'ignored'; op: PendingOp } | undefined>
  >({});

  /** Undo every answer and choice still in its undo window. */
  function cancelPending() {
    for (const [key, entry] of Object.entries(pendingAnswers)) {
      entry?.op.undo();
      setPendingAnswers(key, undefined);
    }
    for (const [key, entry] of Object.entries(pendingChoices)) {
      entry?.op.undo();
      setPendingChoices(key, undefined);
    }
  }

  if (room)
    sync = createRoomSync({
      api,
      room,
      browserId: readBrowserId(),
      onReset: () => {
        cancelPending();
        setPracticeOpen(false);
      },
    });

  /**
   * Answer Yes or No. Tapping the same answer again, or holding it, raises
   * the confidence; the answer is sent when the undo window ends.
   */
  function answer(
    kind: AnswerKind,
    subject: string,
    question: number,
    yes: boolean,
    conf: number,
  ) {
    const persona = api.state.persona;
    const key = answerKey(persona, kind, subject, question);
    const prior = pendingAnswers[key];
    prior?.op.undo();
    const record = ownAnswer(api, persona, kind, subject, question);
    if (prior && prior.yes === yes)
      conf = Math.min(4, Math.max(prior.conf + 1, conf));
    else if (record && record.yes === yes)
      conf = Math.min(4, Math.max((record.conf || 1) + 1, conf));
    const op = api.evaluate({
      evaluated: subject,
      category: kind === 'question' ? 'subject' : kind,
      question: kind === 'question' ? question : undefined,
      positive: yes,
      confidence: conf,
    });
    setPendingAnswers(key, { yes, conf, subject, persona, op });
    void op.done.then(() => {
      if (pendingAnswers[key]?.op === op) setPendingAnswers(key, undefined);
    });
  }

  function undoAnswer(key: string) {
    if (pendingAnswers[key]?.op.undo()) setPendingAnswers(key, undefined);
  }

  /** Move `subject`'s request to Later or Ignored, after the undo window. */
  function defer(subject: string, kind: 'later' | 'ignored') {
    const persona = api.state.persona;
    const key = choiceKey(persona, subject);
    if (pendingChoices[key]) return;
    for (const [answerKey, entry] of Object.entries(pendingAnswers))
      if (
        entry?.subject === subject &&
        entry.persona === persona &&
        entry.op.undo()
      )
        setPendingAnswers(answerKey, undefined);
    const op = new PendingOp(() =>
      api.requests.defer({ from: subject, to: persona, kind }),
    );
    setPendingChoices(key, { kind, op });
    void op.done.then(() => {
      if (pendingChoices[key]?.op === op) setPendingChoices(key, undefined);
    });
  }

  function undoChoice(subject: string) {
    const key = choiceKey(api.state.persona, subject);
    if (pendingChoices[key]?.op.undo()) setPendingChoices(key, undefined);
  }

  function setPersona(id: string) {
    api.setState('persona', id);
    storage.set(personaKey, id);
    void sync?.beat();
  }

  /**
   * Start practice over from the seed, in this browser only. The Practice
   * drawer offers it only outside a room; a room is reset with sync.reset.
   */
  function resetPractice() {
    cancelPending();
    api.setState(structuredClone(initial));
    storage.set(personaKey, 'newcomer');
  }

  return {
    api,
    room,
    sync,
    practiceOpen,
    setPracticeOpen,
    pendingAnswers,
    pendingChoices,
    answer,
    undoAnswer,
    defer,
    undoChoice,
    setPersona,
    resetPractice,
    /** `path` with this page's ?room= kept. */
    href: (path: string) =>
      room ? `${path}?room=${encodeURIComponent(room)}` : path,
  };
}

let app: ReturnType<typeof createApp> | undefined;

export const useApp = () => (app ??= createApp());
