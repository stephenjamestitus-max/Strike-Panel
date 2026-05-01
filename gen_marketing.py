from PIL import Image, ImageDraw, ImageFont
import math, os

OUT = '/home/user/Strike-Panel/marketing'
os.makedirs(OUT, exist_ok=True)

BG       = (8, 11, 20)
BG2      = (11, 15, 28)
CARD     = (15, 19, 35)
ACCENT   = (0, 212, 240)
WHITE    = (238, 240, 248)
MUTED    = (122, 133, 160)
MUTED2   = (58, 69, 88)
GREEN    = (16, 185, 129)
AMBER    = (245, 158, 11)
RED      = (239, 68, 68)
DARK     = (5, 8, 16)

def font(size, bold=False):
    try:
        path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_sp_logo(draw, cx, cy, r, accent=ACCENT, bg=DARK):
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(*accent, 80), width=max(1, r//30))
    ir = int(r * 0.72)
    draw.ellipse([cx-ir, cy-ir, cx+ir, cy+ir], fill=accent)
    fs = max(8, int(r * 0.42))
    f = font(fs, bold=True)
    draw.text((cx, cy + fs*0.07), 'SP', font=f, fill=bg, anchor='mm')
    lw = max(2, r//18)
    gap = int(r * 0.14)
    draw.line([cx, cy-r+lw, cx, cy-ir-gap], fill=accent, width=lw)
    draw.line([cx, cy+ir+gap, cx, cy+r-lw], fill=accent, width=lw)
    draw.line([cx-r+lw, cy, cx-ir-gap, cy], fill=accent, width=lw)
    draw.line([cx+ir+gap, cy, cx+r-lw, cy], fill=accent, width=lw)

def radial_bg(img, cx, cy, r_max, color, max_alpha=40):
    arr = img.load()
    w, h = img.size
    for y in range(max(0, cy-r_max), min(h, cy+r_max)):
        for x in range(max(0, cx-r_max), min(w, cx+r_max)):
            dist = math.sqrt((x-cx)**2 + (y-cy)**2)
            if dist < r_max:
                alpha = int(max_alpha * (1 - dist/r_max))
                r, g, b, a = arr[x, y]
                arr[x, y] = (min(255, r + color[0]*alpha//255), min(255, g + color[1]*alpha//255), min(255, b + color[2]*alpha//255), 255)

def top_bar(draw, w):
    for i in range(3):
        a = int(180 * (1 - i/3))
        draw.line([(0, i), (w, i)], fill=(*ACCENT, a), width=1)

def bot_bar(draw, w, h):
    draw.line([(0, h-2), (w, h-2)], fill=(*ACCENT, 60), width=2)

# ── 1. GUMROAD COVER 1200x630 ──────────────────────────────
W, H = 1200, 630
img = Image.new('RGBA', (W, H), (*BG, 255))
radial_bg(img, 320, 180, 500, ACCENT, 18)
draw = ImageDraw.Draw(img)
top_bar(draw, W); bot_bar(draw, W, H)
draw_sp_logo(draw, W//2, 185, 72)
draw.text((W//2, 308), 'STRIKEPANEL', font=font(72, True), fill=WHITE, anchor='mm')
draw.text((982, 276), 'TM', font=font(16), fill=(*WHITE, 100), anchor='mm')
draw.line([(480, 334), (720, 334)], fill=(*ACCENT, 100), width=1)
draw.text((W//2, 372), 'TRAINING INTELLIGENCE', font=font(26, True), fill=ACCENT, anchor='mm')
draw.text((W//2, 418), 'Morning Brief  .  Fight Countdowns  .  AI Workouts  .  Offline PWA', font=font(17), fill=MUTED, anchor='mm')
bx, by, bw, bh = 456, 464, 288, 46
draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=23, fill=(*ACCENT, 22), outline=(*ACCENT, 80), width=1)
draw.text((bx + bw//2, by + bh//2), '$99  .  One-Time  .  No Subscription', font=font(14, True), fill=ACCENT, anchor='mm')
draw.text((W//2, 578), 'strikepanel.vercel.app', font=font(16), fill=(*MUTED, 150), anchor='mm')
img.convert('RGB').save(f'{OUT}/gumroad-cover-1200x630.png', quality=95)
print('1/5  gumroad-cover-1200x630.png')

# ── 2. INSTAGRAM SQUARE 1080x1080 ─────────────────────────
W, H = 1080, 1080
img = Image.new('RGBA', (W, H), (*BG, 255))
radial_bg(img, W//2, 340, 600, ACCENT, 20)
draw = ImageDraw.Draw(img)
top_bar(draw, W); bot_bar(draw, W, H)
draw_sp_logo(draw, W//2, 196, 80)
draw.text((W//2, 338), 'STRIKEPANEL TM', font=font(62, True), fill=WHITE, anchor='mm')
draw.line([(340, 380), (740, 380)], fill=(*ACCENT, 100), width=1)
draw.text((W//2, 420), 'Training Intelligence', font=font(30, True), fill=ACCENT, anchor='mm')
draw.text((W//2, 466), 'for Combat Coaches', font=font(28), fill=MUTED, anchor='mm')
features = [
    ('Morning Brief', 'Who to push hard, who to protect - every morning'),
    ('Fight Countdowns', 'Auto weight-cut calculator per fighter'),
    ('AI Workouts', 'New session plan in 10 seconds - free Gemini key'),
    ('Boxing Timer', 'Offline round timer - works ringside, no signal needed'),
    ('PDF Reports', 'Athlete progress reports - share via WhatsApp'),
]
y = 536
for title, sub in features:
    draw.text((200, y), title, font=font(22, True), fill=WHITE, anchor='lm')
    draw.text((200, y+30), sub, font=font(19), fill=MUTED, anchor='lm')
    y += 74
draw.rounded_rectangle([220, 898, 860, 958], radius=30, fill=(*ACCENT, 25), outline=(*ACCENT, 90), width=1)
draw.text((W//2, 928), '$99 one-time  .  No subscription ever', font=font(24, True), fill=ACCENT, anchor='mm')
draw.text((W//2, 1012), 'strikepanel.vercel.app', font=font(20), fill=(*MUTED, 150), anchor='mm')
img.convert('RGB').save(f'{OUT}/instagram-square-1080x1080.png', quality=95)
print('2/5  instagram-square-1080x1080.png')

# ── 3. INSTAGRAM STORY / WHATSAPP STATUS 1080x1920 ────────
W, H = 1080, 1920
img = Image.new('RGBA', (W, H), (*BG, 255))
radial_bg(img, W//2, 500, 700, ACCENT, 18)
radial_bg(img, W//2, 1400, 500, (139, 92, 246), 12)
draw = ImageDraw.Draw(img)
top_bar(draw, W); bot_bar(draw, W, H)
draw_sp_logo(draw, W//2, 280, 96)
draw.text((W//2, 440), 'STRIKEPANEL TM', font=font(68, True), fill=WHITE, anchor='mm')
draw.text((W//2, 506), 'Training Intelligence', font=font(34, True), fill=ACCENT, anchor='mm')
draw.text((W//2, 554), 'for Combat Coaches', font=font(30), fill=MUTED, anchor='mm')
draw.line([(160, 600), (920, 600)], fill=(*ACCENT, 60), width=1)
draw.text((W//2, 646), 'THE PROBLEM', font=font(22, True), fill=(*RED, 200), anchor='mm')
draw.text((W//2, 690), '"Who is actually ready to train today?"', font=font(27), fill=WHITE, anchor='mm')
draw.text((W//2, 734), 'You have been guessing. StrikePanel ends that.', font=font(22), fill=MUTED, anchor='mm')
draw.line([(160, 786), (920, 786)], fill=(*ACCENT, 40), width=1)
draw.text((W//2, 830), 'HOW IT WORKS', font=font(22, True), fill=(*ACCENT, 200), anchor='mm')
steps = [
    ('1', 'Athlete opens check-in link on their phone'),
    ('2', 'Answers 6 readiness questions in 30 seconds'),
    ('3', 'You see their score in your Morning Brief'),
    ('4', 'Green = push hard   .   Red = protect'),
]
y = 886
for num, text in steps:
    draw.ellipse([160, y-22, 204, y+22], fill=ACCENT)
    draw.text((182, y), num, font=font(24, True), fill=DARK, anchor='mm')
    draw.text((228, y), text, font=font(23), fill=MUTED, anchor='lm')
    y += 72
draw.line([(160, 1100), (920, 1100)], fill=(*ACCENT, 40), width=1)
cards = [
    (GREEN,         'Morning Brief',  'Daily readiness per athlete'),
    (RED,           'Fight Dates',    'Countdowns + weight cuts'),
    (AMBER,         'AI Workouts',    'Generated in 10 seconds'),
    (ACCENT,        'Timer',          'Offline, ringside ready'),
    ((139,92,246),  'PDF Reports',    'Share via WhatsApp'),
    (GREEN,         'Biometrics',     'BMI, BMR, protein targets'),
]
cx = 120; cy = 1150; col = 0
for color, title, sub in cards:
    x = cx + col * 430
    draw.rounded_rectangle([x, cy, x+390, cy+138], radius=14, fill=(*CARD, 255), outline=(*color, 60), width=1)
    draw.line([(x, cy), (x+390, cy)], fill=color, width=2)
    draw.text((x+18, cy+38), title, font=font(26, True), fill=WHITE, anchor='lm')
    draw.text((x+18, cy+80), sub, font=font(20), fill=MUTED, anchor='lm')
    col += 1
    if col == 2:
        col = 0
        cy += 158
draw.line([(160, 1666), (920, 1666)], fill=(*ACCENT, 60), width=1)
draw.rounded_rectangle([120, 1694, 960, 1774], radius=40, fill=(*ACCENT, 22), outline=(*ACCENT, 100), width=1)
draw.text((W//2, 1734), '$99 one-time  .  No subscription', font=font(32, True), fill=ACCENT, anchor='mm')
draw.text((W//2, 1814), '30-day money-back guarantee', font=font(26), fill=(*GREEN, 200), anchor='mm')
draw.text((W//2, 1870), 'strikepanel.vercel.app', font=font(26, True), fill=(*WHITE, 180), anchor='mm')
img.convert('RGB').save(f'{OUT}/instagram-story-1080x1920.png', quality=95)
print('3/5  instagram-story-1080x1920.png')

# ── 4. TWITTER/X BANNER 1500x500 ──────────────────────────
W, H = 1500, 500
img = Image.new('RGBA', (W, H), (*BG, 255))
radial_bg(img, 300, 200, 500, ACCENT, 18)
draw = ImageDraw.Draw(img)
top_bar(draw, W); bot_bar(draw, W, H)
draw_sp_logo(draw, 196, 250, 80)
draw.text((336, 188), 'STRIKEPANEL TM', font=font(58, True), fill=WHITE, anchor='lm')
draw.text((336, 256), 'Training Intelligence for Combat Coaches', font=font(26), fill=MUTED, anchor='lm')
draw.line([(336, 296), (920, 296)], fill=(*ACCENT, 80), width=1)
draw.text((336, 328), 'Morning Brief  .  Fight Countdowns  .  AI Workouts  .  Offline Timer', font=font(21), fill=MUTED, anchor='lm')
draw.rounded_rectangle([1080, 178, 1430, 322], radius=14, fill=(*CARD, 255), outline=(*ACCENT, 80), width=1)
draw.text((1255, 226), '$99 one-time', font=font(32, True), fill=ACCENT, anchor='mm')
draw.text((1255, 274), 'No subscription ever', font=font(20), fill=MUTED, anchor='mm')
draw.text((1255, 362), 'strikepanel.vercel.app', font=font(19), fill=(*MUTED, 140), anchor='mm')
img.convert('RGB').save(f'{OUT}/twitter-banner-1500x500.png', quality=95)
print('4/5  twitter-banner-1500x500.png')

# ── 5. WHATSAPP SHARE CARD 800x420 ────────────────────────
W, H = 800, 420
img = Image.new('RGBA', (W, H), (*BG, 255))
radial_bg(img, 200, 150, 350, ACCENT, 18)
draw = ImageDraw.Draw(img)
top_bar(draw, W); bot_bar(draw, W, H)
draw_sp_logo(draw, 108, 210, 64)
draw.line([(194, 78), (194, 342)], fill=(*MUTED2, 80), width=1)
draw.text((234, 108), 'STRIKEPANEL TM', font=font(34, True), fill=WHITE, anchor='lm')
draw.text((234, 154), 'Combat Sports Coaching App', font=font(20), fill=MUTED, anchor='lm')
draw.line([(234, 184), (762, 184)], fill=(*ACCENT, 60), width=1)
rows = [
    'Daily readiness brief for every athlete',
    'Fight countdowns + auto weight-cut plans',
    'Offline boxing timer - ringside ready',
]
y = 212
for text in rows:
    draw.text((234, y), text, font=font(19), fill=MUTED, anchor='lm')
    y += 38
draw.rounded_rectangle([234, 326, 556, 374], radius=22, fill=(*ACCENT, 22), outline=(*ACCENT, 90), width=1)
draw.text((395, 350), '$99 one-time  .  Try free demo', font=font(17, True), fill=ACCENT, anchor='mm')
draw.text((580, 350), 'strikepanel.vercel.app', font=font(15), fill=(*MUTED, 150), anchor='lm')
img.convert('RGB').save(f'{OUT}/whatsapp-share-card-800x420.png', quality=95)
print('5/5  whatsapp-share-card-800x420.png')

print('\nDone. All images in /home/user/Strike-Panel/marketing/')
