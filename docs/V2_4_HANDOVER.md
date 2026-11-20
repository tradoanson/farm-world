# Farm World V2.4 — Handover and acceptance gate

Status: **CODE CANDIDATE — NOT DEPLOYED / NOT ACCEPTED**.

## Delivered source
- `db/migrations/0004_v24_social_staging.sql`: friend requests, accepted/declined transitions, blocks, RLS and restricted RPCs.
- `db/migrations/0007_v24_public_visits_staging.sql`: opt-in, aggregate-only public visits with bidirectional block checks.
- `lib/farm-social.ts`, `app/social-panel.tsx`: friend request UI and public profile visit.
- `tests/farm-social.test.ts`, `tests/farm-v2-release-safety.test.ts`: client validation and SQL static checks.

## Release acceptance (all required)
1. Apply 0004 then 0007 to a disposable staging Supabase project; verify SQL compiles and RPC grants.
2. Test with authenticated users A, B and C plus anon. B must have a public profile; A requests B; B accepts or declines. A cannot accept B's request. Repeated or conflicting transitions must fail.
3. A cannot request itself; hidden profiles cannot be requested or visited; either direction of block prevents requests and visits. Anonymous requests and visits fail.
4. A cannot SELECT another user's requests, INSERT/UPDATE/DELETE requests directly, or read private inventory/plots through the visit RPC.
5. Test concurrent duplicate requests, retries, logout/login and browser refresh. Verify no duplicate accepted friendship or leaked profile.
6. Confirm frontend feature flag `NEXT_PUBLIC_FARM_V2_FEATURES=enabled` only in an environment where migrations and RLS checks have passed.
7. Confirm all CI checks PASS and manually validate mobile UI and keyboard navigation.

## Release policy
Do not apply staging SQL to live Supabase or merge into `main` without all acceptance evidence. Existing player data and live V2.0 remain unchanged.
