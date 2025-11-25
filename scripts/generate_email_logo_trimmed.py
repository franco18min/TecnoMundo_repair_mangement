#!/usr/bin/env python3
import sys
from pathlib import Path
from PIL import Image

def trim_alpha(img: Image.Image) -> Image.Image:
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

def main():
    root = Path(__file__).parent.parent
    src = root / 'frontend' / 'public' / 'logo.png'
    dst = root / 'frontend' / 'public' / 'email-logo-trimmed.png'
    if not src.exists():
        print(f"❌ No existe {src}")
        sys.exit(1)
    img = Image.open(src)
    img = trim_alpha(img)
    img.save(dst, format='PNG')
    print(f"✅ Guardado: {dst} ({dst.stat().st_size} bytes)")

if __name__ == '__main__':
    main()