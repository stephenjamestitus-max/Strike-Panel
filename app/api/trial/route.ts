import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET!;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://strikepanel.uk';

// ── Supabase helper (only used for PATCH trial_expires_at) ────────

async function sb(path: string, options: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...(options.headers ?? {}),
    },
  });
}

// ── Resend email sender ───────────────────────────────────────────

async function send(to: string, subject: string, html: string, scheduledAt?: string) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StrikePanel <onboarding@resend.dev>',
        reply_to: 'corepanelv1@gmail.com',
        to,
        subject,
        html,
        ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
      }),
    });
  } catch (e) {
    console.error('[trial] Email send failed:', e);
  }
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  // Set to 08:00 UTC so emails arrive at a reasonable hour
  d.setUTCHours(8, 0, 0, 0);
  return d.toISOString();
}

function trialEnd(from: Date): string {
  return new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Email HTML templates ──────────────────────────────────────────

const SHELL = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background:#04070f">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#04070f;padding:40px 0">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#080e1a;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden">

    <!-- Header bar -->
    <tr><td style="padding:28px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05)">
      <span style="font-family:'Courier New',monospace;font-size:15px;font-weight:700;letter-spacing:4px;color:#f5f0e8">STRIKE</span><span style="font-family:'Courier New',monospace;font-size:15px;font-weight:700;letter-spacing:4px;color:#00D4F0">PANEL</span><span style="font-family:'Courier New',monospace;font-size:8px;color:rgba(0,212,240,0.45);vertical-align:super;letter-spacing:1px">™</span>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:36px 40px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
      ${content}
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.05)">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1.5px;color:rgba(122,133,160,0.4);line-height:1.8">
        STRIKEPANEL.UK &nbsp;·&nbsp; REPLY TO THIS EMAIL FOR SUPPORT<br>
        You received this because you started a free trial.
      </p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

const KEY_BOX = (key: string) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0">
  <tr><td style="background:#04070f;border:1px solid rgba(0,212,240,0.3);border-radius:10px;padding:24px;text-align:center">
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:3px;color:rgba(122,133,160,0.55);margin-bottom:12px">YOUR TRIAL KEY</div>
    <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;letter-spacing:5px;color:#00D4F0">${key}</div>
    <div style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:rgba(122,133,160,0.35);margin-top:10px">COPY &amp; PASTE INTO THE APP</div>
  </td></tr>
</table>`;

const OPEN_BTN = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
  <tr><td align="center">
    <a href="${APP_URL}/app" style="display:inline-block;background:#00D4F0;color:#04070f;font-family:'Courier New',monospace;font-weight:700;font-size:12px;letter-spacing:3px;text-decoration:none;padding:14px 32px;border-radius:8px">OPEN STRIKEPANEL →</a>
  </td></tr>
</table>`;

const BUY_BTN = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
  <tr><td align="center">
    <a href="https://payhip.com/Strikepanel" style="display:inline-block;background:linear-gradient(135deg,#c8892a,#e0a83a);color:#000;font-family:'Courier New',monospace;font-weight:700;font-size:12px;letter-spacing:3px;text-decoration:none;padding:14px 32px;border-radius:8px">GET LIFETIME ACCESS — $99 →</a>
  </td></tr>
  <tr><td align="center" style="padding-top:10px">
    <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:rgba(122,133,160,0.45)">ONE PAYMENT · NO SUBSCRIPTION · ALL FUTURE UPDATES</span>
  </td></tr>
</table>`;

const H = (text: string) => `<h1 style="font-family:'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:#f5f0e8;line-height:1.15;margin:0 0 20px">${text}</h1>`;
const RULE = `<div style="width:40px;height:2px;background:#00D4F0;margin:0 0 24px"></div>`;
const P = (text: string) => `<p style="font-size:14px;line-height:1.75;color:#7a85a0;margin:0 0 16px">${text}</p>`;
const SMALL = (text: string) => `<p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:1.5px;color:rgba(122,133,160,0.4);margin:16px 0 0;line-height:1.8">${text}</p>`;

function emailDay0(key: string, expiresLabel: string): string {
  return SHELL(`
    ${H('YOUR 14-DAY<br>TRIAL IS LIVE.')}
    ${RULE}
    ${P('Full access. No credit card. Here\'s your key — paste it into the app and you\'re live in under a minute.')}
    ${KEY_BOX(key)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;color:#f5f0e8;padding-bottom:12px">HOW TO ACTIVATE</td>
      </tr>
      <tr><td style="font-size:13px;line-height:2;color:#7a85a0">
        1. Open <a href="${APP_URL}/app" style="color:#00D4F0;text-decoration:none">${APP_URL}/app</a><br>
        2. Paste your key on the activation screen<br>
        3. Add your first athlete &amp; send them a check-in link<br>
        4. See their readiness score before your next session
      </td></tr>
    </table>
    ${OPEN_BTN}
    ${SMALL(`TRIAL EXPIRES: ${expiresLabel.toUpperCase()} &nbsp;·&nbsp; WORKS ON UP TO 3 DEVICES`)}
  `);
}

function emailDay3(key: string): string {
  return SHELL(`
    ${H('HAVE YOU ADDED<br>YOUR FIRST FIGHTER?')}
    ${RULE}
    ${P('Three days in. If you haven\'t activated yet — here\'s your key again. It takes 60 seconds.')}
    ${KEY_BOX(key)}
    ${P('Once you\'ve added an athlete, send them their check-in link. You\'ll see their readiness score before your next session starts.')}
    ${P('That\'s the moment most coaches realise what they\'ve been missing.')}
    ${OPEN_BTN}
  `);
}

function emailDay7(): string {
  return SHELL(`
    ${H('7 DAYS IN.<br>7 DAYS LEFT.')}
    ${RULE}
    ${P('By now you should have athletes in the system, check-in data coming in, and at least one AI session plan generated.')}
    ${P('If that\'s you — you already know what this is worth. If not, you\'ve still got a week to see what changes when you walk into a session already knowing who\'s ready to be pushed and who needs a light day.')}
    ${P('The data you\'ve built stays with your account. When your trial ends, $99 keeps it permanently — no monthly fee, ever.')}
    ${BUY_BTN}
    ${SMALL('30-DAY MONEY-BACK GUARANTEE — NO QUESTIONS ASKED')}
  `);
}

function emailDay12(): string {
  return SHELL(`
    ${H('YOUR TRIAL ENDS<br>IN 2 DAYS.')}
    ${RULE}
    ${P('Your athletes are in the system. Your check-in history is there. Your session logs are saved.')}
    ${P('In 2 days the app locks. Everything you built stays — but you won\'t be able to access it until you grab the lifetime license.')}
    ${P('<strong style="color:#f5f0e8">$99. One time. You never pay again</strong> — not next month, not next year, not ever.')}
    ${BUY_BTN}
    ${SMALL('BUY TODAY AND YOU\'RE STILL COVERED BY A 30-DAY REFUND — THAT\'S 16 MORE DAYS TO DECIDE, RISK-FREE.')}
  `);
}

function emailDay14(): string {
  return SHELL(`
    ${H('YOUR 14 DAYS<br>ARE UP.')}
    ${RULE}
    ${P('Your trial has ended. Everything you built — your athletes, your check-in data, your session history — is saved and waiting.')}
    ${P('If you saw what it does for your coaching, you already know what to do.')}
    ${P('If life got in the way and you didn\'t get a proper look: the lifetime license is $99 and comes with a 30-day refund. No questions asked.')}
    ${BUY_BTN}
    ${SMALL('REPLY TO THIS EMAIL IF YOU HAVE ANY QUESTIONS.')}
  `);
}

// ── Route handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ ok: false, msg: 'Valid email required.' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const now = new Date();
    const trialExpiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const expiresLabel = trialEnd(now);

    const genRes = await fetch(`${APP_URL}/api/generate-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: INTERNAL_SECRET,
        platform: 'trial',
        trial_expires_at: trialExpiresAt,
        email: normalized,
      }),
    });
    const genData = await genRes.json();
    if (!genData.ok || !genData.key) {
      console.error('[trial] generate-key failed:', genData);
      return NextResponse.json({ ok: false, msg: 'Could not create trial — try again.' }, { status: 500 });
    }
    const key = genData.key;

    // Fire-and-forget: schedule all 5 emails via Resend scheduled_at
    void Promise.allSettled([
      send(normalized, 'Your 14-day StrikePanel trial has started', emailDay0(key, expiresLabel)),
      send(normalized, 'Have you added your first fighter yet?', emailDay3(key), daysFromNow(3)),
      send(normalized, "You're halfway through your StrikePanel trial", emailDay7(), daysFromNow(7)),
      send(normalized, 'Your StrikePanel trial ends in 2 days', emailDay12(), daysFromNow(12)),
      send(normalized, 'Your StrikePanel trial has ended', emailDay14(), daysFromNow(14)),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[trial]', e);
    return NextResponse.json({ ok: false, msg: 'Server error — try again.' }, { status: 500 });
  }
}
