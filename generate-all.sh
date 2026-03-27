#!/bin/bash
# Generate all game images using nano-banana-poster (Gemini)
# Runs with 60s delay between each to avoid rate limits

SKILL_DIR="$HOME/.claude/skills/nano-banana-poster/scripts"
OUT_DIR="$(dirname "$0")/assets/images"

cd "$SKILL_DIR" || exit 1

generate() {
    local subdir="$1"
    local filename="$2"
    local aspect="$3"
    local prompt="$4"
    local dest="$OUT_DIR/$subdir/$filename"

    if [ -f "$dest" ]; then
        echo "SKIP: $dest (exists)"
        return
    fi

    echo "==> Generating: $subdir/$filename"
    npx ts-node generate_poster.ts --aspect "$aspect" "$prompt" 2>/dev/null

    # Move the generated poster_0.jpg to destination
    if [ -f "poster_0.jpg" ]; then
        mkdir -p "$OUT_DIR/$subdir"
        mv "poster_0.jpg" "$dest"
        echo "  OK: $dest"
    else
        echo "  FAIL: $subdir/$filename"
    fi
    # Clean up any other outputs
    rm -f poster_*.jpg 2>/dev/null

    echo "  Waiting 60s for rate limit..."
    sleep 60
}

echo "=== Ladybug Math Game - Image Generator ==="
echo "Using Google Gemini via nano-banana-poster"
echo "Output: $OUT_DIR"
echo ""

# Characters
generate "characters" "ladybug.png" "1:1" \
    "Cute chibi girl superhero in red suit with black polka dots, blue eyes, dark hair in pigtails with red ribbons, waving happily, full body, kawaii cartoon style, thick outlines, flat bright colors, child-friendly, clean white background"

generate "characters" "cat-noir.png" "1:1" \
    "Cute chibi boy superhero in black cat suit, green glowing eyes, messy blond hair, cat ears, playful pose, full body, kawaii cartoon style, thick outlines, flat bright colors, child-friendly, clean white background"

generate "characters" "tikki.png" "1:1" \
    "Tiny cute red floating creature, round body, big blue eyes, small dark spot on forehead, tiny arms, very kawaii, magical fairy pet, chibi style, thick outlines, clean white background"

generate "characters" "ladybug-celebrate.png" "1:1" \
    "Cute chibi girl superhero in red polka dot suit jumping with joy, arms up, confetti and golden stars around her, celebration pose, kawaii style, thick outlines, bright colors, white background"

# Backgrounds
generate "backgrounds" "welcome.png" "16:9" \
    "Paris skyline at sunset, Eiffel Tower silhouette, pink and orange gradient sky, cute cartoon style, magical sparkles in the sky, wide panoramic view"

generate "backgrounds" "bakery.png" "16:9" \
    "Inside a cute French bakery, warm golden lighting, wooden counter with pastries and cakes, pink walls, checkered floor, cozy cartoon style, wide view, no people"

generate "backgrounds" "shop.png" "16:9" \
    "Magical toy and furniture shop interior, colorful shelves with cute items, warm fairy lights, sparkles, fantasy store, cartoon style, wide view, no people"

generate "backgrounds" "map.png" "16:9" \
    "Cute cartoon Paris neighborhood bird eye view, small bakery building with red roof, green park with trees, stone paths, sunny day, kawaii style, no people"

# Shop items (most important 6)
generate "items" "cake.png" "1:1" \
    "Cute cartoon birthday cake with pink frosting and strawberry on top, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "oven.png" "1:1" \
    "Cute cartoon red vintage kitchen oven, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "cookies.png" "1:1" \
    "Cute cartoon plate of chocolate chip cookies, golden brown, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "flowers.png" "1:1" \
    "Cute cartoon glass vase with colorful roses and flowers, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "table.png" "1:1" \
    "Cute cartoon round wooden dining table, French bistro style, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "painting.png" "1:1" \
    "Cute cartoon framed painting of Eiffel Tower at sunset, golden ornate frame, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "cushion.png" "1:1" \
    "Cute cartoon heart-shaped red cushion with black polka dots like a ladybug, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "lamp.png" "1:1" \
    "Cute cartoon pink floor lamp with warm glow, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "mixer.png" "1:1" \
    "Cute cartoon red kitchen stand mixer, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "chair.png" "1:1" \
    "Cute cartoon wooden chair with red cushion, French cafe style, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "curtains.png" "1:1" \
    "Cute cartoon window with red polka dot curtains tied with bows, single object centered, kawaii style, thick outlines, white background, no text"

generate "items" "rug.png" "1:1" \
    "Cute cartoon circular red rug with ladybug pattern and dots, single object centered, kawaii style, thick outlines, white background, no text"

echo ""
echo "=== ALL DONE ==="
echo "Images saved to: $OUT_DIR"
