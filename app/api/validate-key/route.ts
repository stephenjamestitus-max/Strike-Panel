import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const MAX_ACTIVATIONS = 3;

async function supabase(path: string, options: RequestInit = {}) {
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

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ ok: false, msg: 'No key provided.' }, { status: 400 });
    }

    const normalized = key.trim().toUpperCase();

    // Fetch the license row
    const res = await supabase(`licenses?license_key=eq.${encodeURIComponent(normalized)}&select=*`);
    const rows = await res.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ ok: false, msg: 'Key not found. Check your purchase email.' });
    }

    const license = rows[0];

    if (license.status !== 'active') {
      return NextResponse.json({ ok: false, msg: 'This key has been revoked. Email support@strikepanel.com.' });
    }

    if (license.trial_expires_at && new Date(license.trial_expires_at) < new Date()) {
      return NextResponse.json({
        ok: false,
        trial_expired: true,
        msg: 'Your 14-day trial has ended. Get lifetime access at strikepanel.uk for $99 — one payment, no subscription.',
      });
    }

    if (license.activations >= MAX_ACTIVATIONS) {
      return NextResponse.json({
        ok: false,
        msg: `Device limit reached (${MAX_ACTIVATIONS} devices). Email support@strikepanel.com to reset.`,
      });
    }

    // Increment activation count
    await supabase(`licenses?license_key=eq.${encodeURIComponent(normalized)}`, {
      method: 'PATCH',
      body: JSON.stringify({ activations: license.activations + 1 }),
    });

    // Let the client know if this is a trial key so it can tag it for future re-verification
    const isTrial = !!license.trial_expires_at;
    return NextResponse.json({ ok: true, ...(isTrial && { trial: true }) });
  } catch (e) {
    console.error('[validate-key]', e);
    return NextResponse.json({ ok: false, msg: 'Server error — try again.' }, { status: 500 });
  }
}
