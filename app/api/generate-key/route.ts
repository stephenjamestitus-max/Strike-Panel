import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET!;

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

function generateKey(): string {
  const bytes = randomBytes(12);
  const hex = bytes.toString('hex').toUpperCase();
  // Format: SP-XXXX-XXXX-XXXX
  return `SP-${hex.slice(0,4)}-${hex.slice(4,8)}-${hex.slice(8,12)}`;
}

export async function POST(req: NextRequest) {
  try {
    // Require internal secret so only your webhook handler can call this
    const { secret, platform, trial_expires_at, email } = await req.json();
    if (secret !== INTERNAL_SECRET) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const key = generateKey();

    const res = await supabase('licenses', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        license_key: key,
        activations: 0,
        max_activations: 3,
        status: 'active',
        platform: platform || 'manual',
        ...(trial_expires_at ? { trial_expires_at } : {}),
        ...(email ? { email } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[generate-key] Supabase error:', err);
      return NextResponse.json({ ok: false, msg: 'Failed to store key.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, key });
  } catch (e) {
    console.error('[generate-key]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
