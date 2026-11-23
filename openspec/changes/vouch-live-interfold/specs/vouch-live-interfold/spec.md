## Purpose

How `apps/vouch` sends live Interfold answers to the Aura node and reads them back. The wire format, the open-participation rule and the display rules come from the shared [interfold-endorsements](https://github.com/BrightID/shared-specs/blob/main/openspec/changes/interfold-live-endorsements/specs/interfold-endorsements/spec.md) contract, an open change in BrightID/shared-specs; this spec covers only what is local to `apps/vouch`.

## ADDED Requirements

### Requirement: Live switches

`apps/vouch` SHALL read two build-time switches, `VITE_VOUCH_LIVE_WRITES` and `VITE_VOUCH_LIVE_READS`, each on only when its value is exactly `true`. The answer route `/live/:operator` SHALL exist only while live writes are on, and the evidence route `/live/:operator/evidence` only while live reads are on. Practice routes SHALL make no node request whatever the switches say.

#### Scenario: Both switches off
- **WHEN** the app is built with neither switch set
- **THEN** both live routes show the not-found page and the app makes no request to the node

#### Scenario: A value other than true
- **WHEN** `VITE_VOUCH_LIVE_WRITES` is `1` or `TRUE`
- **THEN** live writes are off and the answer route shows the not-found page

#### Scenario: Reads on, writes off
- **WHEN** only `VITE_VOUCH_LIVE_READS` is `true`
- **THEN** the evidence route reads the node, and the answer route shows the not-found page

#### Scenario: Writes on, reads off
- **WHEN** only `VITE_VOUCH_LIVE_WRITES` is `true`
- **THEN** the answer route can submit, and the evidence route shows the not-found page

#### Scenario: Practice stays practice
- **WHEN** both switches are on and the user answers a question on a practice screen or resets practice
- **THEN** the answer goes to the mock only, and no node request is made

### Requirement: Node URL

`apps/vouch` SHALL send every live request to the node named by `VITE_AURA_NODE_URL`, or to `https://aura-test.brightid.org` when it is unset.

#### Scenario: Unset
- **WHEN** the app is built with live reads on and no `VITE_AURA_NODE_URL`
- **THEN** the evidence route reads from `https://aura-test.brightid.org`

### Requirement: Evaluator from the core login

The live writer SHALL take the evaluator's BrightID and secret key from core's persisted login store. With no signed-in core user, the answer route SHALL say that the person must sign in to Aura, link to `/core/`, and submit nothing. A practice persona or room identity SHALL never supply the evaluator or the key.

#### Scenario: Not signed in
- **WHEN** a person opens `/live/:operator` with live writes on and no core login in the browser
- **THEN** the page asks them to sign in to Aura with a link to `/core/`, and no answer can be submitted

#### Scenario: Practice identity chosen
- **WHEN** a practice persona or a room identity is selected and the person is signed in to core
- **THEN** a live answer is signed as the core user, and the practice id appears nowhere in the operation

### Requirement: Operator id from the route

The live routes SHALL accept an operator id only when it is 43 characters of `A-Z`, `a-z`, `0-9`, `-` and `_`, the form of a BrightID id. For any other id the route SHALL say the link is not valid and make no node request.

#### Scenario: Malformed id
- **WHEN** a person opens `/live/abc%2F..%2Fx` or an id of 42 characters
- **THEN** the page says the link is not valid, and nothing is read or signed

### Requirement: Question index to category

The practice screens number the questions 0, 1 and 2, in the order of `Q` in `apps/vouch/src/model/questions.ts`. The live adapter SHALL map index 0, 1 and 2 to the contract's categories `Keyholder`, `Self-custody` and `Disclosure`, and SHALL throw before signing for any other index.

#### Scenario: Encode an answer
- **WHEN** a signed-in evaluator answers No with confidence 3 to question index 1 about operator X
- **THEN** the signed Evaluate has category `Self-custody`, evaluator the core user's BrightID and evaluated X

#### Scenario: Unknown index
- **WHEN** the adapter is called with question index 3
- **THEN** it throws before signing and nothing is submitted

### Requirement: Live write states

A live answer SHALL be in one of `holding`, `submitting`, `submitted`, `applied` and `failed`, and SHALL show as applied only in `applied`. The allowed moves are: `holding` to `submitting` when the 1.5-second undo window ends, and undo during that window discards the answer; `submitting` to `submitted` or `failed`; `submitted` to `applied` or `failed`; and `failed` to `submitting` on retry. Once an answer has left `holding`, no undo SHALL be offered.

#### Scenario: Undo after submission
- **WHEN** an answer is submitting, submitted or applied
- **THEN** no undo is offered, and the answer's real state stays on screen

### Requirement: Submission confirmed by the node

A `submitting` answer SHALL be signed with a new timestamp and posted; it becomes `submitted` only when the node returns the operation's hash and that hash equals the one `hash` in `@aura/domain` computes from the signed message, and `failed` otherwise.

#### Scenario: Hash mismatch
- **WHEN** the node returns a hash that does not match the signed message
- **THEN** the answer shows as failed

### Requirement: Polling until applied

A `submitted` answer SHALL poll the operation's state every 5 seconds. It becomes `applied` when the node reports `applied`, and `failed` when the node reports `failed` or `expired`, or when 5 minutes pass after it became `submitted` without either.

#### Scenario: Accepted, not yet applied
- **WHEN** the node returns the hash but polling still reports `unknown`, `init` or `sent`
- **THEN** the answer shows as submitted, not applied

#### Scenario: Never settles
- **WHEN** polling has reported neither `applied` nor `failed` nor `expired` for 5 minutes
- **THEN** the answer shows as failed

### Requirement: Retry after failure

A failed live answer SHALL offer a retry button, which moves it to `submitting`.

#### Scenario: Rejected and retried
- **WHEN** the submit request fails and the evaluator presses retry
- **THEN** the answer is signed again with a new timestamp, and shows as applied only once polling reports `applied`

### Requirement: Evidence from the node only

The evidence route SHALL build its list only from the operator's inbound connections on the configured node, filtered and labelled as the contract's *Current evidence through existing connection reads* and *No admission decision before policy acceptance* requirements say, and SHALL show each answer's evaluator, question, Yes or No, confidence and the node's `modified` time. Admission means accepting the operator into Interfold, which no rule decides yet.

#### Scenario: Mixed response
- **WHEN** the response holds BrightID evaluations, an Interfold record with category `Uptime`, an Interfold record with confidence 0, a connection with no evaluations, and two valid Interfold answers
- **THEN** the view lists exactly the two valid answers, each with its evaluator, question, answer, confidence and time, labelled as returned by the node, under a note that admission is not determined

### Requirement: Failed evidence read

An evidence read that fails, or gets no response within 30 seconds, SHALL show the error and a try-again button, and SHALL never fall back to practice or seed data.

#### Scenario: Node read fails
- **WHEN** the inbound connections request fails, or gets no response within 30 seconds
- **THEN** the view shows that the read failed with a try-again button, and lists no answers
