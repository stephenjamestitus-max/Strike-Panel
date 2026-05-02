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
    'dashboard':      Image.open(f'{SRC}/01.png').convert('RGB'),  # 1638×730
    'morning_brief':  Image.open(f'{SRC}/02.png').convert('RGB'),  # 1057×505
    'fight_dates':    Image.open(f'{SRC}/03.png').convert('RGB'),  # 265×725
    'members':        Image.open(f'{SRC}/04.png').convert('RGB'),  # 1067×553
    'workouts':       Image.open(f'{SRC}/05.png').convert('RGB'),  # 1067×642
    'progress':       Image.open(f'{SRC}/06.png').convert('RGB'),  # 1050×751
    'phone_fights':   Image.open(f'{SRC}/phone-fight-dates-3x.png').convert('RGB'),  # 1170×2532
    'phone_brief':    Image.open(f'{SRC}/phone-morning-brief-3x.png').convert('RGB'),# 1170×2532
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

    # Subtle grid
    for x in range(0, W, 56): d.line([(x,0),(x,H)], fill=(18,24,34), width=1)
    for y in range(0, H, 56): d.line([(0,y),(W,y)], fill=(18,24,34), width=1)

    # Glow blobs: cyan top-left, purple bottom-right
    glow = Image.new('RGB', (W, H), BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(-160,-160),(520,520)], fill=(0,36,50))
    gd.ellipse([(700,280),(1500,900)], fill=(18,0,38))
    img = Image.blend(img, glow, 0.55)
    d = ImageDraw.Draw(img)

    # ── LEFT COLUMN: branding + headline + pricing  (x=52..480) ──
    tx = 52

    # SP logo mark (simple circle cross)
    lx, ly, lr = tx+14, 52, 14
    d.ellipse([(lx-lr, ly-lr),(lx+lr, ly+lr)], outline=ACCENT, width=2)
    d.ellipse([(lx-5, ly-5),(lx+5, ly+5)], fill=ACCENT)
    for pt in [((lx,ly-lr),(lx,ly-6)),((lx,ly+6),(lx,ly+lr)),
               ((lx-lr,ly),(lx-6,ly)),((lx+6,ly),(lx+lr,ly))]:
        d.line(pt, fill=ACCENT, width=2)

    d.text((tx+36, 40), 'STRIKEPANEL™', font=font(MONO, 11), fill=ACCENT)
    d.text((tx+36, 56), 'TRAINING INTELLIGENCE', font=font(MONO, 9), fill=MUTED)

    # Main headline
    d.text((tx, 96),  'KNOW WHO', font=font(BOLD, 42), fill=WHITE)
    d.text((tx, 136), 'TO PUSH.', font=font(BOLD, 42), fill=ACCENT)
    d.text((tx, 184), 'KNOW WHO', font=font(BOLD, 42), fill=WHITE)
    d.text((tx, 224), 'TO PROTECT.', font=font(BOLD, 42), fill=RED)

    # Divider
    d.rectangle([(tx, 280),(tx+200, 282)], fill=ACCENT)

    # Feature list
    features = [
        'Morning readiness brief — every athlete',
        'Fight countdown + auto weight-cut plans',
        'AI workout generator (free Gemini key)',
        'Athlete self check-in — any phone',
    ]
    fy0 = 292
    for i, text in enumerate(features):
        d.text((tx,    fy0 + i*24), '✓', font=font(BOLD, 12), fill=GREEN)
        d.text((tx+20, fy0 + i*24), text, font=font(REG,  12), fill=MUTED)

    # Pricing block
    py = 400
    d.rounded_rectangle([(tx, py),(tx+314, py+122)],
                        radius=10, fill=(12,18,28), outline=(0,80,95), width=1)
    d.rectangle([(tx+1, py+1),(tx+313, py+3)], fill=ACCENT)
    # Row 1: was $149 → now $99
    d.text((tx+16, py+12), 'WAS $149', font=font(REG, 11), fill=(72,82,98))
    d.line([(tx+16+32, py+19),(tx+16+84, py+19)], fill=(65,75,92), width=1)
    # Big price + label side by side
    d.text((tx+16, py+28), '$99', font=font(BOLD, 44), fill=ACCENT)
    d.text((tx+106, py+30), 'LAUNCH', font=font(BOLD, 14), fill=WHITE)
    d.text((tx+106, py+46), 'PRICE', font=font(BOLD, 14), fill=WHITE)
    d.text((tx+106, py+66), 'One-time · No subscription', font=font(REG, 10), fill=MUTED)
    # CTA pill
    d.rounded_rectangle([(tx+12, py+92),(tx+302, py+116)],
                        radius=6, fill=ACCENT)
    d.text((tx+40, py+97), 'GET FULL ACCESS NOW  →', font=font(BOLD, 13), fill=BG)

    # ── CENTER: large laptop with dashboard ───────────────────
    lap = laptop_frame(S['dashboard'], frame_w=600)
    lw, lh = lap.size
    lx2 = 340
    ly2 = (H - lh) // 2 - 8
    img.paste(lap, (lx2, ly2), lap)

    # Subtle glow under laptop
    gl = Image.new('RGB', (lw, 24), BG)
    gl_d = ImageDraw.Draw(gl)
    gl_d.ellipse([(lw//4, -8),(3*lw//4, 24)], fill=(0,55,70))
    gl = gl.filter(ImageFilter.GaussianBlur(14))
    img.paste(gl, (lx2, ly2+lh-6))

    # ── RIGHT: phone frame with fight countdown (cropped top) ──
    ph_src = S['phone_fights']
    ph_crop = ph_src.crop((0, 0, ph_src.width, 880))  # top 880px = fight info
    ph_frame = phone_frame(ph_crop, frame_w=152)
    pw, phh = ph_frame.size
    px2 = W - pw - 22
    py2 = (H - phh) // 2 + 8
    img.paste(ph_frame, (px2, py2), ph_frame)

    # Label above phone
    label = 'FIGHT COUNTDOWN'
    label_x = px2 + (pw - len(label)*7) // 2
    d.text((label_x, py2 - 22), label, font=font(MONO, 8), fill=ACCENT)

    # Sharpen the whole image slightly
    img = img.filter(ImageFilter.UnsharpMask(radius=0.5, percent=120, threshold=2))
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
