# Farm World V3.1 — Husbandry handover and production gates

**Status: FOUNDATION IMPLEMENTED, LIVE HUSBANDRY NOT RELEASED.**

## Implemented
- Pure TypeScript husbandry state validator and server-time projection (`lib/v3-husbandry.ts`).
- Chicken/egg, cow/milk, sheep/wool definitions inherited from V3.0 contracts.
- Tests for growth timing, feed requirement, barn capacity, future timestamps, invalid stock, duplicate pens, no repeated ready display.
- No client-side coin/item mutations. No production database changes.

## Still required before V3.1 functional release
1. **Isolated Supabase project** with a verified baseline clone and restore point; never use the live database for destructive tests.
2. Design additive `farm_animal_pens`, `farm_animal_inventory`, `farm_animal_commands` (or equivalent) with farm ownership, capacity and inventory constraints, RLS, restricted grants and migration rollback/forward-fix plan.
3. Implement authenticated RPC for purchase/feed/collect with `auth.uid()` ownership, consistent lock order, server time, atomic inventory/coin operations, request UUID idempotency and replay-safe results.
4. Run isolated two-user tests for wrong owner, feed without resources, double collect, concurrent collect, offline retry and full warehouse. Verify no negative feed/coins and no duplicated products.
5. Implement online read API and game UI only after RPC contracts are verified; do not fabricate local livestock progress as persisted game data.
6. Verify restore, CI, mobile Safari/Chrome and production deployment. Document exact evidence in `docs/V3_RELEASE_EVIDENCE.md`.

## Deployment policy
Pure domain library and tests can merge after CI PASS; this does **not** enable livestock on the live website. Economic/DB/RPC changes require isolated verification before deployment. Do not label V3.1 Stable or report it playable until all gates pass.
