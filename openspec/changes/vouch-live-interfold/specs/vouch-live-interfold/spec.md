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

`apps/vouch` SHALL send every live request to the node `apps/core` uses in a build of the same mode, because only that node knows the key that `apps/core` signed in with. A production build (Vite mode `production`) SHALL use `VITE_AURA_NODE_URL`, or `https://aura-node.brightid.org` when it is unset; any other build SHALL use `VITE_AURA_TEST_NODE_URL`, or `https://aura-test.brightid.org` when it is unset.

#### Scenario: Unset in a production build
- **WHEN** a production build has live reads on and no `VITE_AURA_NODE_URL`
- **THEN** the evidence route reads from `https://aura-node.brightid.org`

#### Scenario: Unset in a development build
- **WHEN** a development build has live reads on, no `VITE_AURA_TEST_NODE_URL`, and `VITE_AURA_NODE_URL` set to another node
- **THEN** the evidence route reads from `https://aura-test.brightid.org`

#### Scenario: Set
- **WHEN** a production build has `VITE_AURA_NODE_URL` set to another node
- **THEN** evidence reads and answer writes both go to that node

### Requirement: Answers to aura-node through landing

When the node is `https://aura-node.brightid.org`, every post and poll of an answer SHALL go to the same-origin `/api/operations` route that `apps/landing` serves, because aura-node's server refuses the browser's cross-origin post. So `apps/vouch` writes to aura-node only when served from `apps/landing`'s origin; evidence reads go to aura-node directly.

#### Scenario: Answers to aura-node
- **WHEN** a production build uses `https://aura-node.brightid.org` and an answer is posted and polled
- **THEN** the post and the polls go to `/api/operations` on the page's own origin

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

A live answer SHALL be in one of `holding`, `submitting`, `submitted`, `unconfirmed`, `applied` and `failed`, and SHALL show as applied only in `applied`. It starts in `holding` and, unless undo discards it, SHALL move only:

- `holding` to `submitting`, after the undo window;
- `submitting` to `submitted`, `applied` or `failed`;
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

A `submitting` answer SHALL be signed with a new timestamp and posted, unless *Retry polls the earlier post* settles it first, or the check in *Signed as the evaluator shown* then fails. The answer's hash is what the `hash` function in `@aura/domain` computes from the message it last signed. The answer becomes `submitted` when the node returns a hash equal to the answer's hash, `failed` when it returns another hash or none, and otherwise as *Post failures* says.

#### Scenario: Hash mismatch
- **WHEN** the node returns a hash that does not match the signed message
- **THEN** the answer shows as failed

### Requirement: Post failures

A post the node answers with a status from 400 to 499 SHALL make the answer `failed`. A post that gets no response within 30 seconds, fails on the network, gets a status of 500 or above, or gets a body that cannot be read SHALL make the answer `submitted` under the answer's hash, because the node may have stored the operation before its response was lost.

#### Scenario: Post rejected
- **WHEN** the node answers the post with status 400
- **THEN** the answer shows as failed, with Retry

#### Scenario: No response to the post
- **WHEN** the post gets no response within 30 seconds
- **THEN** the answer shows as submitted, polls the answer's hash, and shows as applied once a poll reports `applied`

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

### Requirement: Polls that get no state

A poll that gets no response within 30 seconds, fails on the network, or gets an error status, a 404 included, SHALL count as no report: polling goes on, and the 5 minutes keep running. When the 5 minutes pass, and at least one poll in them got a 404 while every other poll got no report, the answer SHALL become `failed`, not `unconfirmed`, because the node held no such operation when polled.

#### Scenario: Poll request fails
- **WHEN** a poll gets no response within 30 seconds, and a later poll reports `applied`
- **THEN** the answer stays submitted until that later poll, then shows as applied

#### Scenario: Never stored
- **WHEN** every poll for 5 minutes gets a 404
- **THEN** the answer shows as failed at the 5-minute mark, with Retry

#### Scenario: Not found or unreachable
- **WHEN** every poll for 5 minutes gets either a 404 or no response within 30 seconds, and at least one gets a 404
- **THEN** the answer shows as failed at the 5-minute mark, with Retry

#### Scenario: Unreachable for 5 minutes
- **WHEN** no poll for 5 minutes gets a response within 30 seconds
- **THEN** the answer shows as unconfirmed at the 5-minute mark, and offers to check again

### Requirement: Write-conflict failures are not final

When the node reports `failed` with `arangoErrorNum` 1200 in the `data.result` of a poll's response (`GET /brightid/v6/operations/{hash}`), the answer SHALL stay `submitted` and keep polling, until the 5-minute limit in *Polling until applied*, because the node retries that write conflict itself. On any other `failed`, it SHALL become `failed` at once, unless *Applied before counts as applied* applies.

#### Scenario: Failed then applied
- **WHEN** a poll reports `failed` with `arangoErrorNum` 1200, and a later poll reports `applied`
- **THEN** the answer shows as applied, never as failed

#### Scenario: Failed for another reason
- **WHEN** a poll reports `failed` with neither `errorNum` 25 nor `arangoErrorNum` 1200, or with no error at all
- **THEN** the answer shows as failed at once, with Retry

### Requirement: Applied before counts as applied

When the node reports `failed` with `errorNum` 25 in the `data.result` of a poll's response, the answer SHALL become `applied`, because the node raises that error only for an operation it has already applied.

#### Scenario: Applied before
- **WHEN** a poll reports `failed` with `errorNum` 25
- **THEN** the answer shows as applied

### Requirement: Unconfirmed answers stay pending

An `unconfirmed` answer SHALL offer no retry, only a way to check again. Checking again returns it to `submitted` and polls for another 5 minutes, after which it is `unconfirmed` again if the node still has not settled it.

#### Scenario: Never settles
- **WHEN** 5 minutes pass with polls reporting `init` or `sent`, and none reporting `applied`, `expired` or a `failed` that is final
- **THEN** the answer shows as not confirmed yet, offers to check again and no retry, and checking again shows it applied once the node reports `applied`

### Requirement: Retry after failure

A failed live answer SHALL offer a retry button, which moves it to `submitting`. When *Retry polls the earlier post* signs the answer again, it SHALL sign the same Yes or No with the confidence selected for that question when Retry was pressed, not the confidence first given; the screen lets the evaluator change it while the answer is failed.

#### Scenario: Rejected and retried
- **WHEN** the node answers the post with status 400, the evaluator presses retry, and a poll of the answer's hash gets a 404
- **THEN** the answer is signed again with a new timestamp, and shows as applied only once polling reports `applied`

#### Scenario: Retry with another confidence
- **WHEN** an answer given with confidence 2 failed, the evaluator selects confidence 4 and presses retry, and a poll of the answer's hash gets a 404
- **THEN** the answer is signed again with confidence 4

### Requirement: Retry polls the earlier post

On retry of an answer posted before, whatever that post's result, the writer SHALL first poll the answer's hash once. By the result, the answer SHALL become:

- `applied`, on `applied`, or `failed` with `errorNum` 25;
- `submitted`, on `unknown`, `init`, `sent`, or `failed` with `arangoErrorNum` 1200;
- signed again and posted, on a 404, `expired`, or any other `failed`;
- `failed`, with nothing signed, on any result *Polls that get no state* counts as no report but a 404.

#### Scenario: Still pending at retry
- **WHEN** an answer failed, and when the evaluator presses retry a poll of its hash reports `failed` with `arangoErrorNum` 1200
- **THEN** the answer shows as submitted and polls that hash for another 5 minutes, and nothing is signed again

#### Scenario: Node unreachable at retry
- **WHEN** an answer failed, and when the evaluator presses retry the poll of its hash gets no response within 30 seconds
- **THEN** the answer shows as failed again, with Retry, and nothing is signed

#### Scenario: Applied after it failed
- **WHEN** an answer failed on a poll reporting `failed` with `errorNum` 4, and when the evaluator presses retry a poll of its hash reports `applied`
- **THEN** the answer shows as applied, and nothing is signed again

### Requirement: No new answer while one is in flight

The answer screen SHALL offer no new Yes or No to a question while its last answer is `holding`, `submitting`, `submitted` or `unconfirmed`.

#### Scenario: Answer in flight
- **WHEN** a question's last answer is holding, submitting, submitted or unconfirmed
- **THEN** the screen offers no Yes or No for that question

### Requirement: One pending answer per question

A new Yes or No to a question whose last answer was posted and is now `failed` SHALL go through that answer's retry, which signs the new Yes or No in place of the earlier one, but only on a result for which *Retry polls the earlier post* signs again. On any other result the new Yes or No is dropped, and the screen shows the earlier answer's Yes or No in the state that rule gives. This is because an earlier answer applied after a newer one would replace the newer one.

#### Scenario: Earlier answer still pending
- **WHEN** a Yes failed on a poll reporting `failed` with `errorNum` 4, the evaluator answers No, and a poll of the earlier hash reports `init`
- **THEN** No is not signed, and the answer shows as submitted with Yes, polling the earlier hash

#### Scenario: Earlier answer gone
- **WHEN** a Yes failed after the node answered its post with status 400, the evaluator answers No with confidence 3, and a poll of the earlier hash gets a 404
- **THEN** No is signed with confidence 3 and posted at once, as a retry is, with no undo window

#### Scenario: Earlier answer applied after it failed
- **WHEN** a Yes failed on a poll reporting `failed` with `errorNum` 4, the evaluator answers No, and a poll of the earlier hash reports `applied`
- **THEN** No is not signed, and the answer shows as applied with Yes

#### Scenario: Earlier answer never posted
- **WHEN** a Yes failed before it was posted, because nobody was signed in to `apps/core`, and the evaluator, signed in again, answers No
- **THEN** No is a new answer: it holds for the undo window and is then signed and posted, with no poll first

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
