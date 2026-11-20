# Farm World V2.5 — Original illustrated 2.5D graphics handover

**Branch:** `experiment/farm-25d-visual`. **Release status:** isolated preview candidate; not merged or deployed.

## Actual assets integrated
- `public/art/farm-landscape.svg`: original farm illustration with house, barn, trees, fence, grass and sky.
- `public/art/crop-0.svg` through `crop-4.svg`: original wheat, corn, carrot, tomato and strawberry illustrations.
- Ripe plots render SVG sprites instead of emojis; growing crops retain recognizable seedlings. Existing 8×8 click targets, plot IDs, timers and disabled states remain.
- Board now uses a slightly tilted perspective garden rather than the old 45-degree diamond grid.
- Classic view remains available, and no third-party game assets are copied.
- Artwork uses relative static asset paths so GitHub Pages `/farm-world/` export can load it.

## Functional boundaries
No changes to V2.5 command processing, Realtime subscription, idempotency, Supabase schema, auth, inventory, economy or production. All work is isolated to the experiment branch.

## Acceptance gates
1. GitHub Actions lint/typecheck/test/build PASS at the final commit.
2. Confirm a real preview serves all six SVG assets (no 404), on mobile and desktop.
3. Verify tap-to-plant/harvest on every plot, drag/pinch, keyboard focus and classic-mode switch.
4. Verify five ripe crop illustrations and growing/locked states at 320, 390, 768 and 1440px.
5. Test realtime on hosted staging separately; CI does not prove hosted Supabase E2E.
6. User visually approves screenshot/browser preview before merge or production deployment.

**Do not treat green CI as visual acceptance or live release.**
