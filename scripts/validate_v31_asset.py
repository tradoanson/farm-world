#!/usr/bin/env python3
"""Validate one independently rendered Farm World V3.1 asset. Requires Pillow."""
import argparse
import json
import sys
from pathlib import Path
from PIL import Image

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset-id", required=True)
    parser.add_argument("--manifest", default="assets/v3.1/manifest.json")
    args = parser.parse_args()
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    assets = manifest["assets"]
    matches = [a for a in assets if a["id"] == args.asset_id]
    if len(matches) != 1:
        sys.exit("FAIL: asset ID not found or duplicated")
    asset = matches[0]
    previous = [a for a in assets if a["order"] < asset["order"]]
    if previous and any(a["status"] != "approved" for a in previous):
        sys.exit("FAIL: previous asset(s) not approved; render strictly in order")
    path = Path(asset["path"])
    if not path.is_file():
        sys.exit(f"FAIL: missing independently rendered file: {path}")
    with Image.open(path) as source:
        if source.format != "PNG":
            sys.exit("FAIL: use lossless PNG with actual alpha; no JPG or flat scene")
        image = source.convert("RGBA")
    w, h = image.size
    if w < 128 or h < 128 or w > 4096 or h > 4096:
        sys.exit(f"FAIL: unsupported dimensions {w}x{h}")
    alpha = image.getchannel("A")
    min_alpha, max_alpha = alpha.getextrema()
    if min_alpha != 0 or max_alpha != 255:
        sys.exit("FAIL: need both fully transparent background and fully opaque foreground")
    bounds = alpha.getbbox()
    if bounds is None:
        sys.exit("FAIL: completely transparent asset")
    pad = max(4, round(min(w,h) * 0.04))
    if bounds[0] < pad or bounds[1] < pad or bounds[2] > w-pad or bounds[3] > h-pad:
        sys.exit(f"FAIL: object touches safe border ({pad}px); risk of clipping")
    corners = [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]
    if any(alpha.getpixel(p) != 0 for p in corners):
        sys.exit("FAIL: corners not transparent")
    print(f"PASS {asset['id']} {path} {w}x{h} alpha={min_alpha}..{max_alpha} bounds={bounds}")
    print("MANUAL GATES STILL REQUIRED: single object, perspective, no halo, layering/z-index, visible in web scene, mobile scale, no collisions.")
if __name__ == "__main__":
    main()
