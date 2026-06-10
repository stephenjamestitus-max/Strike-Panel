import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const INTERNAL_SECRET = process.env.INTERNAL_SECRET!;
const LEMON_SQUEEZY_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
const PAYHIP_SECRET = process.env.PAYHIP_WEBHOOK_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://strikepanel.uk';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

async function sbFetch(path: string, options: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
}

// If buyer email matches an existing trial, convert it to paid (preserves all coach data)
async function convertTrialToPaid(email: string, platform: string): Promise<string | null> {
  const res = await sbFetch(
    `licenses?email=eq.${encodeURIComponent(email.toLowerCase())}&platform=eq.trial&status=eq.active&select=license_key`
  );
  if (!res.ok) return null;
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const trialKey = rows[0].license_key;
  const patch = await sbFetch(`licenses?license_key=eq.${encodeURIComponent(trialKey)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ trial_expires_at: null, platform }),
  });
  return patch.ok ? trialKey : null;
}

async function generateKey(platform: string): Promise<string | null> {
  const res = await fetch(`${APP_URL}/api/generate-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: INTERNAL_SECRET, platform }),
  });
  const data = await res.json();
  return data.ok ? data.key : null;
}

async function resolveKey(email: string, platform: string): Promise<string | null> {
  return (await convertTrialToPaid(email, platform)) ?? (await generateKey(platform));
}

function purchaseEmail(key: string): string {
  return `<!DOCTYPE html>
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

    <tr><td style="padding:28px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05)">
      <span style="font-family:'Courier New',monospace;font-size:15px;font-weight:700;letter-spacing:4px;color:#f5f0e8">STRIKE</span><span style="font-family:'Courier New',monospace;font-size:15px;font-weight:700;letter-spacing:4px;color:#00D4F0">PANEL</span><span style="font-family:'Courier New',monospace;font-size:8px;color:rgba(0,212,240,0.45);vertical-align:super;letter-spacing:1px">™</span>
    </td></tr>

    <tr><td style="padding:36px 40px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
      <h1 style="font-family:'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;color:#f5f0e8;line-height:1.15;margin:0 0 20px">YOU'RE IN.<br>LIFETIME ACCESS.</h1>
      <div style="width:40px;height:2px;background:#00D4F0;margin:0 0 24px"></div>
      <p style="font-size:14px;line-height:1.75;color:#7a85a0;margin:0 0 16px">One payment. Every feature. All future updates — yours permanently. Here's your key.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0">
        <tr><td style="background:#04070f;border:1px solid rgba(0,212,240,0.3);border-radius:10px;padding:24px;text-align:center">
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:3px;color:rgba(122,133,160,0.55);margin-bottom:12px">YOUR LICENSE KEY</div>
          <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;letter-spacing:5px;color:#00D4F0">${key}</div>
          <div style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:rgba(122,133,160,0.35);margin-top:10px">COPY &amp; PASTE INTO THE APP</div>
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>
          <td style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;color:#f5f0e8;padding-bottom:12px">HOW TO ACTIVATE</td>
        </tr>
        <tr><td style="font-size:13px;line-height:2;color:#7a85a0">
          1. Open <a href="${APP_URL}/app" style="color:#00D4F0;text-decoration:none">${APP_URL}/app</a><br>
          2. Paste your key on the activation screen<br>
          3. Add your first athlete &amp; send them a check-in link<br>
          4. Works on up to 3 devices
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
        <tr><td align="center">
          <a href="${APP_URL}/app" style="display:inline-block;background:#00D4F0;color:#04070f;font-family:'Courier New',monospace;font-weight:700;font-size:12px;letter-spacing:3px;text-decoration:none;padding:14px 32px;border-radius:8px">OPEN STRIKEPANEL →</a>
        </td></tr>
      </table>

      <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:1.5px;color:rgba(122,133,160,0.4);margin:16px 0 0;line-height:1.8">WORKS ON UP TO 3 DEVICES &nbsp;·&nbsp; NO SUBSCRIPTION &nbsp;·&nbsp; ALL FUTURE UPDATES INCLUDED</p>
    </td></tr>

    <tr><td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.05)">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1.5px;color:rgba(122,133,160,0.4);line-height:1.8">
        STRIKEPANEL.UK &nbsp;·&nbsp; REPLY TO THIS EMAIL FOR SUPPORT
      </p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function sendKeyEmail(email: string, key: string, platform: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[purchase-webhook] KEY FOR ${email}: ${key}`);
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'StrikePanel <onboarding@resend.dev>',
      reply_to: 'corepanelv1@gmail.com',
      to: email,
      subject: "You're in — here's your StrikePanel license key",
      html: purchaseEmail(key),
    }),
  });
}

// ── Lemon Squeezy webhook ─────────────────────────────────────────
async function handleLemonSqueezy(req: NextRequest, body: string) {
  const sig = req.headers.get('x-signature');
  if (LEMON_SQUEEZY_SECRET && sig) {
    const expected = createHmac('sha256', LEMON_SQUEEZY_SECRET).update(body).digest('hex');
    if (sig !== expected) return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const eventName = payload.meta?.event_name;
  if (eventName !== 'order_created') return NextResponse.json({ ok: true });

  const email = payload.data?.attributes?.user_email;
  if (!email) return NextResponse.json({ ok: false, msg: 'No email' }, { status: 400 });

  const key = await resolveKey(email, 'lemonsqueezy');
  if (!key) return NextResponse.json({ ok: false, msg: 'Key generation failed' }, { status: 500 });

  await sendKeyEmail(email, key, 'lemonsqueezy');
  console.log(`[lemon-squeezy] Order for ${email} → ${key}`);
  return NextResponse.json({ ok: true });
}

// ── Payhip webhook ────────────────────────────────────────────────
async function handlePayhip(req: NextRequest, body: string) {
  const payload = JSON.parse(body);

  // Payhip sends their API key as payhip_key in every webhook POST body
  if (PAYHIP_SECRET && payload.payhip_key !== PAYHIP_SECRET) {
    console.error('[payhip] Auth failed — payhip_key mismatch');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const email = payload.buyer_email;
  if (!email) {
    console.error('[payhip] No buyer_email in payload:', JSON.stringify(payload));
    return NextResponse.json({ ok: false, msg: 'No email' }, { status: 400 });
  }

  const key = await resolveKey(email, 'payhip');
  if (!key) return NextResponse.json({ ok: false, msg: 'Key generation failed' }, { status: 500 });

  await sendKeyEmail(email, key, 'payhip');
  console.log(`[payhip] Order for ${email} → ${key}`);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const platform = req.nextUrl.searchParams.get('platform') || 'lemonsqueezy';

  if (platform === 'payhip') return handlePayhip(req, body);
  return handleLemonSqueezy(req, body);
}
