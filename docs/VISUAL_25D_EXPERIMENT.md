# Farm World — 2.5D visual experiment

**Branch:** `experiment/farm-25d-visual`. **Status:** visual prototype, not production.

## Direction
Use the clear planting/harvest affordances of classic social farming games together with the layered landscape of modern 2.5D farms. No copied game sprites, trademarks, screenshots or proprietary assets.

## Prototype delivered
- Bright grass, soil furrows, golden ripe crop highlights, raised tile edges, decorative house/trees and clearer focus rings.
- Retains the 8 × 8 tile grid and the existing camera zoom/pan; users can switch to classic 2D.
- CSS-only presentation: no changes to farm RPCs, Supabase schema, inventory, crop timers, state revision, V2.5 realtime or user data.
- Mobile and reduced-motion overrides.

## Visual QA before acceptance
1. Desktop 1440px, tablet 768px, mobile 390px and 320px: no clipped plots or overlapping controls.
2. Tap all 64 tiles, drag and pinch; confirm correct tile index, no accidental planting after drag.
3. Verify ripe, growing, empty and locked plot states, focus keyboard navigation and contrast.
4. Run Lighthouse and compare CSS paint cost with baseline.
5. Run CI on this branch and collect screenshots with test accounts.

**Not authorized:** merging this experiment to main, changing live data, or deploying it to GitHub Pages without approval.
