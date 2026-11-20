# Farm World V2.1 — Security and stability audit

## Baseline
- V2.0 commit `1f59c478`: CI and GitHub Pages PASS before V2.1 changes.
- Supabase production snapshot at audit: 1 farm, 64 plots, 469 recorded commands, 0 upgrade commands, 0 public profiles.
- Production farm data **must not** be reset or used for destructive tests.

## Findings
1. **High: pending command separation** — Farm RPC and upgrade RPC use separate pending stores. V2.1 blocks normal farm operations while an upgrade is unresolved, and vice versa. Existing same-request-ID retry behavior remains.
2. **Medium: stale snapshots** — Frontend refreshes every 30 seconds and on focus. Cross-device concurrent command tests are required. The server remains authoritative.
3. **Medium: privileged RPC** — `farm_create`, `farm_apply_command`, `farm_upgrade`, `farm_leaderboard` are SECURITY DEFINER functions exposed to authenticated users. These are intended RPC endpoints; audit owner checks, argument validation, fixed search_path, grants and execution under two distinct authenticated identities. A linter warning is not itself proof of exploitability.
4. **Medium: upgrade semantics** — Building levels are stored server-side but warehouse capacity and expansion effects have not been implemented. Do not describe these as functional upgrades yet.
5. **Low: password leak protection** — Supabase advisor warns it is disabled; assess relevance to OTP login and any password auth before changing settings.
6. **Low: command tables have RLS but no SELECT policies** — This is intentional: client has no direct access to command journals; do not open read/write access to silence the advisor.

## Mandatory gates for V2.1 Stable
- [ ] Typecheck, lint, unit tests and production build PASS.
- [ ] Cross-account authorization: A cannot read or mutate B's farm.
- [ ] Idempotency: same request ID does not double-charge/double-reward.
- [ ] Lost response: retry same request ID recovers without duplicate mutation.
- [ ] Concurrent requests from two devices preserve money, inventory, revision.
- [ ] Pending upgrade blocks other actions and vice versa.
- [ ] Existing production farm counts and state preserved.
- [ ] GitHub Pages deploy PASS and manual mobile smoke test.

## Release rule
Do not tag V2.1 Stable or deploy a release label unless every mandatory gate has evidence. Preserve current online-only architecture and do not introduce offline writes.
