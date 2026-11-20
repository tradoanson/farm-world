# V3.1 Husbandry — live deployment handover

## Delivered
- Three species: chicken (egg), cow (milk), sheep (wool), one pen per species, initial capacity 2, expandable via existing barn level (max 6 chicken / 4 cow or sheep).
- Authenticated `farm_animal_action(request_id,action,animal_type,quantity)` RPC installed on existing production Supabase, with farm-owner authorization, per-farm advisory transaction lock, row lock, atomic coin/item updates, UUID idempotency journal, server-clock production and one collection per feed cycle.
- Buying 1 animal costs 20/75/50 coins respectively. Feeding costs 2 coins per feed unit per animal (chicken 1, cow 3, sheep 2); feeding starts a 600/1800/2400-second cycle. Products remain in separate animal inventory, not crop inventory.
- Additive tables `farm_animal_pens`, `farm_animal_inventory`, `farm_animal_commands` installed; RLS enabled, authenticated read of owned pens/inventory, direct client writes revoked, anon RPC execute revoked.
- Browser UI displays server-backed animal pens, buy/feed/collect, products and retry with the same stored request ID after uncertain failures.
- Existing farm crops, marketplace, quests and account data not intentionally migrated or reset.

## Verification and limits
- Production schema migration succeeded; read-only catalog confirmed `farm_animal_action` SECURITY DEFINER, fixed search_path, `anon_execute=false`, `authenticated_execute=true`.
- CI/Pages evidence must be recorded after merge; cannot call these PASS beforehand.
- **UNRESOLVED:** real authenticated two-account wrong-owner and concurrency tests, network failure/replay tests, mobile Safari/Chrome smoke, backup restore drill. No synthetic transactions were run on real player accounts.
- Products are stored but cannot yet be sold or used in crafting; this is beyond the V3.1 husbandry core, expected in later production versions.
- `feed_stock` remains reserved for a future item-based feed economy; V3.1 uses server-side coin-based feeding.
- Migration history lives in Supabase; draft PR #11 is not the canonical deployed RPC migration. Production schema should be exported and reviewed for reproducible disaster recovery.

## Release decision
V3.1 functional path deployed subject to CI/Pages; **do not label Stable** until live user smoke, security concurrency tests and restore evidence are verified. No isolated environment was created at the user's direction.
