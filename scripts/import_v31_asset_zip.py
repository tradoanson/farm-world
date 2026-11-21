#!/usr/bin/env python3
"""Fail-closed import of the Farm World V3.1 asset archive.

Usage: python scripts/import_v31_asset_zip.py /path/to/127-assets.zip
Run from repository root. Does not modify Supabase or application code.
"""
import io
import json
import pathlib
import sys
import zipfile
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets/v3.1/manifest.json"


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import_v31_asset_zip.py ASSETS.zip")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected = {a["path"] for a in manifest["assets"]}
    if len(expected) != 127:
        raise SystemExit("Manifest must contain exactly 127 unique paths")
    with zipfile.ZipFile(sys.argv[1]) as archive:
        names = archive.namelist()
        if len(names) != 127 or len(set(names)) != 127 or set(names) != expected:
            missing = sorted(expected - set(names))
            extra = sorted(set(names) - expected)
            raise SystemExit(f"Archive manifest mismatch: missing={missing}; extra={extra}")
        verified = {}
        for name in names:
            info = archive.getinfo(name)
            if info.file_size > 12_000_000:
                raise SystemExit(f"Oversize file: {name}")
            data = archive.read(name)
            with Image.open(io.BytesIO(data)) as im:
                im.load()
                if im.size != (512, 512) or im.mode != "RGBA":
                    raise SystemExit(f"Bad PNG dimensions/mode: {name}")
                alpha = im.getchannel("A")
                box = alpha.getbbox()
                if not box or min(box[0], box[1], 512-box[2], 512-box[3]) < 40:
                    raise SystemExit(f"Bad transparency/padding: {name}")
            verified[name] = data
    for name, data in verified.items():
        dest = ROOT / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    print(f"PASS: imported {len(verified)} validated PNG files")


if __name__ == "__main__":
    main()
