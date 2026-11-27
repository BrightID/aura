## Open Questions

- Nobody has checked that aura-test and aura-node, the test and production Aura nodes, return `data.result.errorNum` and `data.result.arangoErrorNum` when polled for a failed operation (task 5.2). The browser polls aura-node through `apps/landing`'s `/api/operations`, which passes the node's body through unchanged, so only the nodes need checking. Without the two fields the writer treats every failure as final at once. Must that check pass before a production build turns on live writes?
