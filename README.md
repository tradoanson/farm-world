# Farm World V0.3B — Offline Demo

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

## Next stage: V0.3
Design an isometric farm scene without changing save semantics. Multiplayer accounts require a separate backend with authorization, farm isolation, server-authoritative actions, transactions, idempotency and database migrations. GitHub Pages alone cannot host that backend.

## Safety
Never commit secrets or production DB credentials. No live database is connected and no destructive database operations are performed by the demo.

## Versioning and roadmap
- [CHANGELOG.md](CHANGELOG.md): append-only release notes for each version.
- [futurebaseline.md](futurebaseline.md): append-only future development baseline; never replace earlier sections.
- Mobile V0.2.1: farm shown before shop on small screens, horizontal seed selector, portrait/landscape breakpoints and larger touch controls. Real-device Safari/Chrome validation remains a manual acceptance step.

## V0.3B scene
- Isometric diamond-style farm via CSS, with original emoji/CSS scenery and a Classic view toggle.
- Both views operate on the same 64 saved plots; existing V0.1B/V0.2 data is unchanged.
- Pan, zoom, professional sprite art and real-device touch validation remain for V0.3B/V0.3C.

## V0.3B camera
- Drag one finger or mouse pointer to pan isometric farm. Pinch with two fingers or use zoom +/- buttons; Ctrl + mouse wheel also zooms. Reset camera via the home button.
- Zoom limited to 65–200%. Classic mode remains available. Existing saves and crop rules are unchanged.
- Mobile browser gesture testing on physical iOS/Android devices is still required for final UX sign-off.
