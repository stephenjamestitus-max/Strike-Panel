import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') || 'SP-6CA5-8F15-A5EB';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Missing env vars', SUPABASE_URL: !!SUPABASE_URL, SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY });
  }

  const url = `${SUPABASE_URL}/rest/v1/licenses?license_key=eq.${encodeURIComponent(key)}&select=*`;

  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const text = await res.text();
    return NextResponse.json({ status: res.status, url, body: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
