import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

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

async function findByToken(token: string) {
  const res = await sb(`coach_data?coach_token=eq.${encodeURIComponent(token)}&select=license_key,state`);
  if (!res.ok) return null;
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const row = rows[0];
  // Validate license is still active and not expired
  const licRes = await sb(`licenses?license_key=eq.${encodeURIComponent(row.license_key)}&select=status,trial_expires_at`);
  if (!licRes.ok) return null;
  const licRows = await licRes.json();
  if (!Array.isArray(licRows) || licRows.length === 0) return null;
  const lic = licRows[0];
  if (lic.status !== 'active') return null;
  if (lic.trial_expires_at && new Date(lic.trial_expires_at) < new Date()) return null;
  return row;
}

// GET /api/checkin?coach=TOKEN → athlete roster for the check-in form
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('coach');
  if (!token) return NextResponse.json({ ok: false, athletes: [] }, { status: 400 });

  const coach = await findByToken(token);
  if (!coach) return NextResponse.json({ ok: true, athletes: [] });

  const athletes = Array.isArray(coach.state?.main?.athletes)
    ? coach.state.main.athletes.map((a: any) => ({ id: a.id, name: a.name }))
    : [];
  return NextResponse.json({ ok: true, athletes });
}

// POST /api/checkin → athlete submits readiness
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { coach: token, ...entry } = body;

  if (!token) return NextResponse.json({ ok: false, msg: 'Missing coach token' }, { status: 400 });

  const coach = await findByToken(token);
  if (!coach) return NextResponse.json({ ok: false, msg: 'Coach not found' }, { status: 404 });

  const state = coach.state || {};
  const readiness = Array.isArray(state.readiness) ? state.readiness : [];

  if (!readiness.find((e: any) => e?.id === entry.id)) {
    readiness.unshift({
      ...entry,
      source: 'athlete',
      ts: entry.ts || Date.now(),
      date: entry.date || new Date().toISOString().slice(0, 10),
    });
  }
  state.readiness = readiness;

  const timeline = Array.isArray(state.timeline) ? state.timeline : [];
  timeline.unshift({
    id: String(entry.id) + '_tl',
    ts: Date.now(),
    type: 'checkin',
    athName: entry.athName,
    text: `Readiness score: ${entry.score}/100`,
  });
  state.timeline = timeline.slice(0, 200);

  const patchRes = await sb(
    `coach_data?license_key=eq.${encodeURIComponent(coach.license_key)}`,
    {
      method: 'PATCH',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify({ state, updated_at: new Date().toISOString() }),
    }
  );

  if (!patchRes.ok) {
    const err = await patchRes.text();
    console.error('[checkin] Supabase error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
