# /competitor — Competitor Content Intelligence

## Usage
```
/competitor
/competitor instagram
/competitor @handle1 @handle2
/competitor --ideas
```

## What This Does
Scrapes competitor and adjacent brand content on Instagram.
Extracts hooks, themes, formats. Identifies content gaps.
Generates 5 content ideas strikepanel can own based on the gaps.

## Competitor Accounts to Monitor
Primary (direct competitors / adjacent tools):
- @trainwithpush (athlete monitoring app)
- @whoop (readiness/recovery, adjacent)
- @catapultsports (athlete monitoring, different market but same problem)
- @hudlofficial (team performance)
- @smartabase_sport

Adjacent coaching content (high-performer inspiration):
- @firas_zahabi
- @phil_daru_strength
- @boxingscience_

## Instructions

1. Use Zernio MCP to search posts from competitor handles on Instagram.
   Pull their last 10 posts each.

2. For each post extract:
   - Format (single image / carousel / reel)
   - Hook (first line or headline)
   - Theme/pillar
   - Engagement (likes + comments)
   - CTA used

3. Build a **Content Map** table:
   Handle | Format | Hook | Theme | Eng.

4. Identify **Content Gaps** — topics they are NOT covering that strikepanel's
   audience cares about (cross-reference CLAUDE.md pillars):
   - Which pillars are underserved?
   - Which formats are missing?
   - What coach frustrations are being ignored?

5. Generate **5 Content Ideas** strikepanel can own:
   For each: pillar, hook line, format recommendation, why it wins the gap.

6. Run /ad-score on their top-performing post for comparison.

7. Save to scripts/marketing/competitor-intel.json

## Fallback (if Zernio unavailable)
Use Meta Ad Library API to pull active ads:
GET https://graph.facebook.com/v21.0/ads_archive
?search_terms=athlete+readiness+coaching
&ad_reached_countries=["US","GB"]
&ad_active_status=ACTIVE
&access_token=$META_ACCESS_TOKEN
