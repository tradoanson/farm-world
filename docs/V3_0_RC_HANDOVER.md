# V3.0 RC implementation and unresolved release gates

Branch: `feature/v3-0-foundation-graphics`. Status: **PARTIAL IMPLEMENTATION / RELEASE CANDIDATE FOR LIVE UI DEPLOYMENT / NOT STABLE**.

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

Approved deployment policy: this UI-only RC may merge to `main` and deploy to the primary GitHub Pages game after CI PASS because it does not change database, RPC, or economic logic. All manual gates remain UNRESOLVED; do not label V3.0 Stable or claim full acceptance. If regressions appear, revert the UI commit and redeploy. Future economic or database changes require isolated security, concurrency and restore verification before live release.
