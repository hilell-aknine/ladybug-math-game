"""
Generate all game assets using Pollinations.ai (free, no API key needed).
Images are generated via URL: https://image.pollinations.ai/prompt/{prompt}?width=X&height=X
"""
import urllib.request
import urllib.parse
import os
import time

BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, "assets", "images")

# Style prefix for consistency
STYLE = "chibi kawaii cartoon style, thick black outlines, flat bright colors, child-friendly, cute, digital illustration, white background, no text"
STYLE_BG = "chibi kawaii cartoon style, bright colors, child-friendly, digital illustration, wide angle, no text, no people"

# All images to generate
IMAGES = [
    # Characters (512x512)
    {
        "path": "characters/ladybug.png",
        "prompt": f"cute chibi Miraculous Ladybug character, girl in red suit with black polka dots, blue eyes, dark hair pigtails, waving, full body, {STYLE}",
        "w": 512, "h": 512
    },
    {
        "path": "characters/cat-noir.png",
        "prompt": f"cute chibi Cat Noir character from Miraculous, boy in black cat suit, green eyes, blond hair, playful pose, full body, {STYLE}",
        "w": 512, "h": 512
    },
    {
        "path": "characters/tikki.png",
        "prompt": f"cute tiny red kwami Tikki from Miraculous Ladybug, small floating red creature with big blue eyes, dark spot on forehead, adorable, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "characters/ladybug-celebrate.png",
        "prompt": f"cute chibi Miraculous Ladybug character jumping with joy, confetti and stars around, celebration pose, {STYLE}",
        "w": 512, "h": 512
    },

    # Backgrounds (1280x720)
    {
        "path": "backgrounds/welcome.png",
        "prompt": f"Paris skyline at sunset, Eiffel Tower, pink and orange sky, cute cartoon style, magical sparkles, {STYLE_BG}",
        "w": 1280, "h": 720
    },
    {
        "path": "backgrounds/bakery.png",
        "prompt": f"cute cartoon bakery interior, warm lighting, wooden counter, display case with pastries, pink walls, cozy French patisserie, {STYLE_BG}",
        "w": 1280, "h": 720
    },
    {
        "path": "backgrounds/shop.png",
        "prompt": f"cute cartoon magical toy shop interior, colorful shelves with items, warm cozy lighting, sparkles, fantasy store, {STYLE_BG}",
        "w": 1280, "h": 720
    },
    {
        "path": "backgrounds/exercise.png",
        "prompt": f"cute cartoon magical classroom, chalkboard, floating numbers and stars, pink and red decorations, ladybug theme, {STYLE_BG}",
        "w": 1280, "h": 720
    },
    {
        "path": "backgrounds/map.png",
        "prompt": f"cute cartoon Paris neighborhood top view, bakery building, park with trees, paths between buildings, sunny day, {STYLE_BG}",
        "w": 1280, "h": 720
    },

    # Shop items (256x256, transparent-ish)
    {
        "path": "items/oven.png",
        "prompt": f"cute cartoon kitchen oven, red vintage style, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/cake.png",
        "prompt": f"cute cartoon decorated birthday cake with strawberries, pink frosting, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/cookies.png",
        "prompt": f"cute cartoon plate of chocolate chip cookies, golden brown, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/mixer.png",
        "prompt": f"cute cartoon red stand mixer, kitchen appliance, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/table.png",
        "prompt": f"cute cartoon wooden round dining table, French style, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/chair.png",
        "prompt": f"cute cartoon wooden chair with red cushion, French bistro style, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/lamp.png",
        "prompt": f"cute cartoon floor lamp with pink shade, cozy lighting, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/flowers.png",
        "prompt": f"cute cartoon vase with colorful flowers, pink and red roses, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/painting.png",
        "prompt": f"cute cartoon framed painting of Eiffel Tower, golden frame, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/cushion.png",
        "prompt": f"cute cartoon red cushion with black polka dots ladybug pattern, heart shape, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/curtains.png",
        "prompt": f"cute cartoon red polka dot window curtains, French style, single object centered, {STYLE}",
        "w": 256, "h": 256
    },
    {
        "path": "items/rug.png",
        "prompt": f"cute cartoon circular red rug with ladybug pattern, cozy, single object centered, {STYLE}",
        "w": 256, "h": 256
    },

    # UI elements (128x128)
    {
        "path": "ui/coin.png",
        "prompt": f"cute cartoon golden coin with ladybug emblem, shiny, game UI element, single object centered, {STYLE}",
        "w": 128, "h": 128
    },
    {
        "path": "ui/star.png",
        "prompt": f"cute cartoon golden star, glowing, game achievement icon, single object centered, {STYLE}",
        "w": 128, "h": 128
    },
    {
        "path": "ui/heart.png",
        "prompt": f"cute cartoon red heart with ladybug spots, game life icon, single object centered, {STYLE}",
        "w": 128, "h": 128
    },
]

def download_image(prompt, filepath, width, height):
    """Download image from Pollinations.ai"""
    encoded = urllib.parse.quote(prompt)
    url = f"https://gen.pollinations.ai/image/{encoded}?width={width}&height={height}&seed={hash(prompt) % 10000}&nologo=true"

    full_path = os.path.join(ASSETS, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    if os.path.exists(full_path):
        print(f"  SKIP (exists): {filepath}")
        return True

    print(f"  Generating: {filepath} ({width}x{height})...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
            with open(full_path, "wb") as f:
                f.write(data)
        print(f"  OK: {filepath} ({len(data)//1024}KB)")
        return True
    except Exception as e:
        print(f"  ERROR: {filepath} - {e}")
        return False

def main():
    print(f"=== Ladybug Math Game - Asset Generator ===")
    print(f"Using Pollinations.ai (free, no API key)")
    print(f"Total images: {len(IMAGES)}")
    print(f"Output: {ASSETS}")
    print()

    success = 0
    failed = 0

    for i, img in enumerate(IMAGES):
        print(f"[{i+1}/{len(IMAGES)}] {img['path']}")
        if download_image(img["prompt"], img["path"], img["w"], img["h"]):
            success += 1
        else:
            failed += 1
        # Small delay to be polite to the API
        time.sleep(2)

    print(f"\n=== Done! ===")
    print(f"Success: {success}, Failed: {failed}")
    print(f"Images saved to: {ASSETS}")

if __name__ == "__main__":
    main()
