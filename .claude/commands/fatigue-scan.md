# /fatigue-scan — Creative Fatigue Monitor

## Usage
```
/fatigue-scan
/fatigue-scan --lookback=14 --hook-rate-floor=0.25 --frequency-cap=4.0
/fatigue-scan --output=./reports/fatigue-report.md
```

## Parameters
- --lookback (default: 14): Days of data to analyze
- --hook-rate-floor (default: 0.25): Minimum acceptable hook rate
- --ctr-decline-threshold (default: 0.15): Flag if CTR drops more than this WoW
- --frequency-cap (default: 4.0): Flag if frequency exceeds this value
- --output (default: ./reports/fatigue-report.md): Output file path
- --min-spend (default: 100): Minimum lifetime spend to include a creative

## Instructions

1. Get all active ad creatives:
   GET https://graph.facebook.com/v21.0/{account_id}/ads
   ?fields=id,name,creative{id,name},adset_id,campaign_id,
   insights{spend,impressions,clicks,actions,video_thru_play_actions,
   frequency,cpm,cpc,ctr}
   &filtering=[{"field":"ad.effective_status","operator":"IN","value":["ACTIVE"]}]
   &access_token=$META_ACCESS_TOKEN

2. Pull daily time-series for each creative:
   GET https://graph.facebook.com/v21.0/{ad_id}/insights
   ?fields=spend,impressions,clicks,actions,video_thru_play_actions,
   frequency,cpm,ctr,date_start
   &time_range={"since":"{today-lookback}","until":"{today}"}
   &time_increment=1&access_token=$META_ACCESS_TOKEN

3. Calculate metrics per day:
   - hook_rate = video_thru_play_actions/impressions (video) OR
     link_clicks/impressions (static)
   - ctr = clicks/impressions
   - cpm = spend/impressions*1000
   - frequency from API
   Calculate rolling 7-day averages for week 1 (days 1-7) and week 2 (days 8-14).

4. Classify fatigue risk:
   HIGH RISK: hook_rate_week2 < hook-rate-floor, OR CTR WoW decline > threshold,
   OR frequency > frequency-cap, OR CPM WoW increase > 30%
   MEDIUM RISK: hook rate within 20% of floor, CTR decline 10-15%, frequency 3.0-4.0
   LOW RISK: all metrics stable or improving

5. Generate replacement briefs for HIGH RISK creatives — analyze original hook
   structure, visual treatment, emotional driver. Output:
   "This creative [hook] is showing [metric decline]. Test a new variation with
   the same [angle] but using [new treatment]. Suggested hooks: [3 options]."

6. Write report with:
   - Account Summary (counts by risk level)
   - High Risk table (Creative | Hook Rate | CTR Trend | Frequency | CPM Trend | Action)
     plus replacement briefs
   - Medium Risk table
   - Low Risk list

## Error Handling
- Creative has < 7 days data: skip and note "insufficient data"
- Video metrics unavailable (static ad): skip hook_rate, use CTR only
- API returns no time-series: fall back to lifetime insights
