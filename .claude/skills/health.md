# /health — Account & Ad Health Score

## Usage
```
/health
/health instagram
/health --full
```

## What This Does
Pulls performance data and generates a full account health scorecard covering:
posting consistency, engagement rate, audience fatigue, content variety,
and a 0–100 overall account health score.

## Health Dimensions

### 1. Posting Consistency (0–25pts)
- 25: Posted on schedule, no gaps longer than 4 days
- 15: Minor gaps, mostly consistent
- 5: Irregular posting, multiple missed days
Check: scripts/marketing/posted_log.json for posting history

### 2. Engagement Rate (0–25pts)
Pull from Zernio/Instagram analytics:
- 25: >3% engagement rate (likes+comments/followers)
- 15: 1–3% engagement rate
- 5: <1% engagement rate
Industry benchmark for niche B2B coaching: 2–4% is strong.

### 3. Content Variety (0–20pts)
Check posted_log.json for pillar distribution:
- 20: All 7 pillars used in last 14 posts, mix of formats
- 12: Some variety, 4–5 pillars covered
- 5: Same pillar/format repeated, audience fatigue risk

### 4. Follower Growth Velocity (0–15pts)
Pull from Zernio analytics (last 30 days):
- 15: >2% follower growth
- 10: 0.5–2% growth
- 3: Flat or declining

### 5. Audience Fatigue Risk (0–15pts)
Signs of fatigue: engagement rate trending down over last 14 posts,
same hook patterns repeating, low save/share ratio.
- 15: No fatigue signals, saves/shares growing
- 8: Mild decline, monitor
- 2: Clear fatigue — hook patterns stale, eng. rate dropping

## Instructions

1. Pull data from Zernio MCP (analytics endpoint) for last 30 days.
2. Read scripts/marketing/posted_log.json for posting history.
3. Calculate each dimension score.
4. Sum for **Account Health Score** (0–100).

5. Output:

```
STRIKEPANE ACCOUNT HEALTH — [date]
════════════════════════════════════
HEALTH SCORE: XX/100   [🟢 STRONG / 🟡 WATCH / 🔴 ACT NOW]

Posting Consistency   XX/25 — [finding]
Engagement Rate       XX/25 — [rate]% vs 2% benchmark
Content Variety       XX/20 — [pillars covered]
Follower Growth       XX/15 — [+X% last 30d]
Audience Fatigue      XX/15 — [LOW / MEDIUM / HIGH risk]

TOP 3 ACTIONS:
1. [specific fix]
2. [specific fix]
3. [specific fix]
```

6. Save to scripts/marketing/insights_log.json

## For Meta Ads (if running paid)
Add ad-level checks:
- Frequency > 4.0 → flag HIGH fatigue risk
- Audience overlap > 20% between ad sets → flag
- ROAS declining WoW → flag
Pull via: GET https://graph.facebook.com/v21.0/{account_id}/insights
