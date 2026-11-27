# vouch-live-interfold: constraints, rejected alternatives and rationale

## Rationale

- **Rationale: Write-conflict failures are not final.**
  On an ArangoDB error the node stores the operation as failed with the database's error number in result.arangoErrorNum. Its receiver retries the same operation at once when that number is the write conflict, 1200, and on no other failure. Any other failure makes the receiver restart from the last block it finished and apply the whole block again, so the operation can still turn into applied. The answer shows it as failed, and a retry of the answer polls the operation first.
  Evidence: the receiver retries on errno.CONFLICT only, [receiver.py process_op](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/consensus/receiver.py#L63-L77)
  Evidence: the node stores arangoErrorNum on the failed operation, [apply.js operationsPut](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/apply.js#L15-L42)
  Evidence: python-arango defines CONFLICT as 1200, [arango/errno.py](https://github.com/arangodb/python-arango/blob/b26e3b047bdf0acd4706038425c8261960a5d202/arango/errno.py#L212)

- **Rationale: Applied before counts as applied.**
  The node raises OperationAppliedBeforeError, errorNum 25, only when the operation's hash is already recorded, and records the hash only after the operation applied. When it processes the operation a second time, as when its receiver reprocesses a block after an error, it stores this OperationAppliedBeforeError over the applied record. That is why a poll can report failed, errorNum 25, for an operation that applied.
  Evidence: the hash check, the insert after apply, and the stored failure, [apply.js operationsPut](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/apply.js#L15-L42)
  Evidence: errorNum 25 is OPERATION_APPLIED_BEFORE, [errors.js](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/errors.js#L18)

- **Rationale: Post failures.**
  The node checks an operation, stores it, and only then returns its hash. Every check that rejects it throws a BrightID error, which the node sends with a 4xx status, before anything is stored. A post with no response, or with a 5xx status, may come after the store, so only polling the hash can tell.
  Evidence: the checks, the store and the response, in that order, [index.js operationsPost](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/index.js#L146-L174)
  Evidence: the node's error classes and their statuses, [errors.js](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/errors.js)

- **Rationale: Polls that get no state.**
  The node answers a poll with 404 when it holds no operation under the hash, and deletes stored operations only after 30 days. When polls in a 5-minute round got a 404 and never found the operation, the post never reached the node's store, so the operation can never be applied.
  Evidence: a poll for a hash the node does not hold throws OperationNotFoundError, [index.js operationGet](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/index.js#L176-L189)
  Evidence: operations are deleted after 30 days, [receiver.py remove_old_operations](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/consensus/receiver.py#L141-L152)

- **Rationale: Retry polls the earlier post.**
  A poll reporting failed is not final on the node. When applying any operation raises an error other than a write conflict, the receiver stops, starts again from the last block it finished, and applies every operation in that block again, so an operation reported failed can be applied later. An answer signed again while the first is still pending would be applied twice, and the older copy could replace a newer answer by the same evaluator to the same question, since the node keeps the evaluation it applied last. Polling the first hash before signing again catches an operation that was applied or is still pending. It cannot catch one reported failed that the replay applies after the retry signs again.
  Evidence: the receiver raises on any apply error but a conflict, [receiver.py process_op](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/consensus/receiver.py#L63-L77)
  Evidence: after an error it restarts from LAST_BLOCK, which it saves only once a block is done, [receiver.py main](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/consensus/receiver.py#L163-L243)
  Evidence: an Evaluate replaces the evaluator's earlier evaluation in the same domain and category, [db.js evaluate](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/db.js#L149-L207)
