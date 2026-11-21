# BLD 07–10 repair batch — 2026-11-21

Four previously fully opaque building assets were regenerated and background-separated, exported as individual 512x512 RGBA PNGs with transparent margin (bounding boxes approx x=41..471).

- BLD-07-workshop.png: https://drive.google.com/file/d/1WKik5BtCVDiGy7VlGHD5jb8oMV-ADMdZ/view
- BLD-08-shop.png: https://drive.google.com/file/d/1m2VUHhAot0hth-5yRrj9rcT5Bnr0uZgJ/view
- BLD-09-farm-market.png: https://drive.google.com/file/d/1SIH11GCTYS34nXur92Jxf48R-ytPTq0H/view
- BLD-10-farm-sign.png: https://drive.google.com/file/d/1CGbDFoEQ96ptuLoB3mO7QtByiu_-wYgI/view

Automated checks passed: image dimensions, non-opaque alpha channel, transparent margins. Manual visual inspection of a four-image montage showed plausible silhouettes; fine edge inspection remains required.

**Not yet integrated into GitHub game.** Other semantic mismatches against canonical manifest remain blocked; do not merge the whole 127 set.
