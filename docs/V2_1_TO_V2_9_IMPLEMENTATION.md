# Farm World V2.1–V2.9 implementation contract

## Non-negotiable
- Online-only authoritative Supabase state; no offline writes.
- Preserve all existing farms, inventories, plots, quests, command journals and user accounts.
- Schema changes: additive migrations with a tested rollback or forward-fix plan; snapshot/backup verified before high-risk migrations.
- All gold, items, upgrades, marketplace transactions are atomic and idempotent by user-scoped UUID.
- Never use production player data for destructive integration tests.
- Do not label V2.9 Stable until all required gates pass and evidence is linked.

## V2.1 Security & Stability
- Audit SECURITY DEFINER functions and execute grants, RLS, cross-account access, auth flow.
- Resolve pending farm/upgrade mutual exclusion; recover uncertain network responses.
- Two-device concurrent command test, CI and deployment gate.
- Evidence: tests, security audit, data-count before/after, green CI, manual smoke.

## V2.2 Farm Economy
- Define server-owned crop unlock rules, daily quest state, softlock recovery.
- Tests: insufficient funds, invalid crop, replay, concurrent purchase, time boundaries.

## V2.3 Land & Buildings
- Enforce server-owned warehouse capacity and land expansion.
- Migrate existing farms without deleting plots or inventory.
- Tests: full warehouse, concurrent harvest, maximum building level, migration compatibility.

## V2.4 Friends & Social
- Explicit opt-in profile; searchable nickname; requests/accept/decline/block.
- Read-only farm visits, private-by-default; no arbitrary user mutation.
- Tests: private profile hidden, blocked account, owner authorization.

## V2.5 Realtime
- Realtime is an invalidation signal, not an authoritative balance.
- Reconnect via snapshot; no reliance on event delivery order.
- Tests: lost messages, duplicate events, concurrent sessions.

## V2.6 Marketplace
- Listing escrow/reservation or atomic inventory transfer with server transaction.
- Atomic buyer debit, seller credit, inventory transfer and command journal.
- Tests: double purchase, cancellation race, insufficient funds, full warehouse, two users, rollback.

## V2.7 Community
- Server-defined seasonal leaderboard, bounded rewards, moderation and rate limiting.
- Tests: opt-out, season rollover, reward replay.

## V2.8 UX & Performance
- Mobile accessibility, loading/empty/error states, latency budgets and bulk action safety.
- Tests: mobile viewport, network interruption, keyboard accessibility.

## V2.9 Release Candidate
- End-to-end regression, security, concurrent load, disaster recovery drill, backup verification.
- CI, deploy, manual mobile smoke and two-account tests must PASS.
- Deliver changelog, migrations, rollback guide, test matrix and known issues.

## Current evidence
- V2.0 commit 1f59c478: CI and Pages PASS.
- V2.1 audit commit 58cc31d0: CI and Pages PASS.
- V2.2–V2.9 are NOT implemented or accepted.
- Production data was not modified in this planning update.

## Release blocker
- No authenticated two-account end-to-end test evidence or tested backup/restore drill.
- Production marketplace and Realtime features do not yet exist.
