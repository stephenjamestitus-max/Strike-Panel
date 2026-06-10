# Production Test Checklist — Trial Loop & Purchase Flow

These can only be tested from production (sandbox can't reach Resend/Payhip).
Each takes 5-15 minutes. Use a personal email you control (not corepanelv1@gmail.com,
so reply-to works properly in the test).

## Test 1 — Trial signup + Day 0 email (5 min)

1. Go to strikepanel.uk → trial form
2. Enter a test email (e.g. stephenjamestitus+trial1@gmail.com — Gmail ignores +suffixes)
3. Confirm: success message appears on site
4. Confirm: Day 0 email arrives within 2 minutes with a key formatted SP-XXXX-XXXX-XXXX
5. Open strikepanel.uk/app → paste key → app should unlock
6. Check Supabase licenses table: row exists with platform='trial', trial_expires_at = +14 days, your email

**If Day 0 email doesn't arrive:** check Resend dashboard → Logs. Most likely cause:
the from address is still `onboarding@resend.dev` which has deliverability limits —
verify a custom domain in Resend (strikepanel.uk) and switch the from address.

## Test 2 — Scheduled emails actually fire (verify in dashboard, no waiting needed)

1. After Test 1, open Resend dashboard → Emails
2. You should see 4 more emails for your test address with status "Scheduled"
   (Day 3, 7, 12, 14)
3. If they show as Scheduled, they will fire — Resend handles delivery
4. Optional full verification: wait until Day 3 and confirm receipt

**If only 1 email shows in Resend:** the `scheduled_at` calls failed silently
(they're fire-and-forget). Check Vercel function logs for the /api/trial invocation.

## Test 3 — Duplicate trial protection (2 min)

1. Submit the same test email on the trial form again
2. Expected: success message, key RE-SENT (same key, subject says "resent")
3. NOT expected: a second key generated. Check Supabase — should still be 1 row.

## Test 4 — Trial expiry gate (requires SQL, 5 min)

1. In Supabase SQL editor:
   `UPDATE licenses SET trial_expires_at = now() - interval '1 day' WHERE email = 'your+trial1@...';`
2. Open the app in the browser where the trial was activated → refresh
3. Expected: trial-expired screen with upgrade prompt, app locked
4. Also: submitting that email on the trial form again should return
   "Your free trial has ended" — not a new key

## Test 5 — Purchase webhook + trial→paid conversion (uses a real $99 purchase OR Payhip test mode)

Payhip has no sandbox, so either:
- **Option A (free):** temporarily create a $0 or 100%-off coupon product in Payhip
  pointed at the same webhook, buy it with the trial email from Test 4
- **Option B:** make a real purchase and refund it after

Expected after purchase:
1. Purchase email arrives with a license key
2. The key is the SAME key as the trial (conversion, not new key)
3. Supabase: that row now has trial_expires_at = NULL, platform = 'payhip'
4. The app unlocks again with the same key (coach data intact)

## Test 6 — Webhook security (after the signature fix is deployed, 2 min)

From a terminal:
```
curl -X POST https://strikepanel.uk/api/purchase-webhook?platform=payhip \
  -H 'Content-Type: application/json' \
  -d '{"buyer_email":"attacker@evil.com","payhip_key":"wrong"}'
```
Expected: `{"ok":false}` with HTTP 401. If you get a key generated, the deploy
hasn't gone out — check Vercel.

Same for LemonSqueezy (no signature header):
```
curl -X POST https://strikepanel.uk/api/purchase-webhook \
  -H 'Content-Type: application/json' \
  -d '{"meta":{"event_name":"order_created"},"data":{"attributes":{"user_email":"attacker@evil.com"}}}'
```
Expected: HTTP 401.

## Cleanup

Delete test rows: `DELETE FROM licenses WHERE email LIKE '%+trial%';`
