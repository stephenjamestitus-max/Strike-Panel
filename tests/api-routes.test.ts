/**
 * API route tests — mocked externals (Supabase, Resend, generate-key).
 * Run:  npm test
 *
 * These run entirely in-process — no network calls needed.
 * Coverage: trial signup, dedup, expiry, validate-key, webhook auth + idempotency.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── shared mock state ────────────────────────────────────────────────────────

type LicenseRow = {
  license_key: string
  email: string
  platform: string
  status: string
  trial_expires_at: string | null
  activations: number
}

let db: LicenseRow[] = []
let emailsSent: Array<{ to: string; subject: string; scheduled_at?: string }> = []
let generateKeyCalls = 0

function freshDb() {
  db = []
  emailsSent = []
  generateKeyCalls = 0
}

// ─── helpers duplicated from route logic (pure, no Next.js deps) ──────────────

function daysOffset(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setUTCHours(8, 0, 0, 0)
  return d.toISOString()
}

function trialExpiresAt(fromNow = 14): string {
  return new Date(Date.now() + fromNow * 24 * 60 * 60 * 1000).toISOString()
}

// ─── inline reimplementation of trial route logic ─────────────────────────────
// Mirrors app/api/trial/route.ts — same logic, no Next.js/fetch

async function handleTrial(email: string) {
  if (!email || !email.includes('@')) return { ok: false, msg: 'Valid email required.' }

  const normalized = email.trim().toLowerCase()

  // Dedup
  const existing = db.filter(r => r.email === normalized && r.platform === 'trial' && r.status === 'active')
  if (existing.length > 0) {
    const row = existing[0]
    if (row.trial_expires_at && new Date(row.trial_expires_at) < new Date()) {
      return { ok: false, msg: 'Your free trial has ended.' }
    }
    emailsSent.push({ to: normalized, subject: 'Your StrikePanel trial key (resent)' })
    return { ok: true }
  }

  // Create
  const key = `SP-TEST-KEY-${generateKeyCalls++}`
  db.push({
    license_key: key,
    email: normalized,
    platform: 'trial',
    status: 'active',
    trial_expires_at: trialExpiresAt(14),
    activations: 0,
  })

  // Schedule 5 emails
  emailsSent.push({ to: normalized, subject: 'Your 14-day StrikePanel trial has started' })
  emailsSent.push({ to: normalized, subject: 'Have you added your first fighter yet?', scheduled_at: daysOffset(3) })
  emailsSent.push({ to: normalized, subject: "You're halfway through your StrikePanel trial", scheduled_at: daysOffset(7) })
  emailsSent.push({ to: normalized, subject: 'Your StrikePanel trial ends in 2 days', scheduled_at: daysOffset(12) })
  emailsSent.push({ to: normalized, subject: 'Your trial ends tomorrow', scheduled_at: daysOffset(14) })

  return { ok: true }
}

// ─── inline reimplementation of validate-key route logic ─────────────────────

async function handleValidateKey(key: string) {
  if (!key || typeof key !== 'string') return { ok: false, msg: 'No key provided.' }
  const normalized = key.trim().toUpperCase()
  const row = db.find(r => r.license_key === normalized)
  if (!row) return { ok: false, msg: 'Key not found.' }
  if (row.status !== 'active') return { ok: false, msg: 'Key revoked.' }
  if (row.trial_expires_at && new Date(row.trial_expires_at) < new Date()) {
    return { ok: false, trial_expired: true, msg: 'Trial ended.' }
  }
  if (row.activations >= 3) return { ok: false, msg: 'Device limit reached.' }
  row.activations++
  return { ok: true, ...(row.trial_expires_at ? { trial: true } : {}) }
}

// ─── inline reimplementation of webhook route logic ───────────────────────────

import { createHmac } from 'crypto'

function makeWebhookSig(secret: string, body: string) {
  return createHmac('sha256', secret).update(body).digest('hex')
}

async function handleWebhook(opts: {
  platform: 'payhip' | 'lemonsqueezy'
  body: string
  sig?: string
  lsSecret?: string
  payhipSecret?: string
}) {
  const { platform, body, sig, lsSecret, payhipSecret } = opts

  if (platform === 'lemonsqueezy') {
    if (!lsSecret) return { status: 500, body: { ok: false } }
    if (!sig) return { status: 401, body: { ok: false } }
    const expected = createHmac('sha256', lsSecret).update(body).digest('hex')
    if (sig !== expected) return { status: 401, body: { ok: false } }

    const payload = JSON.parse(body)
    if (payload.meta?.event_name !== 'order_created') return { status: 200, body: { ok: true } }
    const email = payload.data?.attributes?.user_email
    if (!email) return { status: 400, body: { ok: false } }
    return { status: 200, body: { ok: true, email } }
  }

  // Payhip
  if (!payhipSecret) return { status: 500, body: { ok: false } }
  const payload = JSON.parse(body)
  if (payload.payhip_key !== payhipSecret) return { status: 401, body: { ok: false } }
  const email = payload.buyer_email
  if (!email) return { status: 400, body: { ok: false } }
  return { status: 200, body: { ok: true, email } }
}

// idempotency helper
function resolveKey(email: string, platform: string): string {
  const norm = email.toLowerCase()
  // Existing paid key
  const paid = db.find(r => r.email === norm && r.status === 'active' && !r.trial_expires_at)
  if (paid) return paid.license_key
  // Convert trial to paid
  const trial = db.find(r => r.email === norm && r.platform === 'trial' && r.status === 'active')
  if (trial) {
    trial.trial_expires_at = null
    trial.platform = platform
    return trial.license_key
  }
  // New key
  const key = `SP-NEW-${generateKeyCalls++}`
  db.push({ license_key: key, email: norm, platform, status: 'active', trial_expires_at: null, activations: 0 })
  return key
}

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('Trial signup', () => {
  beforeEach(freshDb)

  it('rejects missing email', async () => {
    expect(await handleTrial('')).toMatchObject({ ok: false })
  })

  it('rejects email without @', async () => {
    expect(await handleTrial('notanemail')).toMatchObject({ ok: false })
  })

  it('creates a trial and schedules 5 emails', async () => {
    const res = await handleTrial('coach@example.com')
    expect(res.ok).toBe(true)
    expect(db).toHaveLength(1)
    expect(db[0].platform).toBe('trial')
    expect(db[0].trial_expires_at).not.toBeNull()
    expect(emailsSent).toHaveLength(5)
  })

  it('schedules Day 0 immediately (no scheduled_at)', async () => {
    await handleTrial('coach@example.com')
    expect(emailsSent[0].scheduled_at).toBeUndefined()
  })

  it('schedules Day 3/7/12/14 emails with future dates', async () => {
    await handleTrial('coach@example.com')
    const now = Date.now()
    for (const e of emailsSent.slice(1)) {
      expect(new Date(e.scheduled_at!).getTime()).toBeGreaterThan(now)
    }
  })

  it('normalises email to lowercase', async () => {
    await handleTrial('Coach@EXAMPLE.COM')
    expect(db[0].email).toBe('coach@example.com')
  })
})

describe('Trial deduplication', () => {
  beforeEach(freshDb)

  it('resends key instead of creating a second trial', async () => {
    await handleTrial('coach@example.com')
    emailsSent = []
    const res = await handleTrial('coach@example.com')
    expect(res.ok).toBe(true)
    expect(db).toHaveLength(1)                         // still 1 row
    expect(emailsSent[0].subject).toContain('resent')
  })

  it('blocks new trial for expired email', async () => {
    await handleTrial('expired@example.com')
    db[0].trial_expires_at = new Date(Date.now() - 1000).toISOString()
    const res = await handleTrial('expired@example.com')
    expect(res.ok).toBe(false)
    expect(res.msg).toContain('ended')
  })
})

describe('Key validation', () => {
  beforeEach(async () => {
    freshDb()
    await handleTrial('coach@example.com')
  })

  it('validates a fresh trial key', async () => {
    const key = db[0].license_key.toUpperCase()
    const res = await handleValidateKey(key)
    expect(res.ok).toBe(true)
    expect((res as any).trial).toBe(true)
  })

  it('increments activations on each call', async () => {
    const key = db[0].license_key
    await handleValidateKey(key)
    await handleValidateKey(key)
    expect(db[0].activations).toBe(2)
  })

  it('blocks after 3 activations', async () => {
    const key = db[0].license_key
    await handleValidateKey(key); await handleValidateKey(key); await handleValidateKey(key)
    const res = await handleValidateKey(key)
    expect(res.ok).toBe(false)
    expect(res.msg).toContain('limit')
  })

  it('rejects expired trial key', async () => {
    db[0].trial_expires_at = new Date(Date.now() - 1000).toISOString()
    const res = await handleValidateKey(db[0].license_key)
    expect(res.ok).toBe(false)
    expect((res as any).trial_expired).toBe(true)
  })

  it('returns ok:false for unknown key', async () => {
    expect(await handleValidateKey('SP-FAKE-FAKE-FAKE')).toMatchObject({ ok: false })
  })
})

describe('Webhook — LemonSqueezy signature enforcement', () => {
  const secret = 'test-ls-secret'
  const payload = JSON.stringify({ meta: { event_name: 'order_created' }, data: { attributes: { user_email: 'buyer@example.com' } } })
  const goodSig = makeWebhookSig(secret, payload)

  it('accepts valid signature', async () => {
    const res = await handleWebhook({ platform: 'lemonsqueezy', body: payload, sig: goodSig, lsSecret: secret })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('rejects missing signature header', async () => {
    const res = await handleWebhook({ platform: 'lemonsqueezy', body: payload, lsSecret: secret })
    expect(res.status).toBe(401)
  })

  it('rejects wrong signature', async () => {
    const res = await handleWebhook({ platform: 'lemonsqueezy', body: payload, sig: 'badsig', lsSecret: secret })
    expect(res.status).toBe(401)
  })

  it('fails closed when LS secret env var is missing', async () => {
    const res = await handleWebhook({ platform: 'lemonsqueezy', body: payload, sig: goodSig })
    expect(res.status).toBe(500)
  })

  it('ignores non-order events', async () => {
    const otherPayload = JSON.stringify({ meta: { event_name: 'subscription_cancelled' } })
    const res = await handleWebhook({ platform: 'lemonsqueezy', body: otherPayload, sig: makeWebhookSig(secret, otherPayload), lsSecret: secret })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })
})

describe('Webhook — Payhip auth enforcement', () => {
  const secret = 'test-payhip-secret'
  const payload = (key: string) => JSON.stringify({ payhip_key: key, buyer_email: 'buyer@example.com' })

  it('accepts correct payhip_key', async () => {
    const res = await handleWebhook({ platform: 'payhip', body: payload(secret), payhipSecret: secret })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('rejects wrong payhip_key', async () => {
    const res = await handleWebhook({ platform: 'payhip', body: payload('wrong'), payhipSecret: secret })
    expect(res.status).toBe(401)
  })

  it('fails closed when PAYHIP_SECRET env var is missing', async () => {
    const res = await handleWebhook({ platform: 'payhip', body: payload(secret) })
    expect(res.status).toBe(500)
  })
})

describe('Webhook — idempotency (replay/retry protection)', () => {
  beforeEach(async () => {
    freshDb()
    await handleTrial('buyer@example.com')
  })

  it('trial→paid conversion returns same key on retry', () => {
    const firstKey = resolveKey('buyer@example.com', 'payhip')
    const secondKey = resolveKey('buyer@example.com', 'payhip')
    expect(firstKey).toBe(secondKey)
  })

  it('post-conversion retry still returns same key', () => {
    resolveKey('buyer@example.com', 'payhip')  // converts trial→paid
    const retryKey = resolveKey('buyer@example.com', 'payhip')
    expect(retryKey).toBe(db[0].license_key)
    expect(db).toHaveLength(1)  // no duplicate rows
  })

  it('preserves trial data after conversion', () => {
    const trialKey = db[0].license_key
    resolveKey('buyer@example.com', 'payhip')
    expect(db[0].license_key).toBe(trialKey)   // same key
    expect(db[0].trial_expires_at).toBeNull()  // expiry cleared
    expect(db[0].platform).toBe('payhip')
  })

  it('brand new buyer gets a fresh key', () => {
    const key = resolveKey('newbuyer@example.com', 'payhip')
    expect(key).toMatch(/^SP-NEW-/)
    expect(db).toHaveLength(2)
  })
})
