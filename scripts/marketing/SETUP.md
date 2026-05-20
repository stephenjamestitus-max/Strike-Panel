# Marketing Automation Setup

## How it works

- Every Sunday 7pm UTC — fetches Instagram insights
- Every Sunday 8pm UTC — generates 7 X posts with Claude, saves to Google Sheet
- Every day 8am / 12pm / 6pm UTC — posts scheduled tweet to X

---

## Step 1 — GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

### Claude API (content generation)
- `ANTHROPIC_API_KEY` — get from console.anthropic.com

### X (Twitter) API (posting)
- `X_API_KEY` — Consumer Key from developer.twitter.com
- `X_API_SECRET` — Consumer Key Secret
- `X_ACCESS_TOKEN` — Access Token (must have Read+Write permission)
- `X_ACCESS_TOKEN_SECRET` — Access Token Secret

### Google Drive (content calendar) — optional
- `GOOGLE_SHEET_ID` — the ID from your Google Sheet URL
- `GOOGLE_SERVICE_ACCOUNT_JSON` — base64 encoded service account JSON

### Instagram Insights — optional
- `IG_ACCESS_TOKEN` — long-lived token from Meta Business Suite
- `IG_ACCOUNT_ID` — your Instagram Business account ID

---

## Step 2 — Google Sheet setup (optional)

1. Create a new Google Sheet
2. Copy the Sheet ID from the URL (between /d/ and /edit)
3. Create a service account at console.cloud.google.com
4. Enable Google Sheets API
5. Download the service account JSON
6. Run: `base64 -w 0 service-account.json` to encode it
7. Add the encoded string as GOOGLE_SERVICE_ACCOUNT_JSON secret
8. Share your Google Sheet with the service account email

---

## Step 3 — Instagram Graph API setup (optional)

1. Connect Instagram to a Facebook Page
2. Go to Meta Business Suite → Settings → Advanced → Page Access Tokens
3. Generate a long-lived token with instagram_basic and instagram_manage_insights permissions
4. Find your Instagram Account ID via:
   curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_TOKEN"

---

## Step 4 — Run manually first

Test content generation:
```
ANTHROPIC_API_KEY=your_key python scripts/marketing/generate_content.py
```

Test X posting (dry run — check content_batch.json first):
```
cat scripts/marketing/content_batch.json
```

---

## Step 5 — Enable GitHub Actions

Push this repo — GitHub Actions will start automatically on schedule.
To trigger manually: GitHub repo → Actions → select workflow → Run workflow

---

## Files

| File | Purpose |
|------|---------|
| content_batch.json | Current week's scheduled posts |
| posted_log.json | History of every tweet posted |
| insights_log.json | Weekly Instagram performance data |
