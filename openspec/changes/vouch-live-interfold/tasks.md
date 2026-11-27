## 1. Signer (AUR-350, BrightID/aura#8)

- [x] 1.1 Give `buildEvaluateOperation` in `@aura/domain` a `domain` argument, defaulting to `BrightID`, and widen `category` to accept the three Interfold categories, `Keyholder`, `Self-custody` and `Disclosure`; `apps/core`'s BrightID calls stay unchanged.
- [x] 1.2 In `apps/core`, leave the persisted login store under the key it already uses, so nobody signed in to core is logged out, and write that key's name to the localStorage key `aura-core-auth` each time core loads. The store's key is `storage-` plus an id from SolidJS's `createUniqueId` counter, so it depends on the order core's stores load, and only core can name it.
- [ ] 1.3 Read core's session in `apps/vouch` with `readCoreSession` from `@aura/domain`, which on each call reads the name in `aura-core-auth` and then the store under that name. So it sees every write to the store, including one by a tab still running an older build of core, which writes the same key as long as the stores before it load in the same order.

## 2. Live adapter and switches (AUR-345, AUR-346)

- [ ] 2.1 Read `VITE_VOUCH_LIVE_WRITES`, `VITE_VOUCH_LIVE_READS`, and the node URL as *Node URL* says; register the two live routes only when their switch is on, and validate the operator id.
- [ ] 2.2 Map the question index to its category and encode the answer as the shared contract says, refusing bad input before signing.
- [ ] 2.3 Track each live answer through holding, submitting, submitted, unconfirmed, applied and failed, with retry and check again, reading the node's `data.result.errorNum` and `data.result.arangoErrorNum` when a poll reports `failed`.

## 3. Evidence view (AUR-347)

- [ ] 3.1 Read the operator's inbound connections, keep only current valid Interfold answers, and render them with the labels the spec requires.

## 4. Proof (BrightID/aura#12)

- [ ] 4.1 With both switches on against aura-test, run the end-to-end steps in BrightID/aura#12 and post the results there.

## 5. Follow-up

- [ ] 5.1 When BrightID/shared-specs archives `interfold-live-endorsements`, point this spec's Purpose link at the accepted spec.
- [ ] 5.2 On aura-test and on aura-node, confirm that `GET /brightid/v6/operations/{hash}` for a failed operation returns `data.result.errorNum` and `data.result.arangoErrorNum`, and that a hash the node never stored gets a 404. If the response the browser gets lacks the two fields, the writer finds neither field and treats every failure as final at once; then change the node so it returns them before a production build turns on live writes.
