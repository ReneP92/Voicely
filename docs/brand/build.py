# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools==4.60.1", "pillow==12.0.0"]
# ///
"""Rebuild brand exports from the checked-in mark, palette and licensed Geist font.

Run: uv run --script docs/brand/build.py
Requires Bun dependencies and Playwright Chromium from the workspace.
"""

from pathlib import Path
import hashlib
import json
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from PIL import Image

ROOT = Path(__file__).resolve().parent
TOKENS = dict(re.findall(r"--voicely-color-([\w-]+):\s*(#[0-9a-f]+)", (ROOT / "tokens.css").read_text()))
INK, WHITE, CANVAS = (TOKENS[x] for x in ("ink", "surface", "canvas"))
STONE, LAVENDER, ORANGE = (TOKENS[x] for x in ("stone", "lavender", "orange"))
MARK = ET.parse(ROOT / "source/mark.svg").find("{http://www.w3.org/2000/svg}path").attrib["d"]
FONT = TTFont(ROOT / "fonts/Geist.ttf")
FONTS = {}

# Verify the vendored upstream font, including licensing provenance, before outlining.
font_data = (ROOT / "fonts/Geist.ttf").read_bytes()
assert hashlib.sha1(f"blob {len(font_data)}\0".encode() + font_data).hexdigest() == "f63f0afc6390323715972b6645115485f37cc9f4", "Font differs from the documented upstream blob"


def luminance(color):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [n / 12.92 if n <= 0.04045 else ((n + 0.055) / 1.055) ** 2.4 for n in channels]
    return sum(n * weight for n, weight in zip(linear, (0.2126, 0.7152, 0.0722)))


for foreground, background, threshold in (
    ("ink", "canvas", 4.5), ("surface", "ink", 4.5),
    ("muted", "surface", 4.5), ("muted", "canvas", 4.5),
    ("ink", "lavender", 4.5), ("surface", "orange", 4.5),
    ("control-border", "surface", 3), ("control-border", "canvas", 3),
    ("error", "error-surface", 4.5), ("success", "success-surface", 4.5),
    ("warning", "warning-surface", 4.5),
):
    light, dark = sorted((luminance(TOKENS[foreground]), luminance(TOKENS[background])), reverse=True)
    contrast = (light + 0.05) / (dark + 0.05)
    assert contrast >= threshold, f"{foreground}/{background}: {contrast:.2f}:1 fails {threshold}:1"
    print(f"{foreground}/{background}: {contrast:.2f}:1")


def text(value, x, y, size, weight=400, color=INK, tracking=0):
    """Outline simple English display text; interface text remains live in HTML."""
    if weight not in FONTS:
        FONTS[weight] = instantiateVariableFont(FONT, {"wght": weight}, inplace=False)
    font = FONTS[weight]
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    pen = SVGPathPen(glyphs)
    for char in value:
        name = cmap[ord(char)]
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, y)))
        x += glyphs[name].width * scale + tracking
    return f'<path fill="{color}" d="{pen.getCommands()}"/>', x


def mark(x, y, size, color=INK):
    return f'<path fill="{color}" transform="translate({x} {y}) scale({size / 100})" d="{MARK}"/>'


def rect(x, y, w, h, fill, radius=0, stroke="none"):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>'


def svg(w, h, body, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n'


def lockup(x, y, scale=1, color=INK, signature=False):
    word, end = text("voicely", 116, 83, 100, 700, color, -3)
    body = mark(0, 0, 100, color) + word
    if signature:
        body += rect(end + 17, 72, 10, 10, ORANGE)
    return f'<g transform="translate({x} {y}) scale({scale})">{body}</g>'


def save(name, width, height, body, title):
    (ROOT / name).write_text(svg(width, height, body, title))


save("voicely-logo-light.svg", 480, 112, lockup(8, 6), "Voicely")
save("voicely-logo-dark.svg", 480, 112, lockup(8, 6, color=WHITE), "Voicely")
save("voicely-logo-signature.svg", 508, 112, lockup(8, 6, signature=True), "Voicely")
save("voicely-mark.svg", 100, 100, mark(0, 0, 100), "Voicely")
save("voicely-mark-dark.svg", 100, 100, mark(0, 0, 100, WHITE), "Voicely")
save("voicely-app-icon.svg", 1024, 1024, rect(0, 0, 1024, 1024, INK) + mark(192, 172, 640, WHITE), "Voicely app icon")
save("favicon.svg", 100, 100, rect(0, 0, 100, 100, INK, 20) + mark(12, 10, 76, WHITE), "Voicely")

# Social artwork is intentionally typographic, not a fabricated product screenshot.
social = rect(0, 0, 1200, 630, CANVAS)
social += lockup(70, 50, 0.65, signature=True)
social += rect(72, 160, 1056, 1, STONE)
social += text("Good answers.", 72, 292, 76, 600, tracking=-2.5)[0]
social += text("Better shopping.", 72, 376, 76, 600, tracking=-2.5)[0]
social += text("AI sales & support for your store.", 75, 444, 27, color=TOKENS["muted"])[0]
social += rect(72, 534, 154, 38, LAVENDER, 6)
social += text("Made for commerce", 86, 559, 14, 500)[0]
social += text("voicely", 1020, 558, 24, 600)[0]
save("voicely-social.svg", 1200, 630, social, "Voicely. Good answers. Better shopping. AI sales and support for your store.")

# Flat, outlined editorial hero with clearly labeled illustrative conversation.
hero = rect(0, 0, 1600, 900, CANVAS)
hero += lockup(88, 66, 0.65, signature=True)
hero += text("Good answers.", 88, 360, 78, 600, tracking=-2.5)[0]
hero += text("Better shopping.", 88, 450, 78, 600, tracking=-2.5)[0]
hero += text("AI sales & support for your store.", 92, 516, 28, color=TOKENS["muted"])[0]
hero += rect(92, 574, 180, 54, INK, 6)
hero += text("Meet voicely", 119, 609, 21, 500, WHITE)[0]
hero += rect(930, 160, 574, 608, WHITE, 12, STONE)
hero += mark(960, 186, 38)
hero += text("Shopping assistant", 1010, 214, 22, 600)[0]
hero += rect(930, 244, 574, 1, STONE)
hero += rect(1000, 280, 474, 62, CANVAS, 8)
hero += text("Which jacket works for rainy hikes?", 1018, 318, 22)[0]
hero += text("The Rainline Shell is lightweight", 960, 402, 24)[0]
hero += text("and made for wet weather.", 960, 436, 24)[0]
hero += rect(960, 474, 514, 146, CANVAS, 8, STONE)
hero += text("Rainline Shell", 984, 518, 26, 600)[0]
hero += text("Waterproof / Lightweight", 984, 554, 20, color=TOKENS["muted"])[0]
hero += text("View product details", 984, 592, 18, 500)[0]
hero += rect(960, 674, 514, 58, WHITE, 6, TOKENS["control-border"])
hero += text("Ask a question...", 980, 710, 20, color=TOKENS["muted"])[0]
hero += text("Illustrative conversation / synthetic product", 960, 810, 16, color=TOKENS["muted"])[0]
save("voicely-hero.svg", 1600, 900, hero, "Voicely brand illustration with a synthetic shopping conversation")

jobs = [
    ("voicely-logo-light.svg", "voicely-logo-light.png", 1920, 448),
    ("voicely-logo-light.svg", "voicely-logo.png", 1920, 448),
    ("voicely-logo-dark.svg", "voicely-logo-dark.png", 1920, 448),
    ("voicely-mark.svg", "voicely-mark.png", 512, 512),
    ("voicely-app-icon.svg", "voicely-app-icon.png", 1024, 1024),
    ("voicely-app-icon.svg", "apple-touch-icon.png", 180, 180),
    ("favicon.svg", "favicon-32.png", 32, 32),
    ("favicon.svg", "favicon-256.png", 256, 256),
    ("voicely-social.svg", "voicely-social.png", 1200, 630),
    ("voicely-social.svg", "voicely-og.png", 1200, 630),
    ("voicely-hero.svg", "voicely-hero.png", 1600, 900),
]
with tempfile.TemporaryDirectory(prefix="voicely-brand-") as temp:
    manifest = Path(temp) / "render.json"
    manifest.write_text(json.dumps([dict(zip(("source", "destination", "width", "height"), job)) for job in jobs]))
    subprocess.run(["bun", str(ROOT / "render.ts"), str(manifest)], check=True, cwd=ROOT.parent.parent)

for stem in ("voicely-social", "voicely-hero"):
    with Image.open(ROOT / f"{stem}.png") as image:
        image.convert("RGB").save(ROOT / f"{stem}.webp", "WEBP", quality=90, method=6)

# Downsample the vector-rendered 256px favicon for matching PNG-backed ICO entries.
with Image.open(ROOT / "favicon-256.png") as master:
    sizes = (16, 32, 48, 64, 128, 256)
    master.save(ROOT / "favicon.ico", format="ICO", sizes=[(n, n) for n in sizes])

# A deterministic handoff archive includes sources, font license and rebuild tools.
# Concepts are deliberately excluded; the preview and current vectors are authoritative.
files = [p for p in ROOT.rglob("*") if p.is_file() and p.suffix != ".zip" and "concepts" not in p.relative_to(ROOT).parts and not any(part.startswith(".") or part == "__pycache__" for part in p.relative_to(ROOT).parts)]
with ZipFile(ROOT / "voicely-brand-kit.zip", "w", ZIP_DEFLATED) as archive:
    for path in sorted(files):
        info = ZipInfo(str(path.relative_to(ROOT)), date_time=(2026, 11, 8, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, path.read_bytes())
print(f"Exported {len(jobs)} PNGs, SVG masters, WebP, ICO and brand-kit ZIP.")
