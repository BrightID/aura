// The three questions every Interfold operator is answered on. Connections
// name an answer's question by these strings, and derive.ts matches on them.
export const Q = ['Keyholder', 'Self-custody', 'Disclosure'] as const;

export type Question = 0 | 1 | 2;

export const QUESTIONS: Question[] = [0, 1, 2];

export const QUESTION_TEXT = [
  'Would you accept this person as one of several threshold keyholders?',
  'Do you believe this person independently controls the operator keys they claim to control?',
  "Do you believe this person's disclosure is complete and accurate, including every Interfold node they run or control and every operator with whom they share meaningful control?",
];

export const SHORT_QUESTION_TEXT = [
  'Would you trust them as one of several keyholders?',
  'Do they alone control their keys, directed by no one else?',
  'Have they told us every node they run, and everyone they share control with?',
];

export const owners = ['nora', 'tomas', 'ingrid', 'auryn'];
