# Farm World V2.4 — Handover and acceptance gate

Status: **POSTGRESQL INTEGRATION PASS (2/2) — SUPABASE STAGING / RELEASE STILL PENDING**.

GitHub Actions V2.4 PostgreSQL Integration PASS on commit `5fe2a4d8`:
- https://github.com/tradoanson/farm-world/actions/runs/44703235676
- https://github.com/tradoanson/farm-world/actions/runs/44703226016

These tests run against disposable PostgreSQL 16 with simulated Supabase `auth.uid()` and roles. They are meaningful SQL/RLS integration tests, **not** a full Supabase hosted staging acceptance or browser end-to-end test.

## Delivered source
- `db/migrations/0004_v24_social_staging.sql`: friend requests, accepted/declined transitions, blocks, RLS and restricted RPCs.
- `db/migrations/0007_v24_public_visits_staging.sql`: opt-in, aggregate-only public visits with bidirectional block checks.
- `lib/farm-social.ts`, `app/social-panel.tsx`: friend request UI and public profile visit.
- `tests/farm-social.test.ts`, `tests/farm-v2-release-safety.test.ts`: client validation and SQL static checks.

## Release acceptance (all required)
1. **PASS in disposable PostgreSQL 16**: apply 0004 then 0007 and verify SQL compiles and RPC grants. **Still required:** hosted Supabase staging parity.
2. **PASS in PostgreSQL integration fixture** for key RPC and permission scenarios. **Still required:** hosted Supabase browser/session testing with authenticated users A, B and C plus anon. B must have a public profile; A requests B; B accepts or declines. A cannot accept B's request. Repeated or conflicting transitions must fail.
3. A cannot request itself; hidden profiles cannot be requested or visited; either direction of block prevents requests and visits. Anonymous requests and visits fail.
4. A cannot SELECT another user's requests, INSERT/UPDATE/DELETE requests directly, or read private inventory/plots through the visit RPC.
5. Test concurrent duplicate requests, retries, logout/login and browser refresh. Verify no duplicate accepted friendship or leaked profile.
6. Confirm frontend feature flag `NEXT_PUBLIC_FARM_V2_FEATURES=enabled` only in an environment where migrations and RLS checks have passed.
7. Confirm all CI checks PASS and manually validate mobile UI and keyboard navigation.

## Release policy
Do not apply staging SQL to live Supabase or merge into `main` without all acceptance evidence. Existing player data and live V2.0 remain unchanged.
