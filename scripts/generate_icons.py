"""Generate PWA icons from a simple rendered glyph.

Produces public/icons/icon-192.png, icon-512.png, icon-512-maskable.png,
and apple-touch-icon.png.

Run: python scripts/generate_icons.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

BASE = "#1a0a0a"
ACCENT = "#c41e3a"
CREAM = "#fef3e8"


def find_font() -> str | None:
    candidates = [
        "C:/Windows/Fonts/georgia.ttf",
        "C:/Windows/Fonts/Georgiab.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for c in candidates:
        if Path(c).exists():
            return c
    return None


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if maskable:
        bg_box = (0, 0, size, size)
        radius = 0
    else:
        pad = size // 12
        bg_box = (pad, pad, size - pad, size - pad)
        radius = size // 8

    draw.rounded_rectangle(bg_box, radius=radius, fill=BASE)

    font_path = find_font()
    glyph_size = int(size * 0.45)
    font = ImageFont.truetype(font_path, glyph_size) if font_path else ImageFont.load_default()

    text = "\u5B66"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1] - size * 0.03
    draw.text((x, y), text, fill=ACCENT, font=font)

    if not maskable:
        small = int(size * 0.11)
        sfont = ImageFont.truetype(font_path, small) if font_path else ImageFont.load_default()
        draw.text((size - pad - small * 2, size - pad - small * 1.5), "CN", fill=CREAM, font=sfont)

    return img


def main() -> None:
    for w, name, mask in [
        (192, "icon-192.png", False),
        (512, "icon-512.png", False),
        (512, "icon-512-maskable.png", True),
        (180, "apple-touch-icon.png", False),
    ]:
        img = make_icon(w, maskable=mask)
        out = OUT / name
        img.save(out, "PNG")
        print(f"wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
