import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://strikepanel.uk';

async function sb(path: string, options: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {}),
    },
  });
}

function generateKey(): string {
  const hex = randomBytes(12).toString('hex').toUpperCase();
  return `SP-${hex.slice(0,4)}-${hex.slice(4,8)}-${hex.slice(8,12)}`;
}

async function sendTrialEmail(email: string, key: string, expiresAt: string) {
  if (!RESEND_API_KEY) {
    console.log(`[trial] No RESEND_API_KEY — trial key for ${email}: ${key}`);
    return;
  }
  const expiry = new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'StrikePanel <noreply@strikepanel.uk>',
      to: [email],
      subject: 'Your StrikePanel 14-day trial key',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#04070f;color:#f5f0e8;padding:40px 32px;border-radius:12px">
          <div style="font-size:11px;letter-spacing:4px;color:#00D4F0;text-transform:uppercase;margin-bottom:24px">StrikePanel</div>
          <h1 style="font-size:28px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px">Your 14-day trial is live.</h1>
          <p style="color:#7a85a0;font-size:14px;line-height:1.6;margin:0 0 32px">Full access. No credit card. Expires ${expiry}.</p>
          <div style="background:#060d1a;border:1px solid rgba(0,212,240,0.25);border-radius:10px;padding:20px 24px;margin-bottom:32px">
            <div style="font-size:10px;letter-spacing:3px;color:#4a5568;text-transform:uppercase;margin-bottom:8px">Your trial key</div>
            <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#00D4F0;letter-spacing:2px">${key}</div>
          </div>
          <a href="${APP_URL}/app" style="display:block;background:linear-gradient(135deg,#c8892a,#e0a83a);color:#000;font-weight:700;border-radius:100px;padding:14px 28px;font-size:15px;text-align:center;text-decoration:none;margin-bottom:24px">Open StrikePanel →</a>
          <p style="color:#3a4460;font-size:11px;line-height:1.6">Enter the key when the app asks. After your trial, get lifetime access for $99 — one payment, no subscription.</p>
        </div>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ ok: false, msg: 'Valid email required.' }, { status: 400 });
    }
    const normalEmail = email.trim().toLowerCase();

    // One trial per email
    const existing = await sb(`licenses?trial_email=eq.${encodeURIComponent(normalEmail)}&select=license_key,trial_expires_at`);
    const rows = await existing.json();
    if (Array.isArray(rows) && rows.length > 0) {
      const prev = rows[0];
      const expired = prev.trial_expires_at && new Date(prev.trial_expires_at) < new Date();
      if (!expired) {
        return NextResponse.json({ ok: false, msg: 'A trial key was already sent to this email. Check your inbox.' });
      }
    }

    const key = generateKey();
    const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const res = await sb('licenses', {
      method: 'POST',
      body: JSON.stringify({
        license_key: key,
        activations: 0,
        max_activations: 1,
        status: 'active',
        platform: 'trial',
        trial_email: normalEmail,
        trial_expires_at: trialExpiresAt,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[trial] Supabase error:', err);
      return NextResponse.json({ ok: false, msg: 'Could not create trial. Try again.' }, { status: 500 });
    }

    await sendTrialEmail(normalEmail, key, trialExpiresAt);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[trial]', e);
    return NextResponse.json({ ok: false, msg: 'Server error — try again.' }, { status: 500 });
  }
}
