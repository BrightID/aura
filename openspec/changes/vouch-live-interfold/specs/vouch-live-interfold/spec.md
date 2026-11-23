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

#### Scenario: Set
- **WHEN** the app is built with `VITE_AURA_NODE_URL` set to another node
- **THEN** evidence reads and answer writes both go to that node

### Requirement: Evaluator from the core login

The live writer SHALL take the evaluator's BrightID and secret key from core's persisted login store. Reading core's login store is not the separate app login that the shared interfold-endorsements contract forbids, because it adds no new account or gate ([ADR-0004](https://github.com/BrightID/shared-specs/pull/7)). With no signed-in core user, the answer route SHALL say that the person must sign in to Aura, link to `/core/`, and submit nothing.

#### Scenario: Not signed in
- **WHEN** a person opens `/live/:operator` with live writes on and no core login in the browser
- **THEN** the page asks them to sign in to Aura with a link to `/core/`, and no answer can be submitted

### Requirement: Practice identities never sign

A practice persona or room identity SHALL never supply the evaluator or the key.

#### Scenario: Practice identity chosen
- **WHEN** a practice persona or a room identity is selected and the person is signed in to core
- **THEN** a live answer is signed as the core user, and the practice id appears nowhere in the operation

### Requirement: Signed as the evaluator shown

An answer SHALL be signed only as the core user the answer screen showed when it opened. Each time the answer moves to `submitting`, before signing it, the writer compares the signed-in core user with that one. If nobody or another account is signed in then, the answer moves to `failed`, with a message saying whether nobody or another account is signed in, and nothing is sent; a retry fails the same way until that user is signed in again.

#### Scenario: Account changed after the page opened
- **WHEN** the answer screen shows evaluator A, and the person signs in to core as B in another tab before answering
- **THEN** the answer fails, says another account is signed in, and is not signed as B

#### Scenario: Signed back in
- **WHEN** an answer failed because evaluator A was signed out, and A signs in to core again before Retry is pressed
- **THEN** the retry signs as A and the answer is sent

#### Scenario: Signed out after the page opened
- **WHEN** the answer screen shows evaluator A, the person signs out of core in another tab, answers, and then presses Retry
- **THEN** the answer fails and says to sign in, the retry fails the same way, and nothing is sent

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

A live answer SHALL be in one of `holding`, `submitting`, `submitted`, `unconfirmed`, `applied` and `failed`, and SHALL show as applied only in `applied`. It starts in `holding`; besides undo, which discards it, it SHALL move only:

- `holding` to `submitting`, when the undo window ends;
- `submitting` to `submitted` or `failed`;
- `submitted` to `applied`, `failed` or `unconfirmed`;
- `unconfirmed` to `submitted`, on check again;
- `failed` to `submitting`, on retry.

No move leaves `applied`.

#### Scenario: Applied is final
- **WHEN** an answer is applied
- **THEN** it offers no undo, retry or check again, and stays applied

### Requirement: Undo only while holding

Undo during the 1.5-second window SHALL discard the answer. Once an answer has left `holding`, no undo SHALL be offered.

#### Scenario: Undo inside the window
- **WHEN** the evaluator undoes an answer while it is holding
- **THEN** the answer is discarded and nothing is signed or sent

#### Scenario: Undo after submission
- **WHEN** an answer is submitting, submitted, unconfirmed, applied or failed
- **THEN** no undo is offered, and the screen keeps showing the answer's current state

### Requirement: Submission confirmed by the node

A `submitting` answer SHALL be signed with a new timestamp and posted, unless the check in *Signed as the evaluator shown* fails; it becomes `submitted` only when the node returns the operation's hash and that hash equals what the `hash` function in `@aura/domain` computes from the signed message, and `failed` otherwise.

#### Scenario: Hash mismatch
- **WHEN** the node returns a hash that does not match the signed message
- **THEN** the answer shows as failed

### Requirement: Polling until applied

A `submitted` answer SHALL poll the operation's state every 5 seconds. The answer becomes `applied` when the node reports `applied`. It becomes `failed` when the node reports `expired`, or reports `failed` with an error that *Write-conflict failures are not final* treats as final. It becomes `unconfirmed` when 5 minutes pass after it became `submitted` without reaching `applied` or `failed`; a write-conflict `failed` poll keeps polling and does not restart the 5 minutes.

#### Scenario: Expired
- **WHEN** a poll reports `expired`
- **THEN** the answer shows as failed, with Retry

#### Scenario: Conflict that never clears
- **WHEN** every poll for 5 minutes reports `failed` with `arangoErrorNum` 1200
- **THEN** the answer stays submitted during those polls and becomes unconfirmed at the 5-minute mark

#### Scenario: Accepted, not yet applied
- **WHEN** the node returns the hash but polling still reports `unknown`, `init` or `sent`
- **THEN** the answer shows as submitted, not applied

### Requirement: Write-conflict failures are not final

When the node reports `failed` with `arangoErrorNum` 1200 in the `result` of its response to that poll (`GET /brightid/v6/operations/{hash}`), the answer SHALL stay `submitted` and keep polling, until the 5-minute limit in *Polling until applied*, because the node retries that write conflict itself. On any other `failed`, it SHALL become `failed` at once, unless *Applied before counts as applied* applies.

#### Scenario: Failed then applied
- **WHEN** a poll reports `failed` with `arangoErrorNum` 1200, and a later poll reports `applied`
- **THEN** the answer shows as applied, never as failed

#### Scenario: Failed for another reason
- **WHEN** a poll reports `failed` with neither `errorNum` 25 nor `arangoErrorNum` 1200, or with no error at all
- **THEN** the answer shows as failed at once, with Retry

### Requirement: Applied before counts as applied

When the node reports `failed` with `errorNum` 25 in the `result` of its response to that poll, the answer SHALL become `applied`, because the node raises that error only for an operation it has already applied.

#### Scenario: Applied before
- **WHEN** a poll reports `failed` with `errorNum` 25, as when the node processed an applied operation a second time and stored that error over its applied record
- **THEN** the answer shows as applied

### Requirement: Unconfirmed answers stay pending

An `unconfirmed` answer SHALL offer no retry, only a way to check again. Checking again returns it to `submitted` and polls for another 5 minutes, after which it is `unconfirmed` again if the node still has not settled it.

#### Scenario: Never settles
- **WHEN** 5 minutes pass with no poll reporting `applied` or `expired`, and none reporting a `failed` that is final
- **THEN** the answer shows as not confirmed yet, offers to check again and no retry, and checking again shows it applied once the node reports `applied`

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
