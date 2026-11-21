# Farm World V3.1 — Asset acceptance audit (2026-11-21)

Status: **BLOCKED — do not merge rendered assets to main**.

## Local image inspection
- 127 PNG files located across ENV 12, BLD 10, CROP 18, ANI 21, PEN 12, UI 20, ICO 22, FX 12.
- 4/127 images have fully opaque alpha (BLD-07, BLD-08, BLD-09, BLD-10); transparency requirement fails.
- 82/127 images have less than 4% transparent margin on at least one side (using alpha >8 threshold).
- 96/127 images do not use 512x512 dimensions (manifest policy says 512x512).
- No automated visual-edge or semantic review has been passed; alpha min/max alone is not sufficient.

## Manifest semantic mismatch — critical
The current manifest does **not** describe the same 127 images rendered in the preceding batch. Examples:
- CROP-01 manifest: soil-empty; rendered: rice.
- CROP-02 manifest: soil-seeded; rendered: corn.
- ANI-01 manifest: chicken-idle; rendered: rooster.
- ANI-02 manifest: chicken-walk; rendered: hen.
- PEN-01 manifest: fence-horizontal; rendered: chicken pen.
- BLD-02 manifest: front-steps; rendered file name farmhouse-doorstep (needs manual semantic confirmation).

Do not rename mismatched files as a substitute for creating the correct visuals. Do not set status approved or integrate in the live game until the manifest and assets agree and quality checks pass.

## Next actions
1. Confirm whether existing V3.1 manifest is canonical. Keep it canonical unless product owner explicitly approves a redesign.
2. Re-render missing crop growth stages, animal action states, and fence pieces according to exact IDs.
3. Fix BLD-07..10 transparency; re-render where alpha matting cannot be cleaned safely.
4. Normalize dimensions and safe padding without distorting aspect ratio.
5. Run Pillow-based automated checks plus manual visual review; only then create integration PR, pass CI and merge.

This is an audit report only; **no PNGs have been committed by this PR**.
