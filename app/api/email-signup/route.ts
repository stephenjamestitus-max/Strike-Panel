import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

async function supabase(path: string, options: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...(options.headers || {}),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ ok: false, msg: 'Valid email required.' }, { status: 400 });
    }

    const res = await supabase('email_signups', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim(), source: source || 'landing' }),
    });

    if (!res.ok) {
      const err = await res.text();
      // Duplicate email — treat as success
      if (err.includes('duplicate') || err.includes('unique')) {
        return NextResponse.json({ ok: true });
      }
      console.error('[email-signup] Supabase error:', err);
      return NextResponse.json({ ok: false, msg: 'Something went wrong.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[email-signup]', e);
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 });
  }
}
