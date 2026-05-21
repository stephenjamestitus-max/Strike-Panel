# /bulk-creative — Bulk Creative Generator

## Usage
```
/bulk-creative --brief="Collagen supplement, 30% off, female 28-45, problem-aware" --variations=100 --formats="1:1,9:16"
/bulk-creative --brief="..." --variations=50 --formats="1:1"
```

## Parameters
- --brief (required): Creative brief — include product, offer, audience, awareness level
- --variations (default: 50): Total variations to generate (max 500)
- --formats (default: "1:1"): Comma-separated ratios — "1:1" (1080x1080), "9:16" (1080x1920), "1.91:1" (1200x628)
- --output-dir (default: ./creatives/): Output directory for PNG files
- --seed-headlines: Path to CSV of headline variants (optional)

## Prerequisites
- Node.js v18+ installed
- Puppeteer: npm install puppeteer in project root
- Product images in ./assets/images/ (JPG or PNG, minimum 1080x1080)

## Instructions

1. Parse the brief — extract product name, key benefit, primary offer, target
   audience, awareness level, tone cues.

2. Generate variation axes:
   - Headlines (5-10): problem-led, benefit-led, social proof, offer-led, curiosity
   - CTAs (3-5): Shop Now, Get X% Off, Try Free, Learn More, Start Today
   - Background colors (3-5 hex values)
   - Image positions: center, left-aligned, right-aligned

3. Create HTML template at ./creatives/template.html — self-contained with CSS
   variables (--headline, --cta, --bg-color, --img-position), brand logo, headline
   text block, CTA button, product image. Must render at exact pixel dimensions.

4. Generate variation manifest at ./creatives/variations.json listing all
   combinations with: id, headline, cta, bg_color, img_position, format, filename.
   Name files: v{NNN}_{format}_{headline-type}_{cta-slug}.png

5. Render PNGs — write and execute ./creatives/render.js using Puppeteer:
   load template.html with variation params as URL query strings, set viewport to
   exact format dimensions, screenshot to output dir. Add 200ms delay between renders.

6. Organize into subdirectories:
   - ./creatives/headline-variants/
   - ./creatives/cta-variants/
   - ./creatives/color-variants/

7. Generate ./campaigns/bulk-creative-manifest.json in /deploy-ads format:
   [{creative_name, image_path, headline, body, cta, format}]

## Output
- PNG files in ./creatives/ organized by type
- ./campaigns/bulk-creative-manifest.json for /deploy-ads
- ./creatives/variations.json with full variation metadata
- Console summary: "Generated N variations across X formats in Ys"

## Error Handling
- Puppeteer not installed: output install command and stop
- Template render fails: log error, skip variation, continue
- --variations > 500: cap at 500 and warn
- Product image not found: use placeholder and warn
