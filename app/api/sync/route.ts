import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET!;

function coachToken(licenseKey: string): string {
  return createHmac('sha256', INTERNAL_SECRET).update(licenseKey).digest('hex').slice(0, 16);
}

async function sb(path: string, options: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    },
  });
}

async function verifyLicense(key: string): Promise<{ valid: boolean; trialExpired?: boolean }> {
  const res = await sb(`licenses?license_key=eq.${encodeURIComponent(key)}&select=status,trial_expires_at`);
  if (!res.ok) return { valid: false };
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return { valid: false };
  const row = rows[0];
  if (row.status !== 'active') return { valid: false };
  if (row.trial_expires_at && new Date(row.trial_expires_at) < new Date()) {
    return { valid: false, trialExpired: true };
  }
  return { valid: true };
}

function getAuthKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || '';
  const key = auth.replace(/^Bearer\s+/i, '').trim();
  return key ? key.toUpperCase() : null;
}

export async function GET(req: NextRequest) {
  const key = getAuthKey(req);
  if (!key) return NextResponse.json({ ok: false }, { status: 401 });

  const { valid, trialExpired } = await verifyLicense(key);
  if (!valid) return NextResponse.json({ ok: false, trial_expired: trialExpired ?? false }, { status: 401 });

  // ?action=token → derive and return coach token for share links
  if (req.nextUrl.searchParams.get('action') === 'token') {
    return NextResponse.json({ ok: true, token: coachToken(key) });
  }

  const res = await sb(`coach_data?license_key=eq.${encodeURIComponent(key)}&select=state`);
  if (!res.ok) return NextResponse.json({ ok: true, state: null });
  const rows = await res.json();
  const state = Array.isArray(rows) && rows.length > 0 ? rows[0].state : null;
  return NextResponse.json({ ok: true, state });
}

export async function POST(req: NextRequest) {
  const key = getAuthKey(req);
  if (!key) return NextResponse.json({ ok: false }, { status: 401 });

  const { valid, trialExpired } = await verifyLicense(key);
  if (!valid) return NextResponse.json({ ok: false, trial_expired: trialExpired ?? false }, { status: 401 });

  const body = await req.json();
  const { state } = body;
  if (!state || typeof state !== 'object') {
    return NextResponse.json({ ok: false, msg: 'Invalid state' }, { status: 400 });
  }

  const token = coachToken(key);

  const upsertRes = await sb('coach_data', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      license_key: key,
      coach_token: token,
      state,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!upsertRes.ok) {
    const err = await upsertRes.text();
    console.error('[sync] Supabase error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
