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

const SHELL = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#04070f;font-family:monospace">
<div style="max-width:520px;margin:0 auto;padding:48px 32px">
  <div style="margin-bottom:32px">
    <span style="font-size:18px;letter-spacing:3px;color:#f5f0e8">STRIKE</span><span style="font-size:18px;letter-spacing:3px;color:#00D4F0">PANEL</span><sup style="font-size:8px;color:rgba(0,212,240,0.5);letter-spacing:.5px">™</sup>
  </div>
  ${content}
  <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);font-size:10px;letter-spacing:1.5px;color:rgba(122,133,160,0.45)">
    strikepanel.uk &nbsp;·&nbsp; support@strikepanel.com &nbsp;·&nbsp; You received this because you started a trial.
  </div>
</div>
</body>
</html>`;

const KEY_BOX = (key: string) => `
<div style="background:#0a1222;border:1px solid rgba(0,212,240,0.25);border-radius:8px;padding:20px 24px;margin:24px 0;text-align:center">
  <div style="font-size:11px;letter-spacing:2px;color:rgba(122,133,160,0.6);margin-bottom:10px">YOUR TRIAL KEY</div>
  <div style="font-size:18px;letter-spacing:4px;color:#00D4F0">${key}</div>
</div>`;

const BUY_BTN = `
<a href="https://payhip.com/Strikepanel" style="display:block;background:linear-gradient(135deg,#c8892a,#e0a83a);color:#000;font-weight:700;border-radius:8px;padding:14px 24px;font-size:13px;letter-spacing:2px;text-align:center;text-decoration:none;margin:24px 0">
  GET LIFETIME ACCESS — $99 →
</a>
<div style="font-size:10px;letter-spacing:1.5px;color:rgba(122,133,160,0.5);text-align:center;margin-bottom:8px">ONE PAYMENT · NO SUBSCRIPTION · ALL FUTURE UPDATES</div>`;

function emailDay0(key: string, expiresLabel: string): string {
  return SHELL(`
    <div style="font-size:28px;letter-spacing:2px;color:#f5f0e8;line-height:1.1;margin-bottom:8px">YOUR TRIAL<br>HAS STARTED.</div>
    <div style="width:40px;height:2px;background:#00D4F0;margin:16px 0"></div>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0;margin:0 0 4px">
      You've got 14 days of full access. Here's your key — paste it into the app and you're live in under a minute.
    </p>
    ${KEY_BOX(key)}
    <div style="font-size:12px;line-height:1.9;color:#7a85a0">
      <strong style="color:#f5f0e8;letter-spacing:1px">HOW TO ACTIVATE</strong><br>
      1. Go to <a href="${APP_URL}/app" style="color:#00D4F0">${APP_URL}/app</a><br>
      2. Paste your key in the activation screen<br>
      3. Add your first athlete and run a check-in
    </div>
    <div style="margin-top:20px;font-size:11px;letter-spacing:1.5px;color:rgba(122,133,160,0.5)">
      TRIAL EXPIRES: ${expiresLabel} &nbsp;·&nbsp; WORKS ON 3 DEVICES
    </div>
  `);
}

function emailDay3(key: string): string {
  return SHELL(`
    <div style="font-size:26px;letter-spacing:2px;color:#f5f0e8;line-height:1.1;margin-bottom:8px">HAVE YOU ADDED<br>YOUR FIRST FIGHTER?</div>
    <div style="width:40px;height:2px;background:#00D4F0;margin:16px 0"></div>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      You're 3 days in. If you haven't activated yet, here's your key again — it takes 60 seconds.
    </p>
    ${KEY_BOX(key)}
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      Once you've added an athlete: send them their check-in link. You'll see their readiness score before your next session. That's the moment most coaches realise what they've been missing.
    </p>
    <div style="font-size:12px;line-height:1.9;color:#7a85a0;margin-top:4px">
      → <a href="${APP_URL}/app" style="color:#00D4F0">Open StrikePanel →</a>
    </div>
  `);
}

function emailDay7(): string {
  return SHELL(`
    <div style="font-size:26px;letter-spacing:2px;color:#f5f0e8;line-height:1.1;margin-bottom:8px">7 DAYS IN.<br>7 DAYS LEFT.</div>
    <div style="width:40px;height:2px;background:#00D4F0;margin:16px 0"></div>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      By now you should have athletes in the system, check-in data coming in, and at least one AI session plan generated.
    </p>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      If that's you — you already know. If not, you've still got a week to see what changes when you know your athletes' readiness before they walk in.
    </p>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      Either way — the data you've built over these 7 days stays with your account. When your trial ends, you get to decide if it's worth $99 to keep it.
    </p>
    <p style="font-size:11px;letter-spacing:1.5px;color:rgba(122,133,160,0.5)">One payment. No subscription. All future updates.</p>
    ${BUY_BTN}
  `);
}

function emailDay12(): string {
  return SHELL(`
    <div style="font-size:26px;letter-spacing:2px;color:#f5f0e8;line-height:1.1;margin-bottom:8px">YOUR TRIAL ENDS<br>IN 2 DAYS.</div>
    <div style="width:40px;height:2px;background:#00D4F0;margin:16px 0"></div>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      Your athletes are in the system. Your check-in history is there. Your session logs are saved.
    </p>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      In 2 days, the app locks. Everything you built stays — but you won't be able to access it until you grab the lifetime license.
    </p>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      $99. One time. You never pay again — not next month, not next year.
    </p>
    ${BUY_BTN}
    <p style="font-size:11px;letter-spacing:1.5px;color:rgba(122,133,160,0.5)">
      You're also covered by a 30-day money-back guarantee. Buy today and you still have another 16 days to decide risk-free.
    </p>
  `);
}

function emailDay14(): string {
  return SHELL(`
    <div style="font-size:26px;letter-spacing:2px;color:#f5f0e8;line-height:1.1;margin-bottom:8px">YOUR 14 DAYS<br>ARE UP.</div>
    <div style="width:40px;height:2px;background:#00D4F0;margin:16px 0"></div>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      Your trial has ended. Everything you built — your athletes, check-in data, session history — is saved and waiting.
    </p>
    <p style="font-size:13px;line-height:1.75;color:#7a85a0">
      If you saw what it can do for your coaching, you already know what to do. If life got in the way and you didn't get a proper look — the $99 lifetime license comes with a 30-day refund. No questions.
    </p>
    ${BUY_BTN}
    <p style="font-size:11px;letter-spacing:1.5px;color:rgba(122,133,160,0.5)">
      Questions? Reply to this email or reach us at support@strikepanel.com.
    </p>
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

    // Step 1: create the key via the proven generate-key route
    const genRes = await fetch(`${APP_URL}/api/generate-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: INTERNAL_SECRET, platform: 'trial' }),
    });
    const genData = await genRes.json();
    if (!genData.ok || !genData.key) {
      console.error('[trial] generate-key failed:', genData);
      return NextResponse.json({ ok: false, msg: 'Could not create trial — try again.' }, { status: 500 });
    }
    const key = genData.key;

    // Step 2: stamp trial_expires_at on the new row
    const now = new Date();
    const trialExpiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const expiresLabel = trialEnd(now);

    const patchRes = await sb(`licenses?license_key=eq.${encodeURIComponent(key)}`, {
      method: 'PATCH',
      body: JSON.stringify({ trial_expires_at: trialExpiresAt }),
    });
    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error('[trial] PATCH trial_expires_at failed:', err);
      // Key was created — still send email, trial just won't expire correctly
    }

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
