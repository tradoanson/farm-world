# Farm World V3 — Development roadmap and delivery contract

Status: **APPROVED DIRECTION / PLANNING ONLY**. The V3 implementation has not been completed by this roadmap commit.

## Product direction
Balance **2.5D/isometric graphics**, **animal husbandry**, **processing/production**, and **player-to-player economy**. Extend the existing `tradoanson/farm-world` repository and GitHub Pages site. Do not build a separate preview game as the final product.

## Non-negotiable compatibility and safety
- Preserve all existing accounts, farms, coins, inventory, plots, quests, marketplace records, command journals and rewards.
- Supabase/PostgreSQL remains authoritative; no offline writes or client-authoritative gold/items.
- Additive migrations only, with backward compatibility and documented forward-fix/recovery. No production reset, destructive smoke test, or unapproved data migration.
- Server-side authenticated RPCs must authorize owner and validate every input; economic changes must be atomic, idempotent by user-scoped request UUID, and concurrency-safe.
- No live-DB test accounts or production destructive/concurrency experiments. Run E2E and load tests against an isolated environment.
- For UI-only, backward-compatible release candidates without DB/schema/RPC/economic changes: merge to main and deploy the main webgame after CI (typecheck, lint, unit tests, build) PASS, provided outstanding manual gates are explicitly marked UNRESOLVED and the UI labels the release RC. Do not label Stable. For DB/schema/RPC/economic changes, require isolated transaction/security/backup gates before production deployment. A green CI is not proof of two-user E2E, mobile performance, backup restore, or security acceptance.
- Each release must include code, tests, evidence links, migration inventory, known issues and a version/changelog update.

## V2.9 exit blockers / V3.0 entry
Current `docs/V2_9_RELEASE_ACCEPTANCE.md` identifies incomplete two-account marketplace tests, buy/cancel concurrency, offline/reconnect testing, restore drill, mobile latency and SECURITY DEFINER authorization review. Track each as PASS/FAIL/UNRESOLVED with evidence before declaring V3.0 stable. Supabase RLS enabled is not equivalent to RPC security. Reconcile stale V2 roadmap claims against actual commits.

## V3.0 — Foundation & graphics (required first)
**Scope:** audit V2.9 baseline; verified isolated backup/restore; review privileged RPCs; two-user trade/replay/concurrency E2E in isolated DB; mobile smoke; sync diagnostics; version consistency. Build an original coherent 2.5D/isometric art direction (crop growth stages, harvest, paths, house, warehouse, fences) and touch-friendly camera. Separate game state adapter, renderer, interaction controller and React UI. Prototype Phaser only after benchmark; do not rewrite the whole renderer without evidence. Define animal/production interfaces and additive migration designs, but do not launch untested economic modules.

**Acceptance:** original assets committed with provenance; old farm snapshots render correctly; mobile touch/zoom works; 30 FPS target on documented device under specified scene, desktop target 60 FPS; load p95 target <=3s on specified network; critical transactional and restore gates PASS; CI/build/Pages PASS. These are targets, not achieved metrics.

## V3.1 — Husbandry
Chicken/egg, cow/milk, sheep/wool; barn capacity, feed consumption, server-clock production, atomic harvest and command journal. Gate: no double harvest, no negative feed, capacity and auth tests.

## V3.2 — Processing
Recipe catalog, input/output quantities, production queue, timer, storage cap and server-validated cost. Gate: atomic consumption/claim, replay and cancellation rules, no duplication.

## V3.3 — Farm expansion
Unlock land, orchards, paths, fences and decorative placement with server-owned layout. Gate: migration preserves all legacy plots, bounded layout, mobile render performance.

## V3.4 — Economy
Orders, delivery, searchable market, history, seller and buyer confirmations, moderation and fraud limits. Gate: two-user end-to-end, concurrency, conservation of items/coins, warehouse full handling.

## V3.5 — Social
Opt-in friends, read-only farm visits, block and privacy defaults. Gate: cross-account isolation and private/blocked access tests.

## V3.6 — Events
Daily/weekly missions, seasonal festivals, bounded rewards and season rollover. Gate: UTC boundaries, once-only reward and abuse limits.

## V3.7 — Cooperative logistics
Delivery vehicle, supply contracts and opt-in cooperative jobs. Gate: permission, expiry, escrow/settlement and concurrent claim tests.

## V3.8 — Optimization
Measured client FPS, mobile memory, database query latency p50/p95, reconnect and load tests. Gate: measured baselines and regression budgets.

## V3.9 — Stable release
Full regression, security review, two-account E2E, backup restore rehearsal, mobile smoke, documented rollback, changelog and release tag. No Stable label with unresolved critical blockers.

## GitHub execution rules
1. Create branch `feature/v3-N-<slug>` from main for each version; add tests and docs in same PR.
2. Run `.github/workflows/ci.yml` and `.github/workflows/v3-roadmap.yml` (manual dispatch for roadmap audit). No automatic deployment of planning branches.
3. For any DB change: separate migration review, isolated execution, backup verification and explicit production release approval.
4. For additive UI-only RCs, merge after CI PASS and deploy via `.github/workflows/pages.yml`, explicitly disclosing UNRESOLVED manual gates. For economic/DB/RPC changes, do not merge until relevant isolated security/concurrency/backup gates PASS. Stable designation always requires all acceptance gates.
5. Record commit SHA, CI/Pages URLs, release checklist and any unresolved manual gates in `docs/V3_RELEASE_EVIDENCE.md`.
6. Do not conflate 'code merged', 'Pages deployed', and 'business acceptance'.

## Version acceptance checklist template
- [ ] Functional scope complete and documented
- [ ] Migration additive and data preserved (or N/A)
- [ ] Auth/RLS/RPC security tests PASS
- [ ] Idempotency and concurrency tests PASS (or N/A with rationale)
- [ ] Typecheck/lint/unit/build PASS
- [ ] Isolated E2E and mobile smoke PASS where applicable
- [ ] Backup/restore evidence verified where applicable
- [ ] Main merge, Pages deployment and release evidence links recorded
