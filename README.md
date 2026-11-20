# Farm World V0.2 — Offline Demo

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
