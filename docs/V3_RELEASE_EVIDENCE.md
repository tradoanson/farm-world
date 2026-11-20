# Farm World V3 — Release evidence register

| Version | Implementation | CI | Deploy | Security | Isolated E2E | Restore | Mobile | Decision |
|---|---|---|---|---|---|---|---|---|
| V3.0 RC1 | PARTIAL: render adapter, crop stages, camera retained | PASS [main run 44744565347](https://github.com/tradoanson/farm-world/actions/runs/44744565347) | PASS [Pages run 44744562999](https://github.com/tradoanson/farm-world/actions/runs/44744562999) | PARTIAL read-only SQL audit | UNRESOLVED | UNRESOLVED | UNRESOLVED | LIVE RC, NOT STABLE |
| V3.0 foundation completion | Production design contracts and tests, security audit evidence | PENDING | PENDING | PARTIAL | UNRESOLVED | UNRESOLVED | UNRESOLVED | NOT STABLE |
| V3.1–V3.9 | NOT STARTED | UNRESOLVED | UNRESOLVED | UNRESOLVED | UNRESOLVED | UNRESOLVED | UNRESOLVED | NOT RELEASED |

## Read-only Supabase audit (2026-11-20)
Project `nnhcxdxtbjqmwvhzunyc`. Inspected nine public `farm_%` functions via `pg_proc` and `has_function_privilege`:
- All nine are SECURITY DEFINER with `search_path` configured; `anon` EXECUTE = false; `authenticated` EXECUTE = true.
- All nine definitions reference `auth.uid()`. Eight reference the literal `owner_id`; `farm_market_cancel` does not, so ownership/authorization requires manual function-body review (the absence of that literal is not proof of vulnerability).
- `farm_apply_command`, `farm_market_buy`, `farm_market_cancel`, `farm_market_list`, `farm_upgrade` contain row locks; static presence is not concurrency proof.
- These are static/read-only findings, NOT a security PASS. Manual authorization inspection, isolated multi-user negative tests and concurrency E2E remain UNRESOLVED.

## Release policy
UI-only additive changes may ship as RC after CI PASS and main Pages PASS. Any new animal/production economy logic, SQL migration or privileged RPC must pass isolated security, transactional and recovery gates before production rollout. Stable requires all mandatory gates. Never mark PASS without evidence.

## Missing evidence
- Isolated two-user buy/cancel, replay, wrong-owner and inventory conservation
- Backup verification and isolated restore rehearsal
- Mobile Safari/Android Chrome touch/camera smoke, measured FPS and p95 load
- Renderer/asset provenance review
- V3.0 complete functional acceptance
