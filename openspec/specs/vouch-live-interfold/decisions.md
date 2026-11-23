# vouch-live-interfold: constraints, rejected alternatives and rationale

## Rationale

- **Rationale: Write-conflict failures are not final.**
  On an ArangoDB error the node stores the operation as failed with the database's error number in result.arangoErrorNum. Its receiver retries the same operation at once when that number is the write conflict, 1200, and on no other failure, so only that failure can still turn into applied.
  Evidence: the receiver retries on errno.CONFLICT only, [receiver.py process_op](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/consensus/receiver.py#L63-L77)
  Evidence: the node stores arangoErrorNum on the failed operation, [apply.js operationsPut](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/apply.js#L15-L42)
  Evidence: python-arango defines CONFLICT as 1200, [arango/errno.py](https://github.com/arangodb/python-arango/blob/main/arango/errno.py)

- **Rationale: Applied before counts as applied.**
  The node raises OperationAppliedBeforeError, errorNum 25, only when the operation's hash is already recorded, and records the hash only after the operation applied. When it processes the operation a second time, as when its receiver reprocesses a block after an error, it stores this OperationAppliedBeforeError over the applied record. That is why a poll can report failed, errorNum 25, for an operation that applied.
  Evidence: the hash check, the insert after apply, and the stored failure, [apply.js operationsPut](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/apply.js#L15-L42)
  Evidence: errorNum 25 is OPERATION_APPLIED_BEFORE, [errors.js](https://github.com/Meta-Node/BrightID-Aura-Node/blob/42c1a9eda31bc9b180c15063c4932756c5109f4b/web_services/foxx/v6/errors.js#L18)
