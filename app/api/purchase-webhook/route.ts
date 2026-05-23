import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const INTERNAL_SECRET = process.env.INTERNAL_SECRET!;
const LEMON_SQUEEZY_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
const PAYHIP_SECRET = process.env.PAYHIP_WEBHOOK_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://strikepanel.com';

async function generateKey(platform: string): Promise<string | null> {
  const res = await fetch(`${APP_URL}/api/generate-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: INTERNAL_SECRET, platform }),
  });
  const data = await res.json();
  return data.ok ? data.key : null;
}

async function sendKeyEmail(email: string, key: string, platform: string) {
  // Uses Resend if configured, otherwise logs to console
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
      from: 'StrikePanel <noreply@strikepanel.com>',
      to: email,
      subject: 'Your StrikePanel License Key',
      html: `
        <div style="font-family:monospace;background:#04070f;color:#f5f0e8;padding:40px;max-width:500px;margin:0 auto">
          <div style="font-size:22px;letter-spacing:3px;margin-bottom:8px">STRIKE<span style="color:#00D4F0">PANEL</span></div>
          <div style="color:#7a85a0;font-size:12px;letter-spacing:2px;margin-bottom:32px">YOUR LICENSE KEY</div>
          <div style="background:#0a1222;border:1px solid rgba(0,212,240,0.2);border-radius:8px;padding:20px;margin-bottom:24px;text-align:center">
            <div style="font-size:20px;letter-spacing:4px;color:#00D4F0">${key}</div>
          </div>
          <p style="font-size:13px;line-height:1.7;color:#7a85a0">
            1. Go to <a href="https://strikepanel.com" style="color:#00D4F0">strikepanel.com</a><br>
            2. Paste your key in the activation screen<br>
            3. Works on up to 3 devices
          </p>
          <p style="font-size:11px;color:#4a5568;margin-top:24px">
            Need help? Email corepanelv1@gmail.com
          </p>
        </div>
      `,
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

  const key = await generateKey('lemonsqueezy');
  if (!key) return NextResponse.json({ ok: false, msg: 'Key generation failed' }, { status: 500 });

  await sendKeyEmail(email, key, 'lemonsqueezy');
  console.log(`[lemon-squeezy] Order for ${email} → ${key}`);
  return NextResponse.json({ ok: true });
}

// ── Payhip webhook ────────────────────────────────────────────────
async function handlePayhip(req: NextRequest, body: string) {
  const payload = JSON.parse(body);

  // Payhip signs with a secret in the payload
  if (PAYHIP_SECRET && payload.security_token !== PAYHIP_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (payload.type !== 'order.completed') return NextResponse.json({ ok: true });

  const email = payload.buyer_email;
  if (!email) return NextResponse.json({ ok: false, msg: 'No email' }, { status: 400 });

  const key = await generateKey('payhip');
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
