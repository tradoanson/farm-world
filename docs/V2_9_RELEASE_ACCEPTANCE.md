# Farm World V2.9 — Release candidate and acceptance record
Date: 2026-11-20 (UTC+7). This is a release-candidate checklist, not a certificate of full acceptance.

## Changelog
- V2.6: marketplace listings, purchases, cancellations and server-side idempotency journal.
- V2.7: opt-in monthly community leaderboard and bounded monthly reward.
- V2.8: sync state/latency feedback, mobile focus/touch and confirmation for bulk actions.
- V2.9: automated migration/security regression contracts, release checklist and recovery procedure.

## Migration inventory
- `db/migrations/0005_v26_marketplace_staging.sql` — deployed previously to Supabase.
- `db/migrations/0006_v27_seasonal_community.sql` — deployed previously to Supabase.
- V2.9 adds no production schema changes.

## Acceptance matrix
| Gate | Evidence | Status |
|---|---|---|
| Typecheck / lint / unit tests / static build | GitHub Actions CI for release commit | Pending CI |
| Pages deployment | GitHub Actions Pages for release commit | Pending deploy |
| RLS enabled on farm tables | Supabase catalog inspection | PASS |
| Security advisor | 9 intentional but privileged SECURITY DEFINER RPC warnings; 5 RLS no-policy notices; leaked password protection warning | REVIEW |
| Two authenticated users trade one listing | Requires two controlled test accounts, isolated stock and balance snapshots | NOT RUN |
| Concurrent double purchase / cancel race | Requires controlled parallel authenticated RPC test | NOT RUN |
| Offline/reconnect/replay on mobile | Manual device smoke | NOT RUN |
| Backup restore verification | Restore into isolated disposable project, compare row counts/checksums | NOT RUN |
| Latency budget under load | p50/p95 measurements with stated hardware and network | NOT RUN |

Do not report the RC as fully accepted until every required gate is PASS with timestamped evidence. Avoid test purchases on production accounts.

## Manual mobile smoke
1. Open deployed Pages URL on iOS Safari and Android Chrome. Sign in and check 8x8 board, zoom, navigation and screen-reader labels.
2. Open Marketplace, verify open/mine/all tabs, list an isolated test crop, cancel and verify stock is restored exactly once.
3. Sign in with a second controlled account, purchase a fresh listing, verify buyer/seller balances and inventory before and after.
4. Interrupt network before RPC response; restore connection and retry the same request UUID; ensure no double charge.
5. Repeat simultaneous buy and buy/cancel on a disposable test environment with audit logs.
6. Check monthly reward once-only, private profile exclusion and UTC month boundary.

## Backup and recovery
Before any production database operation, take a provider-managed snapshot or a consistent `pg_dump` backup including schema/data and secure storage; record time, project reference and encrypted backup location without committing secrets.
Verify by restoring to a separate isolated database and comparing key row counts and checksums (player_farms, farm_state, farm_inventory, farm_commands, market tables, profiles, rewards).
Rollback UI: redeploy last known-good GitHub Pages artifact/commit, verify smoke tests.
Rollback database: prefer forward corrective migration; never drop or reset production tables. If data restore is necessary, require explicit approval, isolate writes, preserve transaction logs and rehearse restore first.
Do not describe a backup as verified without a successful restore drill.

## Known limitations
- Only one registered user was observed in prior database checks, so authenticated two-account E2E evidence is unavailable.
- SECURITY DEFINER endpoints require dedicated privilege/authorization review; RLS alone does not secure these RPCs.
- Static contract tests do not prove concurrency, performance or disaster recovery.
- Existing roadmap status text predates implementation and should not be treated as current release evidence.
