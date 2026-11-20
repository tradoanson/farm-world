# Farm World V2.2–V2.9 Release Candidate Gate

Status: **BLOCKED — do not merge or deploy**.

## Required evidence

| Area | Gate | Status |
|---|---|---|
| V2.2 economy, quests and crop unlock | Server enforces level and economy rules; UI matches | FAIL: rules currently client-only / draft |
| V2.3 land/buildings | Server enforces plot unlock and warehouse capacity | FAIL: not wired to RPC |
| V2.4 friends and read-only visits | Social RPCs + read-only public visit; RLS abuse tests | FAIL: visits not implemented |
| V2.5 realtime | Reconnect, subscription cleanup, revision monotonicity | FAIL: polling only |
| V2.6 marketplace | Escrow, two-user concurrent buys, cancellation, idempotency and rollback | UNRESOLVED: staging migration and UI, no integration tests |
| V2.7 seasonal events | Activation baseline, accurate event ledger, lifecycle and rewards | FAIL: approximate read-only progress only |
| V2.8 UX/performance | Mobile, accessibility, load/performance budget | UNRESOLVED |
| V2.9 RC | CI, multi-account staging E2E, backup, rollback rehearsal | FAIL |

## Deployment safeguards
1. Export and verify production backup; record schema, row counts and migration checksums.
2. Apply migration files only to isolated staging with representative synthetic users.
3. Test authorization with two distinct authenticated sessions and anon session.
4. Run concurrent purchase, retry, refund, disconnection and browser refresh scenarios.
5. Require green CI, production-compatible schema, and security review.
6. Deploy migrations before UI; feature-gate dependent UI until migration is verified.
7. Compare production counts and balances before and after; rollback using rehearsed plan.

**No production schema changes have been authorized by passing these gates.**
