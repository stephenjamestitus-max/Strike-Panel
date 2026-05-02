"""
StrikePanel Marketing Image Generator
Uses real screenshots from sp-media/ to produce all required assets.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

SRC = os.path.join(os.path.dirname(__file__), 'sp-media')
OUT = os.path.join(os.path.dirname(__file__), 'marketing')
os.makedirs(OUT, exist_ok=True)

# Brand colours
BG      = (10, 14, 20)
ACCENT  = (0, 212, 240)
RED     = (255, 59, 59)
GREEN   = (0, 255, 136)
MUTED   = (100, 116, 139)
WHITE   = (255, 255, 255)
CARD_BG = (15, 20, 30)

# Source screenshots
S = {
    'dashboard':    Image.open(f'{SRC}/01.png').convert('RGB'),  # 1638×730
    'morning_brief': Image.open(f'{SRC}/02.png').convert('RGB'), # 1057×505
    'fight_dates':  Image.open(f'{SRC}/03.png').convert('RGB'),  # 265×725
    'members':      Image.open(f'{SRC}/04.png').convert('RGB'),  # 1067×553
    'workouts':     Image.open(f'{SRC}/05.png').convert('RGB'),  # 1067×642
    'progress':     Image.open(f'{SRC}/06.png').convert('RGB'),  # 1050×751
}

# Fonts
BOLD  = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
REG   = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
MONO  = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'

def font(path, size): return ImageFont.truetype(path, size)

def save(img, name):
    img.save(os.path.join(OUT, name), 'PNG', optimize=True)
    print(f'✓  {name}  ({img.size[0]}×{img.size[1]})')

def rounded_paste(base, img, xy, radius=12):
    """Paste img onto base at xy with rounded corners."""
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([(0,0), img.size], radius=radius, fill=255)
    base.paste(img, xy, mask)

def laptop_frame(screenshot, frame_w=900):
    """Wrap a screenshot in a minimal laptop frame."""
    sw, sh = screenshot.size
    scale  = frame_w / sw
    sw2, sh2 = int(sw * scale), int(sh * scale)
    screen = screenshot.resize((sw2, sh2), Image.LANCZOS)

    bezel      = 12
    top_bar    = 28   # thin bar above screen (webcam area)
    base_h     = 38
    total_w    = sw2 + bezel * 2
    total_h    = sh2 + bezel + top_bar + base_h

    canvas = Image.new('RGBA', (total_w, total_h), (0,0,0,0))
    d = ImageDraw.Draw(canvas)

    # Lid (screen surround)
    lid_h = sh2 + bezel + top_bar
    d.rounded_rectangle([(0, 0), (total_w - 1, lid_h)], radius=10,
                        fill=(22, 28, 38), outline=(40, 50, 65), width=1)
    # Camera dot
    d.ellipse([(total_w//2 - 3, 10), (total_w//2 + 3, 16)], fill=(50,60,75))
    # Screen area
    d.rounded_rectangle([(bezel, top_bar), (total_w - bezel - 1, top_bar + sh2)],
                        radius=4, fill=(8, 12, 18))
    rounded_paste(canvas, screen, (bezel, top_bar), radius=4)

    # Base / keyboard
    base_y = lid_h
    d.rounded_rectangle([(0, base_y), (total_w - 1, base_y + base_h - 1)],
                        radius=6, fill=(18, 24, 34), outline=(40,50,65), width=1)
    # Trackpad
    tp_w, tp_h = 100, 18
    tp_x = (total_w - tp_w) // 2
    tp_y = base_y + (base_h - tp_h) // 2
    d.rounded_rectangle([(tp_x, tp_y), (tp_x+tp_w, tp_y+tp_h)],
                        radius=4, fill=(28, 35, 48), outline=(45,55,70), width=1)
    return canvas

def phone_frame(screenshot, frame_w=280):
    """Wrap a screenshot in a minimal phone frame."""
    sw, sh = screenshot.size
    scale  = frame_w / sw
    sw2, sh2 = int(sw * scale), int(sh * scale)
    screen = screenshot.resize((sw2, sh2), Image.LANCZOS)

    bx, bt, bb = 10, 50, 40   # bezels: side, top, bottom
    total_w = sw2 + bx * 2
    total_h = sh2 + bt + bb

    canvas = Image.new('RGBA', (total_w, total_h), (0,0,0,0))
    d = ImageDraw.Draw(canvas)

    d.rounded_rectangle([(0,0),(total_w-1, total_h-1)], radius=32,
                        fill=(22,28,38), outline=(40,50,65), width=2)
    # Camera notch
    notch_w, notch_h = 60, 18
    nx = (total_w - notch_w) // 2
    d.rounded_rectangle([(nx, 0), (nx+notch_w, notch_h)], radius=9, fill=(12,16,24))
    # Camera dot
    d.ellipse([(total_w//2-4, 6),(total_w//2+4, 14)], fill=(30,36,48))
    # Screen
    d.rounded_rectangle([(bx, bt),(bx+sw2, bt+sh2)], radius=4, fill=(8,12,18))
    rounded_paste(canvas, screen, (bx, bt), radius=4)
    # Home bar
    bar_w = 80
    bbar_x = (total_w - bar_w) // 2
    bbar_y = total_h - 16
    d.rounded_rectangle([(bbar_x, bbar_y),(bbar_x+bar_w, bbar_y+5)],
                        radius=3, fill=(60,70,85))
    return canvas


# ── 1. GUMROAD COVER  1200×630 ─────────────────────────────────────────
def make_gumroad_cover():
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), BG)
    d   = ImageDraw.Draw(img)

    # Subtle grid overlay
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(20, 26, 36), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(20, 26, 36), width=1)

    # Accent glow blobs
    glow = Image.new('RGB', (W, H), BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(-100, -100), (500, 500)], fill=(0, 40, 55))
    gd.ellipse([(750, 200), (1400, 750)], fill=(20, 0, 40))
    img = Image.blend(img, glow, 0.5)
    d = ImageDraw.Draw(img)

    # ── Left text block ────────────────────────────────────────
    tx = 60
    # Kicker
    d.text((tx, 80), '⚡  COMBAT SPORTS · TRAINING INTELLIGENCE', font=font(MONO, 12),
           fill=ACCENT)
    # Logo
    d.text((tx, 118), 'StrikePanel™', font=font(BOLD, 56), fill=WHITE)
    d.text((tx, 184), 'TRAINING INTELLIGENCE', font=font(MONO, 13), fill=MUTED)

    # Divider
    d.rectangle([(tx, 210), (tx + 260, 212)], fill=ACCENT)

    # Headline
    for i, (line, clr) in enumerate([
        ('KNOW WHO', WHITE),
        ('TO PUSH.', ACCENT),
        ('KNOW WHO', WHITE),
        ('TO PROTECT.', RED),
    ]):
        d.text((tx, 228 + i * 68), line, font=font(BOLD, 58), fill=clr)

    # Sub
    d.text((tx, 510), 'Daily readiness briefs. Fight camp planning.', font=font(REG, 17), fill=MUTED)
    d.text((tx, 534), 'Round timer. AI workouts. One HTML file.', font=font(REG, 17), fill=MUTED)

    # Price badge
    badge_x, badge_y = tx, 568
    d.rounded_rectangle([(badge_x, badge_y), (badge_x+120, badge_y+34)],
                        radius=6, fill=ACCENT)
    d.text((badge_x+12, badge_y+7), '$99  LAUNCH PRICE', font=font(BOLD, 14), fill=BG)

    # ── Right: laptop mockup ───────────────────────────────────
    frame = laptop_frame(S['morning_brief'], frame_w=620)
    fw, fh = frame.size
    fx = W - fw - 20
    fy = (H - fh) // 2 + 10
    img.paste(frame, (fx, fy), frame)

    save(img, 'gumroad-cover-1200x630.png')


# ── 2. PHONE MOCKUPS ───────────────────────────────────────────────────
def make_phone_screenshots():
    for name, src_key in [
        ('phone-fight-dates.png',   'fight_dates'),
        ('phone-morning-brief.png', 'morning_brief'),
    ]:
        frame = phone_frame(S[src_key], frame_w=300)
        # Put on dark background with padding
        pw, ph = frame.size
        pad = 30
        out = Image.new('RGB', (pw + pad*2, ph + pad*2), BG)
        out.paste(frame, (pad, pad), frame)
        save(out, name)


# ── 3. LAPTOP SCREENSHOTS ──────────────────────────────────────────────
def make_laptop_screenshots():
    for name, src_key in [
        ('laptop-dashboard.png',     'dashboard'),
        ('laptop-morning-brief.png', 'morning_brief'),
        ('laptop-workouts.png',      'workouts'),
        ('laptop-progress.png',      'progress'),
        ('laptop-members.png',       'members'),
    ]:
        frame = laptop_frame(S[src_key], frame_w=880)
        fw, fh = frame.size
        pad = 40
        out = Image.new('RGB', (fw + pad*2, fh + pad*2), BG)
        out.paste(frame, (pad, pad), frame)
        save(out, name)


# ── 4. INSTAGRAM SQUARE  1080×1080 ─────────────────────────────────────
def make_instagram_square():
    W = H = 1080
    img = Image.new('RGB', (W, H), BG)
    d   = ImageDraw.Draw(img)

    # Grid
    for x in range(0, W, 54):
        d.line([(x,0),(x,H)], fill=(18,24,32), width=1)
    for y in range(0, H, 54):
        d.line([(0,y),(W,y)], fill=(18,24,32), width=1)

    # Glow
    glow = Image.new('RGB', (W, H), BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(-80,-80),(600,600)], fill=(0,35,50))
    gd.ellipse([(500,500),(1200,1200)], fill=(20,0,35))
    img = Image.blend(img, glow, 0.5)
    d = ImageDraw.Draw(img)

    # Laptop frame centred
    frame = laptop_frame(S['morning_brief'], frame_w=920)
    fw, fh = frame.size
    fy = (H - fh) // 2 - 30
    img.paste(frame, ((W-fw)//2, fy), frame)

    # Bottom branding
    d.text((W//2, H-100), 'StrikePanel™', font=font(BOLD, 36), fill=WHITE, anchor='mm')
    d.text((W//2, H-62),  'TRAINING INTELLIGENCE  ·  strikepanel.vercel.app',
           font=font(MONO, 13), fill=MUTED, anchor='mm')

    save(img, 'instagram-square-1080x1080.png')


# ── 5. INSTAGRAM STORY  1080×1920 ──────────────────────────────────────
def make_instagram_story():
    W, H = 1080, 1920
    img = Image.new('RGB', (W, H), BG)
    d   = ImageDraw.Draw(img)

    # Top branding
    d.text((W//2, 140), 'StrikePanel™', font=font(BOLD, 52), fill=WHITE, anchor='mm')
    d.text((W//2, 200), 'TRAINING INTELLIGENCE', font=font(MONO, 18), fill=ACCENT, anchor='mm')
    d.rectangle([(W//2-120, 222),(W//2+120, 224)], fill=ACCENT)

    # Laptop mockup
    lframe = laptop_frame(S['morning_brief'], frame_w=960)
    lw, lh = lframe.size
    img.paste(lframe, ((W-lw)//2, 280), lframe)

    # Phone mockup below
    pframe = phone_frame(S['fight_dates'], frame_w=340)
    pw, ph = pframe.size
    img.paste(pframe, ((W-pw)//2, 280 + lh + 60), pframe)

    # Bottom CTA
    y = H - 160
    d.text((W//2, y),    'One purchase. Lifetime access.', font=font(BOLD, 30), fill=WHITE, anchor='mm')
    d.text((W//2, y+44), '$99 launch price', font=font(BOLD, 26), fill=ACCENT, anchor='mm')
    d.text((W//2, y+86), 'strikepanel.vercel.app', font=font(MONO, 18), fill=MUTED, anchor='mm')

    save(img, 'instagram-story-1080x1920.png')


# ── 6. TWITTER / X BANNER  1500×500 ───────────────────────────────────
def make_twitter_banner():
    W, H = 1500, 500
    img = Image.new('RGB', (W, H), BG)
    d   = ImageDraw.Draw(img)

    # Grid
    for x in range(0, W, 60): d.line([(x,0),(x,H)], fill=(18,24,32), width=1)
    for y in range(0, H, 60): d.line([(0,y),(W,y)], fill=(18,24,32), width=1)

    # Glow
    glow = Image.new('RGB', (W, H), BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(-100,-100),(600,600)], fill=(0,35,50))
    img = Image.blend(img, glow, 0.4)
    d = ImageDraw.Draw(img)

    # Left text
    tx = 70
    d.text((tx, 100), 'StrikePanel™', font=font(BOLD, 54), fill=WHITE)
    d.text((tx, 164), 'TRAINING INTELLIGENCE', font=font(MONO, 15), fill=MUTED)
    d.rectangle([(tx, 192),(tx+200, 194)], fill=ACCENT)
    d.text((tx, 208), 'Daily readiness briefs.', font=font(REG, 22), fill=WHITE)
    d.text((tx, 238), 'Fight camp planning.', font=font(REG, 22), fill=WHITE)
    d.text((tx, 268), 'Round timer. AI workouts.', font=font(REG, 22), fill=WHITE)
    d.text((tx, 316), '$99 · One-time · No subscription', font=font(BOLD, 18), fill=ACCENT)

    # Right: laptop frame
    frame = laptop_frame(S['morning_brief'], frame_w=700)
    fw, fh = frame.size
    img.paste(frame, (W - fw - 20, (H - fh) // 2), frame)

    save(img, 'twitter-banner-1500x500.png')


# ── 7. WHATSAPP SHARE CARD  800×420 ───────────────────────────────────
def make_whatsapp_card():
    W, H = 800, 420
    img = Image.new('RGB', (W, H), BG)
    d   = ImageDraw.Draw(img)

    # Grid
    for x in range(0, W, 40): d.line([(x,0),(x,H)], fill=(18,24,32), width=1)
    for y in range(0, H, 40): d.line([(0,y),(W,y)], fill=(18,24,32), width=1)

    # Left text
    tx = 48
    d.text((tx, 60), 'StrikePanel™', font=font(BOLD, 42), fill=WHITE)
    d.text((tx, 112), 'TRAINING INTELLIGENCE', font=font(MONO, 12), fill=MUTED)
    d.rectangle([(tx, 136),(tx+160, 138)], fill=ACCENT)
    d.text((tx, 152), 'Know who to push.', font=font(BOLD, 24), fill=ACCENT)
    d.text((tx, 184), 'Know who to protect.', font=font(BOLD, 24), fill=RED)
    d.text((tx, 234), 'Daily readiness briefs for', font=font(REG, 16), fill=WHITE)
    d.text((tx, 258), 'combat sports coaches.', font=font(REG, 16), fill=WHITE)
    d.rounded_rectangle([(tx, 300),(tx+200, 336)], radius=6, fill=ACCENT)
    d.text((tx+14, 310), 'Get it for $99  →', font=font(BOLD, 16), fill=BG)

    # Right: phone mockup
    frame = phone_frame(S['fight_dates'], frame_w=220)
    fw, fh = frame.size
    img.paste(frame, (W - fw - 30, (H - fh) // 2), frame)

    save(img, 'whatsapp-share-card-800x420.png')


# ── 8. LANDING PAGE DEVICE IMAGES ──────────────────────────────────────
def make_landing_images():
    """Clean device mockups for embedding in landing.html."""
    media_dir = os.path.join(os.path.dirname(__file__), 'media')
    os.makedirs(media_dir, exist_ok=True)

    # Laptop — morning brief (wide, for landing hero section)
    frame = laptop_frame(S['morning_brief'], frame_w=800)
    fw, fh = frame.size
    out = Image.new('RGB', (fw + 40, fh + 40), BG)
    out.paste(frame, (20, 20), frame)
    out.save(os.path.join(media_dir, 'screen-laptop.png'), 'PNG', optimize=True)
    print(f'✓  media/screen-laptop.png  ({out.size[0]}×{out.size[1]})')

    # Phone — fight dates
    frame = phone_frame(S['fight_dates'], frame_w=260)
    fw, fh = frame.size
    out = Image.new('RGB', (fw + 20, fh + 20), BG)
    out.paste(frame, (10, 10), frame)
    out.save(os.path.join(media_dir, 'screen-mobile.png'), 'PNG', optimize=True)
    print(f'✓  media/screen-mobile.png  ({out.size[0]}×{out.size[1]})')

    # Also save clean renamed source screenshots
    renames = {
        'dashboard.png':     'dashboard',
        'morning-brief.png': 'morning_brief',
        'fight-dates.png':   'fight_dates',
        'members.png':       'members',
        'workouts.png':      'workouts',
        'progress.png':      'progress',
    }
    for fname, key in renames.items():
        S[key].save(os.path.join(media_dir, fname), 'PNG')
        print(f'✓  media/{fname}')


# ── RUN ALL ────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('\n── Marketing images ─────────────────────────────')
    make_gumroad_cover()
    make_phone_screenshots()
    make_laptop_screenshots()
    make_instagram_square()
    make_instagram_story()
    make_twitter_banner()
    make_whatsapp_card()
    print('\n── Landing page device images ───────────────────')
    make_landing_images()
    print('\nDone.')
