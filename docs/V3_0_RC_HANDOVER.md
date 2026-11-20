# V3.0 RC implementation and unresolved release gates

Branch: `feature/v3-0-foundation-graphics`. Status: **PARTIAL IMPLEMENTATION / NOT ACCEPTED / NOT RELEASED**.

Implemented:
- Pure `lib/farm-render-adapter.ts` for 64 existing plots, growth stages, ripe counts and next harvest time; server snapshot stays authoritative.
- Existing isometric renderer consumes adapter growth states; mobile camera and classic view retained.
- CSS visual stage polish and reduced-motion support.
- `package.json` version `3.0.0-rc.1`, page version label and adapter regression tests.
- No schema changes, no new economic RPC, no destructive operations on production.

Not implemented / release blockers:
- Isolated two-user Marketplace trade and concurrent buy/cancel E2E: UNRESOLVED.
- SECURITY DEFINER RPC authorization review and fixes: UNRESOLVED.
- Verified backup and isolated restore drill: UNRESOLVED.
- Mobile Safari/Chrome smoke and measured FPS, p95 load: UNRESOLVED.
- Original art asset provenance audit and renderer architecture separation beyond the pure adapter: PARTIAL.
- Husbandry and processing server interfaces/migration designs: UNRESOLVED.

Do not merge RC into `main` or deploy to Pages under the V3 roadmap until critical gates are verified. CI PASS alone is insufficient. This file is the handover of actual work and remaining acceptance evidence, not a declaration of V3.0 completion.
