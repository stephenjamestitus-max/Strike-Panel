"""
StrikePanel Marketing Image Generator
Uses real screenshots: user desktop shots + 3x DPR Puppeteer phone shots.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

SRC = os.path.join(os.path.dirname(__file__), 'sp-media')
OUT = os.path.join(os.path.dirname(__file__), 'marketing')
os.makedirs(OUT, exist_ok=True)

BG     = (10, 14, 20)
ACCENT = (0, 212, 240)
RED    = (255, 59, 59)
GREEN  = (0, 255, 136)
MUTED  = (100, 116, 139)
WHITE  = (255, 255, 255)

BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
REG  = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'

def font(path, size): return ImageFont.truetype(path, size)
def save(img, name):
    img.save(os.path.join(OUT, name), 'PNG', optimize=True)
    print(f'  {name}  ({img.size[0]}x{img.size[1]})')
def sharpen(img):
    return img.filter(ImageFilter.UnsharpMask(radius=0.6, percent=130, threshold=2))
def load(fname):
    return Image.open(os.path.join(SRC, fname)).convert('RGB')

S = {
    'dashboard':     load('01.png'),
    'morning_brief': load('02.png'),
    'members':       load('04.png'),
    'workouts':      load('05.png'),
    'progress':      load('06.png'),
    'phone_brief':   load('phone-morning-brief-3x.png'),
    'phone_fights':  load('phone-fight-dates-3x.png'),
    'phone_timer':   load('phone-timer-3x.png'),
    'phone_dash':    load('phone-dashboard-3x.png'),
}

def fit(img, max_w, max_h=None):
    w, h = img.size
    if max_h:
        scale = min(max_w/w, max_h/h, 1.0)
    else:
        scale = min(max_w/w, 1.0)
    if scale < 1.0:
        img = img.resize((int(w*scale), int(h*scale)), Image.LANCZOS)
    return sharpen(img)

def rounded_paste(base, img, xy, radius=8):
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([(0,0), img.size], radius=radius, fill=255)
    base.paste(img, xy, mask)

def laptop_frame(src_key, frame_w):
    img = S[src_key]
    sw, sh = img.size
    scale = min(frame_w/sw, 1.0)
    sw2, sh2 = int(sw*scale), int(sh*scale)
    screen = sharpen(img.resize((sw2, sh2), Image.LANCZOS))
    bz, top, base_h = 14, 30, 42
    fw, fh = sw2+bz*2, sh2+bz+top+base_h
    c = Image.new('RGBA', (fw, fh), (0,0,0,0))
    d = ImageDraw.Draw(c)
    lid_h = sh2+bz+top
    d.rounded_rectangle([(0,0),(fw-1,lid_h)], radius=12, fill=(20,26,38), outline=(38,48,64), width=1)
    d.ellipse([(fw//2-3,12),(fw//2+3,18)], fill=(44,55,72))
    d.rounded_rectangle([(bz,top),(fw-bz-1,top+sh2)], radius=5, fill=(8,12,18))
    rounded_paste(c, screen, (bz, top), radius=5)
    d.rounded_rectangle([(0,lid_h),(fw-1,lid_h+base_h-1)], radius=7, fill=(16,22,32), outline=(38,48,64), width=1)
    tpw, tph = 110, 20
    tpx, tpy = (fw-tpw)//2, lid_h+(base_h-tph)//2
    d.rounded_rectangle([(tpx,tpy),(tpx+tpw,tpy+tph)], radius=4, fill=(26,33,46), outline=(42,52,68), width=1)
    return c

def phone_frame(src_key, frame_w):
    img = S[src_key]
    sw, sh = img.size
    scale = min(frame_w/sw, 1.0)
    sw2, sh2 = int(sw*scale), int(sh*scale)
    screen = sharpen(img.resize((sw2, sh2), Image.LANCZOS))
    bx, bt, bb = 14, 58, 54
    fw, fh = sw2+bx*2, sh2+bt+bb
    c = Image.new('RGBA', (fw, fh), (0,0,0,0))
    d = ImageDraw.Draw(c)
    d.rounded_rectangle([(0,0),(fw-1,fh-1)], radius=38, fill=(20,26,38), outline=(38,48,64), width=2)
    nw = 72; nx = (fw-nw)//2
    d.rounded_rectangle([(nx,0),(nx+nw,21)], radius=11, fill=(10,14,22))
    d.ellipse([(fw//2-4,8),(fw//2+4,16)], fill=(28,35,50))
    d.rounded_rectangle([(bx,bt),(bx+sw2,bt+sh2)], radius=5, fill=(8,12,18))
    rounded_paste(c, screen, (bx, bt), radius=5)
    bw = 90; bx2 = (fw-bw)//2
    d.rounded_rectangle([(bx2,fh-18),(bx2+bw,fh-12)], radius=4, fill=(55,65,82))
    return c


def make_gumroad_cover():
    W, H = 1200, 630
    canvas = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(canvas)
    for x in range(0,W,60): d.line([(x,0),(x,H)], fill=(16,22,30), width=1)
    for y in range(0,H,60): d.line([(0,y),(W,y)], fill=(16,22,30), width=1)
    glow = Image.new('RGB',(W,H),BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(-80,-80),(480,480)], fill=(0,38,52))
    gd.ellipse([(780,250),(1380,780)], fill=(18,0,38))
    canvas = Image.blend(canvas, glow, 0.55)
    d = ImageDraw.Draw(canvas)
    tx = 64
    d.text((tx,76), 'COMBAT SPORTS  .  TRAINING INTELLIGENCE', font=font(MONO,11), fill=ACCENT)
    d.text((tx,110), 'StrikePanel', font=font(BOLD,62), fill=WHITE)
    d.text((tx,180), 'TRAINING INTELLIGENCE', font=font(MONO,12), fill=MUTED)
    d.rectangle([(tx,206),(tx+280,208)], fill=ACCENT)
    for i,(txt,col) in enumerate([('KNOW WHO',WHITE),('TO PUSH.',ACCENT),('KNOW WHO',WHITE),('TO PROTECT.',RED)]):
        d.text((tx,222+i*66), txt, font=font(BOLD,54), fill=col)
    d.text((tx,504), 'Daily readiness. Fight camp planning.', font=font(REG,16), fill=MUTED)
    d.text((tx,526), 'Round timer. AI workouts. One file.', font=font(REG,16), fill=MUTED)
    d.rounded_rectangle([(tx,560),(tx+138,596)], radius=6, fill=ACCENT)
    d.text((tx+12,570), '$99  LAUNCH', font=font(BOLD,15), fill=BG)
    frame = laptop_frame('morning_brief', frame_w=600)
    fw,fh = frame.size
    canvas.paste(frame, (W-fw-16,(H-fh)//2+8), frame)
    save(canvas, 'gumroad-cover-1200x630.png')


def make_phone_screenshots():
    for name, key in [
        ('phone-fight-dates.png','phone_fights'),
        ('phone-morning-brief.png','phone_brief'),
        ('phone-timer.png','phone_timer'),
        ('phone-dashboard.png','phone_dash'),
    ]:
        frame = phone_frame(key, frame_w=390)
        fw,fh = frame.size
        pad = 30
        out = Image.new('RGB',(fw+pad*2,fh+pad*2),BG)
        out.paste(frame,(pad,pad),frame)
        save(out, name)


def make_laptop_screenshots():
    for name, key in [
        ('laptop-dashboard.png','dashboard'),
        ('laptop-morning-brief.png','morning_brief'),
        ('laptop-workouts.png','workouts'),
        ('laptop-progress.png','progress'),
        ('laptop-members.png','members'),
    ]:
        sw = S[key].size[0]
        frame = laptop_frame(key, frame_w=min(900,sw))
        fw,fh = frame.size
        pad = 40
        out = Image.new('RGB',(fw+pad*2,fh+pad*2),BG)
        out.paste(frame,(pad,pad),frame)
        save(out, name)


def make_instagram_square():
    W = H = 1080
    canvas = Image.new('RGB',(W,H),BG)
    d = ImageDraw.Draw(canvas)
    for x in range(0,W,54): d.line([(x,0),(x,H)], fill=(15,21,30), width=1)
    for y in range(0,H,54): d.line([(0,y),(W,y)], fill=(15,21,30), width=1)
    glow = Image.new('RGB',(W,H),BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(-80,-80),(560,560)], fill=(0,34,48))
    gd.ellipse([(520,520),(1200,1200)], fill=(18,0,34))
    canvas = Image.blend(canvas,glow,0.55)
    d = ImageDraw.Draw(canvas)
    frame = laptop_frame('morning_brief', frame_w=940)
    fw,fh = frame.size
    canvas.paste(frame,((W-fw)//2,(H-fh)//2-40),frame)
    d.text((W//2,H-96),'StrikePanel', font=font(BOLD,38), fill=WHITE, anchor='mm')
    d.text((W//2,H-56),'TRAINING INTELLIGENCE  .  strikepanel.vercel.app', font=font(MONO,13), fill=MUTED, anchor='mm')
    save(canvas, 'instagram-square-1080x1080.png')


def make_instagram_story():
    W,H = 1080,1920
    canvas = Image.new('RGB',(W,H),BG)
    d = ImageDraw.Draw(canvas)
    d.text((W//2,140),'StrikePanel', font=font(BOLD,56), fill=WHITE, anchor='mm')
    d.text((W//2,204),'TRAINING INTELLIGENCE', font=font(MONO,18), fill=ACCENT, anchor='mm')
    d.rectangle([(W//2-130,228),(W//2+130,230)], fill=ACCENT)
    lframe = laptop_frame('morning_brief', frame_w=960)
    lw,lh = lframe.size
    canvas.paste(lframe,((W-lw)//2,264),lframe)
    pframe = phone_frame('phone_fights', frame_w=380)
    pw,ph = pframe.size
    canvas.paste(pframe,((W-pw)//2,264+lh+60),pframe)
    y = H-160
    d.text((W//2,y),'One purchase. Lifetime access.', font=font(BOLD,30), fill=WHITE, anchor='mm')
    d.text((W//2,y+46),'$99 launch price', font=font(BOLD,28), fill=ACCENT, anchor='mm')
    d.text((W//2,y+90),'strikepanel.vercel.app', font=font(MONO,18), fill=MUTED, anchor='mm')
    save(canvas, 'instagram-story-1080x1920.png')


def make_twitter_banner():
    W,H = 1500,500
    canvas = Image.new('RGB',(W,H),BG)
    d = ImageDraw.Draw(canvas)
    for x in range(0,W,60): d.line([(x,0),(x,H)], fill=(15,21,30), width=1)
    for y in range(0,H,60): d.line([(0,y),(W,y)], fill=(15,21,30), width=1)
    glow = Image.new('RGB',(W,H),BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(-100,-100),(600,600)], fill=(0,34,48))
    canvas = Image.blend(canvas,glow,0.45)
    d = ImageDraw.Draw(canvas)
    tx = 72
    d.text((tx,96),'StrikePanel', font=font(BOLD,56), fill=WHITE)
    d.text((tx,162),'TRAINING INTELLIGENCE', font=font(MONO,14), fill=MUTED)
    d.rectangle([(tx,190),(tx+210,192)], fill=ACCENT)
    d.text((tx,206),'Daily readiness briefs.', font=font(REG,22), fill=WHITE)
    d.text((tx,234),'Fight camp planning.', font=font(REG,22), fill=WHITE)
    d.text((tx,262),'Round timer. AI workouts.', font=font(REG,22), fill=WHITE)
    d.text((tx,312),'$99  .  One-time  .  No subscription', font=font(BOLD,18), fill=ACCENT)
    frame = laptop_frame('morning_brief', frame_w=700)
    fw,fh = frame.size
    canvas.paste(frame,(W-fw-20,(H-fh)//2),frame)
    save(canvas, 'twitter-banner-1500x500.png')


def make_whatsapp_card():
    W,H = 800,420
    canvas = Image.new('RGB',(W,H),BG)
    d = ImageDraw.Draw(canvas)
    for x in range(0,W,40): d.line([(x,0),(x,H)], fill=(15,21,30), width=1)
    for y in range(0,H,40): d.line([(0,y),(W,y)], fill=(15,21,30), width=1)
    tx = 48
    d.text((tx,58),'StrikePanel', font=font(BOLD,44), fill=WHITE)
    d.text((tx,112),'TRAINING INTELLIGENCE', font=font(MONO,11), fill=MUTED)
    d.rectangle([(tx,136),(tx+170,138)], fill=ACCENT)
    d.text((tx,152),'Know who to push.', font=font(BOLD,24), fill=ACCENT)
    d.text((tx,184),'Know who to protect.', font=font(BOLD,24), fill=RED)
    d.text((tx,234),'Daily readiness briefs for', font=font(REG,16), fill=WHITE)
    d.text((tx,258),'combat sports coaches.', font=font(REG,16), fill=WHITE)
    d.rounded_rectangle([(tx,302),(tx+210,338)], radius=6, fill=ACCENT)
    d.text((tx+14,312),'Get it for $99  ->', font=font(BOLD,16), fill=BG)
    frame = phone_frame('phone_fights', frame_w=260)
    fw,fh = frame.size
    canvas.paste(frame,(W-fw-28,(H-fh)//2),frame)
    save(canvas, 'whatsapp-share-card-800x420.png')


def make_landing_images():
    media_dir = os.path.join(os.path.dirname(__file__), 'media')
    os.makedirs(media_dir, exist_ok=True)
    frame = laptop_frame('morning_brief', frame_w=800)
    fw,fh = frame.size
    out = Image.new('RGB',(fw+40,fh+40),BG)
    out.paste(frame,(20,20),frame)
    out.save(os.path.join(media_dir,'screen-laptop.png'),'PNG',optimize=True)
    print(f'  media/screen-laptop.png  ({out.size[0]}x{out.size[1]})')
    frame = phone_frame('phone_fights', frame_w=300)
    fw,fh = frame.size
    out = Image.new('RGB',(fw+20,fh+20),BG)
    out.paste(frame,(10,10),frame)
    out.save(os.path.join(media_dir,'screen-mobile.png'),'PNG',optimize=True)
    print(f'  media/screen-mobile.png  ({out.size[0]}x{out.size[1]})')
    for fname, key in [('dashboard.png','dashboard'),('morning-brief.png','morning_brief'),
                       ('members.png','members'),('workouts.png','workouts'),('progress.png','progress')]:
        S[key].save(os.path.join(media_dir,fname),'PNG')
        print(f'  media/{fname}')


if __name__ == '__main__':
    print('\n-- Marketing images --')
    make_gumroad_cover()
    make_phone_screenshots()
    make_laptop_screenshots()
    make_instagram_square()
    make_instagram_story()
    make_twitter_banner()
    make_whatsapp_card()
    print('\n-- Landing page device images --')
    make_landing_images()
    print('\nDone.')
