## 1. Signer (AUR-350, BrightID/aura#8)

- [ ] 1.1 Give `buildEvaluateOperation` in `@aura/domain` a `domain` argument, defaulting to `BrightID`, and widen `category` to accept the three Interfold categories; `apps/core`'s BrightID calls stay unchanged.
- [ ] 1.2 Give core's persisted login store a fixed localStorage name, and carry over a session saved under the key `makePersisted` generated before the store had a name, so nobody signed in to core is logged out.
- [ ] 1.3 Read that store from `apps/vouch`.

## 2. Live adapter and switches (AUR-345, AUR-346)

- [ ] 2.1 Read `VITE_VOUCH_LIVE_WRITES`, `VITE_VOUCH_LIVE_READS` and `VITE_AURA_NODE_URL`; register the two live routes only when their switch is on, and validate the operator id.
- [ ] 2.2 Map the question index to its category and encode the answer as the shared contract says, refusing bad input before signing.
- [ ] 2.3 Track each live answer through holding, submitting, submitted, unconfirmed, applied and failed, with retry and check again, reading the node's `result.errorNum` and `result.arangoErrorNum` when a poll reports `failed`.
- [ ] 2.4 Set `VITE_AURA_NODE_URL` for `apps/vouch` to the node `apps/core` uses in the same deployment, so the key core signed in with is known to that node.

## 3. Evidence view (AUR-347)

- [ ] 3.1 Read the operator's inbound connections, keep only current valid Interfold answers, and render them with the labels the spec requires.

## 4. Proof (BrightID/aura#12)

- [ ] 4.1 With both switches on against aura-test, run the end-to-end steps in BrightID/aura#12 and post the results there.

## 5. Follow-up


- [ ] 5.1 When BrightID/shared-specs archives `interfold-live-endorsements`, point this spec's Purpose link at the accepted spec.
- [ ] 5.2 Check two paths: aura-test directly, and aura-node through `apps/landing`'s `/api/operations` proxy, the path the browser uses for aura-node. On each, confirm that `GET /brightid/v6/operations/{hash}` for a failed operation returns `result.errorNum` and `result.arangoErrorNum`. If the response the browser gets lacks them, the writer finds neither field and treats every failure as final at once; then change the node or the proxy so the fields reach the browser before relying on the 1200 and 25 rules.
