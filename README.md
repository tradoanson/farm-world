# Farm World V0.6 — Offline Demo

Play: https://tradoanson.github.io/farm-world/

## Features
- 8×8 farm, five crop types, coins, time-based growing and harvesting.
- Automatic browser localStorage persistence using the existing V0.1B save key (existing progress is preserved).
- Plant available plots and harvest all ready crops in one action.
- Export/import a JSON backup with validation and overwrite confirmation.
- Reset with confirmation. Responsive mobile layout.

## Limits
This is an offline single-browser prototype, **not** a multi-account online game. Browser storage can be cleared; export a backup. The device clock controls crop readiness and is not tamper-resistant. No database, authentication, server-side economy, multiplayer synchronization or real-money transactions are active. Do not treat browser saves as secure authoritative data.

## Developer commands
Node.js 22+:

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

GitHub Actions runs CI and a separate static GitHub Pages deployment. Pages workflow temporarily excludes `app/api` **in the build runner only** and sets `FARM_WORLD_STATIC_EXPORT=true`. API source files remain in the repository for future backend work.

## Next stage: V0.6
Implement real authentication, per-farm isolation and server-authoritative transactions with a suitable backend. V0.5 includes the security contract and design, not a live login. Multiplayer accounts require a separate backend with authorization, farm isolation, server-authoritative actions, transactions, idempotency and database migrations. GitHub Pages alone cannot host that backend.

## Safety
Never commit secrets or production DB credentials. No live database is connected and no destructive database operations are performed by the demo.

## Versioning and roadmap
- [CHANGELOG.md](CHANGELOG.md): append-only release notes for each version.
- [futurebaseline.md](futurebaseline.md): append-only future development baseline; never replace earlier sections.
- Mobile V0.2.1: farm shown before shop on small screens, horizontal seed selector, portrait/landscape breakpoints and larger touch controls. Real-device Safari/Chrome validation remains a manual acceptance step.

## V0.4 scene
- Isometric diamond-style farm via CSS, with original emoji/CSS scenery and a Classic view toggle.
- Both views operate on the same 64 saved plots; existing V0.1B/V0.2 data is unchanged.
- Pan, zoom, professional sprite art and real-device touch validation remain for V0.4/V0.4.

## V0.4 camera
- Drag one finger or mouse pointer to pan isometric farm. Pinch with two fingers or use zoom +/- buttons; Ctrl + mouse wheel also zooms. Reset camera via the home button.
- Zoom limited to 65–200%. Classic mode remains available. Existing saves and crop rules are unchanged.
- Mobile browser gesture testing on physical iOS/Android devices is still required for final UX sign-off.

## V0.4 release
- Added camera regression tests, safer drag/pinch click handling, improved keyboard focus and narrow-screen layout.
- Preserve save version 1 and localStorage key. Physical iOS Safari and Android Chrome acceptance remains manual.

## V0.4 economy
- Harvested crops enter inventory; sell stock for 3× seed price. Earn XP and levels and claim three one-time quest rewards.
- Legacy farm data stays in the original V1 localStorage key. Progression is stored separately as V2; V2 backup exports both and imports V1 backups.
- No online accounts or secure server-side economy yet. Physical mobile testing remains manual.

## V0.5 account foundation
- Offline guest mode explicitly shown in UI; no mock passwords or insecure browser-based login.
- Pure authorization contract and tests in `lib/farm-authorization.ts` and `tests/farm-authorization.test.ts`.
- Backend architecture, database model and rollout gates: [V0.5 account architecture](docs/V0.5_ACCOUNT_ARCHITECTURE.md).
- No user accounts or online synchronization are operational yet.

## V0.6 backend foundation
- Additive staging PostgreSQL schema and owner-scoped read API (not deployed to GitHub Pages).
- No live login or cloud synchronization. Snapshot writes disabled (501) until server-authoritative economy is ready.
- See [backend handoff](docs/V0.6_BACKEND_HANDOFF.md).

## V0.7 account pilot
- Optional Supabase email magic-link login, logout, and read-only own-farm lookup. Without public Supabase config the game stays offline.
- Staging RLS migration and setup: [V0.7 handoff](docs/V0.7_HANDOFF.md). No cloud gameplay sync or authoritative writes yet.
