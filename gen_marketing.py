from PIL import Image, ImageDraw, ImageFont
import math, os

OUT = '/home/user/Strike-Panel/marketing'
os.makedirs(OUT, exist_ok=True)

BG      = (8,  11, 20)
CARD    = (15, 19, 35)
CARD2   = (20, 26, 44)
ACCENT  = (0, 212, 240)
WHITE   = (238, 240, 248)
MUTED   = (122, 133, 160)
MUTED2  = (50,  60, 80)
GREEN   = (16, 185, 129)
AMBER   = (245, 158, 11)
RED     = (239, 68,  68)
DARK    = (8,  11, 20)
PURPLE  = (139, 92, 246)

def blend(bg, fg, a):
    """Alpha-blend fg onto bg. a = 0..255."""
    t = a / 255.0
    return tuple(int(bg[i] + (fg[i] - bg[i]) * t) for i in range(3))

# Pre-baked pill fills (blended against CARD bg)
ACCENT_PILL  = blend(CARD, ACCENT, 38)   # subtle cyan tint
GREEN_PILL   = blend(CARD, GREEN,  38)
RED_PILL     = blend(CARD, RED,    38)
AMBER_PILL   = blend(CARD, AMBER,  38)
CARD_ACCENT  = blend(BG,   ACCENT, 26)   # for CTA buttons on BG
CARD_DARK    = blend(BG,   CARD,   200)

def font(size, bold=False):
    for path, is_bold in [
        ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', True),
        ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', False),
    ]:
        if is_bold == bold and os.path.exists(path):
            try: return ImageFont.truetype(path, size)
            except: pass
    return ImageFont.load_default()

def soft_glow(img, cx, cy, radius, color, alpha=18):
    glow = Image.new('RGBA', img.size, (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    steps = 40
    for i in range(steps, 0, -1):
        r2 = int(radius * i / steps)
        a  = int(alpha * (1 - i/steps) * 2)
        gd.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], fill=(*color, min(255,a)))
    return Image.alpha_composite(img, glow)

def top_accent(draw, w):
    draw.line([(0,0),(w,0)], fill=(*ACCENT,200), width=2)
    draw.line([(0,2),(w,2)], fill=(*ACCENT,70),  width=1)

def rr(draw, x1,y1,x2,y2, radius=10, fill=None, outline=None, width=1):
    draw.rounded_rectangle([x1,y1,x2,y2], radius=radius,
                            fill=fill, outline=outline, width=width)

def draw_sp_logo(draw, cx, cy, r):
    """Exact app logo: dark orb, faint inner ring, 4 cardinal + 4 diagonal ticks, center dot."""
    rr(draw, cx-r, cy-r, cx+r, cy+r, radius=r, fill=(14,18,34))
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(*ACCENT,90),
                 width=max(1,int(r*0.025)))
    ir = int(r*0.66)
    draw.ellipse([cx-ir, cy-ir, cx+ir, cy+ir], outline=(*ACCENT,40),
                 width=max(1,int(r*0.018)))
    lw  = max(2, int(r*0.055))
    out = int(r*0.93); inn = int(r*0.73)
    draw.line([cx, cy-out, cx, cy-inn], fill=ACCENT, width=lw)
    draw.line([cx, cy+inn, cx, cy+out], fill=ACCENT, width=lw)
    draw.line([cx-out, cy, cx-inn, cy], fill=ACCENT, width=lw)
    draw.line([cx+inn, cy, cx+out, cy], fill=ACCENT, width=lw)
    dlw = max(1, int(r*0.03))
    d1 = int(r*0.76); d2 = int(r*0.67)
    for dx,dy in [(1,1),(-1,1),(1,-1),(-1,-1)]:
        draw.line([cx+dx*d1,cy+dy*d1,cx+dx*d2,cy+dy*d2],
                  fill=(*ACCENT,120), width=dlw)
    cr = int(r*0.22)
    draw.ellipse([cx-cr,cy-cr,cx+cr,cy+cr], fill=ACCENT)
    fs = max(6, int(r*0.185))
    draw.text((cx, cy+int(fs*0.1)), 'SP', font=font(fs,True), fill=DARK, anchor='mm')

def phone_frame(img_rgba, px, py, pw, ph):
    draw = ImageDraw.Draw(img_rgba)
    br = int(pw*0.11)
    rr(draw, px,py,px+pw,py+ph, radius=br, fill=(16,21,36), outline=(45,56,76), width=2)
    bx=int(pw*0.045); by_top=int(ph*0.03); by_bot=int(ph*0.04)
    sx=px+bx; sy=py+by_top; sw=pw-2*bx; sh=ph-by_top-by_bot
    rr(draw, sx,sy,sx+sw,sy+sh, radius=int(br*0.75), fill=BG)
    nw=int(pw*0.26); nh=int(ph*0.022)
    nx=px+pw//2-nw//2; ny=sy
    rr(draw, nx,ny,nx+nw,ny+nh, radius=nh//2, fill=(16,21,36))
    hw=int(pw*0.28)
    hx=px+pw//2-hw//2; hy=sy+sh-8
    rr(draw, hx,hy,hx+hw,hy+5, radius=3, fill=(50,60,80))
    return (sx, sy+nh, sw, sh-nh-14)

def readiness_card(draw, x,y,w,h, name, score, label, color):
    rr(draw, x,y,x+w,y+h, radius=9, fill=CARD)
    draw.line([(x+9,y+1),(x+w-9,y+1)], fill=color, width=2)
    draw.text((x+10, y+h//2-12), str(score),
              font=font(28,True), fill=color, anchor='lm')
    draw.text((x+10, y+h//2+8), name,
              font=font(10,True), fill=WHITE, anchor='lm')
    pill_fill = blend(CARD, color, 45)
    lw2=w-20
    rr(draw, x+10,y+h-20,x+10+lw2,y+h-6, radius=7, fill=pill_fill)
    draw.text((x+10+lw2//2, y+h-13), label,
              font=font(8,True), fill=color, anchor='mm')

def tab_bar(draw, x,y,w,h, active='Brief'):
    draw.rectangle([x,y,x+w,y+h], fill=(10,13,22))
    draw.line([(x,y),(x+w,y)], fill=(*ACCENT,25), width=1)
    for i,t in enumerate(['Home','Brief','Fights','Timer','More']):
        tw=w//5; tx=x+i*tw+tw//2; ty=y+h//2
        is_a=t==active
        draw.text((tx,ty), t, font=font(8,is_a), fill=ACCENT if is_a else MUTED2, anchor='mm')
        if is_a:
            draw.line([(tx-10,y+1),(tx+10,y+1)], fill=ACCENT, width=2)

def feat_pill(draw, x,y,w,h, text):
    rr(draw, x,y,x+w,y+h, radius=h//2,
       fill=CARD_ACCENT, outline=(*ACCENT,60), width=1)
    draw.text((x+w//2, y+h//2), text, font=font(11,True), fill=ACCENT, anchor='mm')

def cta_btn(draw, x,y,w,h, text, fsize=18):
    rr(draw, x,y,x+w,y+h, radius=h//2,
       fill=CARD_ACCENT, outline=(*ACCENT,100), width=1)
    draw.text((x+w//2, y+h//2), text, font=font(fsize,True), fill=ACCENT, anchor='mm')

# ──────────────────────────────────────────────────────────
# 1. GUMROAD COVER  1200 × 630
# ──────────────────────────────────────────────────────────
W, H = 1200, 630
img = Image.new('RGBA', (W,H), (*BG,255))
img = soft_glow(img, 180, 260, 380, ACCENT, alpha=12)
img = soft_glow(img, 980, 420, 260, PURPLE, alpha=8)
draw = ImageDraw.Draw(img)
top_accent(draw, W)
draw.line([(0,H-1),(W,H-1)], fill=(*ACCENT,35), width=1)
draw.line([(560,40),(560,590)], fill=(*MUTED2,35), width=1)

# LEFT branding
draw_sp_logo(draw, 100, 196, 70)
draw.text((192,152),'STRIKEPANEL', font=font(56,True), fill=WHITE, anchor='lm')
draw.text((532,138),'TM', font=font(13), fill=(*WHITE,80), anchor='lm')
draw.text((192,216),'TRAINING INTELLIGENCE', font=font(18,True), fill=ACCENT, anchor='lm')
draw.line([(192,242),(532,242)], fill=(*ACCENT,50), width=1)
draw.text((192,264),'for Combat Sports Coaches', font=font(16), fill=MUTED, anchor='lm')
for i,f in enumerate(['Morning Brief','Fight Countdowns','AI Workouts','Offline Timer']):
    draw.text((210, 296+i*26), '• '+f, font=font(14), fill=MUTED, anchor='lm')
cta_btn(draw, 192,410,360,46, '$99  Founding Price', fsize=17)
draw.text((372,466),'One-time  .  No subscription  .  30-day guarantee',
          font=font(11), fill=MUTED, anchor='mm')
draw.text((372,534),'strikepanel.vercel.app',
          font=font(13), fill=(*MUTED,110), anchor='mm')

# RIGHT phone
px,py,pw,ph = 596,36,260,490
sx,sy,sw,sh = phone_frame(img, px,py,pw,ph)
draw = ImageDraw.Draw(img)
draw.text((sx+sw//2,sy+12),'MORNING BRIEF', font=font(8,True), fill=ACCENT, anchor='mm')
draw.text((sx+sw//2,sy+24),'Thursday  .  May 1', font=font(7), fill=MUTED, anchor='mm')
draw.line([(sx+8,sy+34),(sx+sw-8,sy+34)], fill=(*MUTED2,60), width=1)
cw4=(sw-18)//2; ch4=84
for i,(n,sc,lb,col) in enumerate([
    ('Marcus O.',87,'PUSH HARD',GREEN),('Tyler N.',72,'TRAIN',AMBER),
    ('Priya S.',41,'REST',RED),('Jake T.',78,'TRAIN',AMBER)]):
    readiness_card(draw,sx+9+(i%2)*(cw4+6),sy+40+(i//2)*(ch4+6),cw4,ch4,n,sc,lb,col)
rr(draw,sx+8,sy+228,sx+sw-8,sy+258, radius=8,
   fill=blend(BG,ACCENT,22), outline=(*ACCENT,50), width=1)
draw.text((sx+sw//2,sy+243),'Copy check-in link →',
          font=font(8,True), fill=ACCENT, anchor='mm')
tab_bar(draw,sx,sy+sh-20,sw,20,'Brief')

img.convert('RGB').save(f'{OUT}/gumroad-cover-1200x630.png', quality=96)
print('1/5  gumroad-cover-1200x630.png')

# ──────────────────────────────────────────────────────────
# 2. INSTAGRAM SQUARE  1080 × 1080
# ──────────────────────────────────────────────────────────
W, H = 1080, 1080
img = Image.new('RGBA', (W,H), (*BG,255))
img = soft_glow(img, W//2, 100, 480, ACCENT, alpha=10)
draw = ImageDraw.Draw(img)
top_accent(draw, W)
draw.line([(0,H-1),(W,H-1)], fill=(*ACCENT,35), width=1)
draw_sp_logo(draw, W//2, 82, 50)
draw.text((W//2,152),'STRIKEPANEL', font=font(46,True), fill=WHITE, anchor='mm')
draw.text((W//2,188),'Training Intelligence for Combat Coaches',
          font=font(17), fill=MUTED, anchor='mm')
draw.line([(100,210),(980,210)], fill=(*ACCENT,40), width=1)

p1x,p1y,p1w,p1h = 50,228,440,666
s1x,s1y,s1w,s1h = phone_frame(img, p1x,p1y,p1w,p1h)
draw = ImageDraw.Draw(img)
draw.text((s1x+s1w//2,s1y+12),'MORNING BRIEF', font=font(10,True), fill=ACCENT, anchor='mm')
draw.text((s1x+s1w//2,s1y+27),'Thursday  .  4 athletes', font=font(8), fill=MUTED, anchor='mm')
draw.line([(s1x+8,s1y+38),(s1x+s1w-8,s1y+38)], fill=(*MUTED2,60), width=1)
cw5=(s1w-20)//2; ch5=106
for i,(n,sc,lb,col) in enumerate([
    ('Marcus O.',87,'PUSH HARD',GREEN),('Tyler N.',72,'TRAIN NORMAL',AMBER),
    ('Priya S.',41,'REST TODAY',RED),  ('Jake T.',79,'TRAIN NORMAL',AMBER)]):
    readiness_card(draw,s1x+10+(i%2)*(cw5+8),s1y+46+(i//2)*(ch5+8),cw5,ch5,n,sc,lb,col)
rr(draw,s1x+10,s1y+284,s1x+s1w-10,s1y+310, radius=8,
   fill=CARD2, outline=(*ACCENT,35), width=1)
draw.text((s1x+s1w//2,s1y+297),'Avg readiness: 69.5 / 100',
          font=font(9,True), fill=WHITE, anchor='mm')
tab_bar(draw,s1x,s1y+s1h-22,s1w,22,'Brief')
draw.text((s1x+s1w//2,p1y+p1h+18),'Morning Brief', font=font(16,True), fill=ACCENT, anchor='mm')
draw.text((s1x+s1w//2,p1y+p1h+38),'Daily readiness scores', font=font(13), fill=MUTED, anchor='mm')

p2x,p2y,p2w,p2h = 590,228,440,666
s2x,s2y,s2w,s2h = phone_frame(img, p2x,p2y,p2w,p2h)
draw = ImageDraw.Draw(img)
draw.text((s2x+s2w//2,s2y+12),'FIGHT DATES', font=font(10,True), fill=ACCENT, anchor='mm')
draw.line([(s2x+8,s2y+28),(s2x+s2w-8,s2y+28)], fill=(*MUTED2,60), width=1)
rr(draw,s2x+10,s2y+36,s2x+s2w-10,s2y+162, radius=10, fill=CARD)
draw.line([(s2x+20,s2y+37),(s2x+s2w-20,s2y+37)], fill=RED, width=2)
draw.text((s2x+20,s2y+53),'Marcus Okafor', font=font(12,True), fill=ACCENT, anchor='lm')
draw.text((s2x+20,s2y+69),'Regional Title Fight', font=font(10), fill=MUTED, anchor='lm')
draw.text((s2x+s2w//2,s2y+108),'21', font=font(40,True), fill=RED, anchor='mm')
draw.text((s2x+s2w//2,s2y+130),'DAYS TO FIGHT', font=font(9,True), fill=MUTED2, anchor='mm')
rr(draw,s2x+10,s2y+150,s2x+s2w-10,s2y+192, radius=8, fill=CARD2)
draw.text((s2x+20,s2y+164),'81.5kg → 77kg', font=font(11,True), fill=AMBER, anchor='lm')
bw6=s2w-52
rr(draw,s2x+20,s2y+178,s2x+20+bw6,s2y+184, radius=3, fill=MUTED2)
rr(draw,s2x+20,s2y+178,s2x+20+int(bw6*0.82),s2y+184, radius=3, fill=RED)
rr(draw,s2x+10,s2y+200,s2x+s2w-10,s2y+310, radius=10, fill=CARD)
draw.line([(s2x+20,s2y+201),(s2x+s2w-20,s2y+201)], fill=AMBER, width=2)
draw.text((s2x+20,s2y+216),'Tyler Novak', font=font(12,True), fill=ACCENT, anchor='lm')
draw.text((s2x+20,s2y+232),'Kickboxing Champs', font=font(10), fill=MUTED, anchor='lm')
draw.text((s2x+s2w//2,s2y+264),'56', font=font(40,True), fill=AMBER, anchor='mm')
draw.text((s2x+s2w//2,s2y+288),'DAYS  .  8 WEEKS OUT', font=font(9,True), fill=MUTED2, anchor='mm')
tab_bar(draw,s2x,s2y+s2h-22,s2w,22,'Fights')
draw.text((s2x+s2w//2,p2y+p2h+18),'Fight Dates', font=font(16,True), fill=ACCENT, anchor='mm')
draw.text((s2x+s2w//2,p2y+p2h+38),'Countdowns + weight cuts', font=font(13), fill=MUTED, anchor='mm')

cta_btn(draw,80,960,920,48,'$99 one-time  .  No subscription ever',fsize=20)
draw.text((540,1028),'strikepanel.vercel.app', font=font(16), fill=(*MUTED,120), anchor='mm')

img.convert('RGB').save(f'{OUT}/instagram-square-1080x1080.png', quality=96)
print('2/5  instagram-square-1080x1080.png')

# ──────────────────────────────────────────────────────────
# 3. INSTAGRAM STORY / WHATSAPP STATUS  1080 × 1920
# ──────────────────────────────────────────────────────────
W, H = 1080, 1920
img = Image.new('RGBA', (W,H), (*BG,255))
img = soft_glow(img, W//2, 360, 580, ACCENT, alpha=10)
img = soft_glow(img, W//2, 1500, 500, PURPLE, alpha=8)
draw = ImageDraw.Draw(img)
top_accent(draw, W)
draw.line([(0,H-1),(W,H-1)], fill=(*ACCENT,35), width=1)

draw_sp_logo(draw, W//2, 170, 78)
draw.text((W//2,286),'STRIKEPANEL', font=font(60,True), fill=WHITE, anchor='mm')
draw.text((W//2,334),'Training Intelligence for Combat Coaches',
          font=font(21), fill=MUTED, anchor='mm')
draw.line([(120,360),(960,360)], fill=(*ACCENT,40), width=1)
draw.text((W//2,398),'Know who to push.', font=font(30,True), fill=WHITE, anchor='mm')
draw.text((W//2,438),'Know who to protect.', font=font(30,True), fill=ACCENT, anchor='mm')
draw.text((W//2,476),'Every morning. Zero guesswork.',
          font=font(19), fill=MUTED, anchor='mm')
draw.line([(120,498),(960,498)], fill=(*ACCENT,25), width=1)

ppw,pph = 540,730
ppx=W//2-ppw//2; ppy=514
sx,sy,sw,sh = phone_frame(img, ppx,ppy,ppw,pph)
draw = ImageDraw.Draw(img)
draw.text((sx+sw//2,sy+13),'MORNING BRIEF', font=font(11,True), fill=ACCENT, anchor='mm')
draw.text((sx+sw//2,sy+29),'Thursday  .  May 1  .  4 athletes',
          font=font(9), fill=MUTED, anchor='mm')
draw.line([(sx+10,sy+42),(sx+sw-10,sy+42)], fill=(*MUTED2,60), width=1)
cw7=(sw-26)//2; ch7=112
for i,(n,sc,lb,col) in enumerate([
    ('Marcus O.',87,'PUSH HARD',GREEN),('Tyler N.',72,'TRAIN NORMAL',AMBER),
    ('Priya S.',41,'REST TODAY',RED),  ('Jake T.',78,'TRAIN NORMAL',AMBER)]):
    readiness_card(draw,sx+13+(i%2)*(cw7+8),sy+50+(i//2)*(ch7+8),cw7,ch7,n,sc,lb,col)
rr(draw,sx+12,sy+304,sx+sw-12,sy+334, radius=9,
   fill=CARD2, outline=(*ACCENT,35), width=1)
draw.text((sx+sw//2,sy+319),'Avg: 69.5  .  2 need attention',
          font=font(10,True), fill=WHITE, anchor='mm')
rr(draw,sx+12,sy+342,sx+sw-12,sy+370, radius=9,
   fill=blend(BG,ACCENT,28), outline=(*ACCENT,70), width=1)
draw.text((sx+sw//2,sy+356),'Share check-in link with athletes',
          font=font(10,True), fill=ACCENT, anchor='mm')
tab_bar(draw,sx,sy+sh-24,sw,24,'Brief')

draw.line([(120,1278),(960,1278)], fill=(*ACCENT,30), width=1)
fy3=1302
for col,t,s in [
    (GREEN,'Morning Brief','Daily readiness score for every athlete'),
    (RED,'Fight Countdowns','Auto weight-cut calculator per fighter'),
    (AMBER,'AI Workouts','New session plan in 10 seconds'),
    (ACCENT,'Offline Timer','Round timer — works ringside, no signal'),
    (PURPLE,'PDF Reports','Shareable athlete profiles via WhatsApp'),
]:
    draw.ellipse([120,fy3-8,136,fy3+8], fill=col)
    draw.text((154,fy3),t, font=font(22,True), fill=WHITE, anchor='lm')
    draw.text((154,fy3+26),s, font=font(17), fill=MUTED, anchor='lm')
    fy3+=66

draw.line([(120,1644),(960,1644)], fill=(*ACCENT,40), width=1)
cta_btn(draw,120,1664,840,74,'$99 one-time  .  No subscription',fsize=28)
draw.text((W//2,1752),'30-day money-back guarantee',
          font=font(20), fill=(*GREEN,210), anchor='mm')
draw.text((W//2,1806),'Try free: strikepanel.vercel.app/demo',
          font=font(19,True), fill=(*WHITE,150), anchor='mm')
draw.text((W//2,1854),'strikepanel.vercel.app',
          font=font(24,True), fill=(*ACCENT,190), anchor='mm')

img.convert('RGB').save(f'{OUT}/instagram-story-1080x1920.png', quality=96)
print('3/5  instagram-story-1080x1920.png')

# ──────────────────────────────────────────────────────────
# 4. TWITTER / X BANNER  1500 × 500
# ──────────────────────────────────────────────────────────
W, H = 1500, 500
img = Image.new('RGBA', (W,H), (*BG,255))
img = soft_glow(img, 240, 250, 380, ACCENT, alpha=10)
draw = ImageDraw.Draw(img)
top_accent(draw, W)
draw.line([(0,H-1),(W,H-1)], fill=(*ACCENT,35), width=1)
draw.line([(300,40),(300,460)], fill=(*MUTED2,35), width=1)

draw_sp_logo(draw, 152, 250, 96)
draw.text((322,168),'STRIKEPANEL', font=font(62,True), fill=WHITE, anchor='lm')
draw.text((322,240),'TRAINING INTELLIGENCE', font=font(21,True), fill=ACCENT, anchor='lm')
draw.text((322,272),'for Combat Sports Coaches', font=font(19), fill=MUTED, anchor='lm')
draw.line([(322,300),(1080,300)], fill=(*ACCENT,40), width=1)
fx3=322
for feat in ['Morning Brief','Fight Countdowns','AI Workouts','Offline Timer','PDF Reports']:
    fw3=len(feat)*8+20
    feat_pill(draw, fx3,312,fw3,30, feat)
    fx3+=fw3+8

# Right price card
rr(draw,1148,68,1456,432, radius=16, fill=CARD, outline=(*ACCENT,50), width=1)
draw.line([(1158,70),(1446,70)], fill=ACCENT, width=2)
draw.text((1302,148),'$99', font=font(64,True), fill=ACCENT, anchor='mm')
draw.text((1302,200),'Founding Price', font=font(19,True), fill=WHITE, anchor='mm')
draw.line([(1178,222),(1426,222)], fill=(*MUTED2,50), width=1)
draw.text((1302,248),'One-time payment', font=font(15), fill=MUTED, anchor='mm')
draw.text((1302,274),'No subscription ever', font=font(15), fill=MUTED, anchor='mm')
draw.text((1302,300),'30-day guarantee', font=font(15), fill=GREEN, anchor='mm')
cta_btn(draw,1178,326,248,44,'Lock in $99 →',fsize=16)
draw.text((1302,394),'strikepanel.vercel.app',
          font=font(13), fill=(*MUTED,110), anchor='mm')

img.convert('RGB').save(f'{OUT}/twitter-banner-1500x500.png', quality=96)
print('4/5  twitter-banner-1500x500.png')

# ──────────────────────────────────────────────────────────
# 5. WHATSAPP SHARE CARD  800 × 420
# ──────────────────────────────────────────────────────────
W, H = 800, 420
img = Image.new('RGBA', (W,H), (*BG,255))
img = soft_glow(img, 140, 180, 280, ACCENT, alpha=10)
draw = ImageDraw.Draw(img)
top_accent(draw, W)
draw.line([(0,H-1),(W,H-1)], fill=(*ACCENT,35), width=1)

draw_sp_logo(draw, 104, 210, 68)
draw.line([(188,45),(188,375)], fill=(*MUTED2,50), width=1)

draw.text((214,78),'STRIKEPANEL', font=font(30,True), fill=WHITE, anchor='lm')
draw.text((214,116),'Training Intelligence for Combat Coaches',
          font=font(14), fill=MUTED, anchor='lm')
draw.line([(214,140),(770,140)], fill=(*ACCENT,45), width=1)

fy4=160
for col,txt in [
    (GREEN, 'Daily readiness brief for every athlete'),
    (RED,   'Fight countdowns + auto weight-cut plans'),
    (AMBER, 'AI workouts + offline boxing round timer'),
    (ACCENT,'PDF reports  .  Works offline  .  Up to 20 athletes'),
]:
    draw.ellipse([214,fy4-6,226,fy4+6], fill=col)
    draw.text((240,fy4), txt, font=font(14), fill=MUTED, anchor='lm')
    fy4+=33

draw.line([(214,308),(770,308)], fill=(*MUTED2,40), width=1)
cta_btn(draw,214,320,334,42,'$99 one-time  .  Try free demo',fsize=13)
draw.text((572,341),'strikepanel.vercel.app',
          font=font(12), fill=(*MUTED,130), anchor='lm')

img.convert('RGB').save(f'{OUT}/whatsapp-share-card-800x420.png', quality=96)
print('5/5  whatsapp-share-card-800x420.png\n')
