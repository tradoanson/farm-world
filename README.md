# Farm World V0.1A

Next.js prototype of a farming webgame. This is NOT the production multiplayer game.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` before deployment.

## Current functionality
- Responsive farming UI with an 8x8 demonstration grid
- Plant, wait, harvest, prototype coins and seed selection
- `/api/health` health endpoint
- Drizzle schema draft for users, farms, crop catalog, farm tiles, inventory and action idempotency
- CI checks for GitHub

## Not implemented yet (V0.1B)
- User authentication and persistent sessions
- PostgreSQL connection and migrations
- Server-authoritative game actions and anti-cheat
- Farm isolation, durable save, backups, production monitoring
- Phaser isometric scene (the prototype uses a CSS grid)

The prototype keeps all gameplay state in React memory and **loses progress on reload**. Never use it as a live multiplayer service.

## Deploy
1. Create a new empty GitHub repository `farm-world` (private recommended).
2. Upload the contents of this project to its root, including `.github/workflows/ci.yml`.
3. Import the repository into Vercel; framework should detect Next.js.
4. Deploy the preview. `/api/health` should return status `ok`.
5. Do not connect production PostgreSQL until migrations and access controls are implemented and tested.

## Safety
No credentials are included. Production DB reset/seed is prohibited. PR review and passing CI are required before release.
