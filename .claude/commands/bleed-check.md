# /bleed-check — Performance Bleed Detector

## Usage
```
/bleed-check
/bleed-check --threshold-spend=75 --window-hours=6 --alert-channel=#meta-alerts
/bleed-check --dry-run
```

## Parameters
- --threshold-spend (default: 50): Pause if spend exceeds this USD in the window
- --threshold-conversions (default: 0): Pause if purchases at or below this count
- --window-hours (default: 6): Lookback window in hours
- --alert-channel (default: #meta-alerts): Slack channel name
- --dry-run: Identify bleeding ad sets but do NOT pause them or send alerts

## Prerequisites
- $META_ACCESS_TOKEN with ads_management permission
- $META_ACCOUNT_ID set
- $SLACK_WEBHOOK_URL set

## Instructions

1. Pull active ad sets:
   GET https://graph.facebook.com/v21.0/{account_id}/adsets
   ?fields=id,name,status,daily_budget,campaign_id
   &filtering=[{"field":"adset.effective_status","operator":"IN","value":["ACTIVE"]}]
   &access_token=$META_ACCESS_TOKEN&limit=100
   Paginate to get all.

2. Pull spend and conversion data for each ad set for the window:
   GET https://graph.facebook.com/v21.0/{adset_id}/insights
   ?fields=spend,actions,cost_per_action_type,impressions,clicks
   &time_range={"since":"{now-window_hours}","until":"{now}"}
   &access_token=$META_ACCESS_TOKEN
   Extract spend, purchase_conversions (actions where action_type="purchase"),
   impressions, clicks.

3. Identify bleeding ad sets:
   spend > threshold-spend AND purchase_conversions <= threshold-conversions
   Build list: [{adset_id, name, spend, impressions, clicks, conversions, campaign_id}]

4. Pause each bleeding ad set (skip if --dry-run):
   POST https://graph.facebook.com/v21.0/{adset_id}
   {"status":"PAUSED","access_token":$META_ACCESS_TOKEN}
   Wait 0.3s between calls.

5. Format Slack blocks message:
   - Header: "Meta Bleed Alert — N Ad Sets Paused"
   - Account info block
   - Per-ad-set section: name, spend, impressions, clicks, purchases, Ads Manager link

6. POST to $SLACK_WEBHOOK_URL. Confirm 200 "ok" response.

7. Append to ./logs/bleed-check.log:
   {timestamp} | Checked {total} ad sets | {N} paused | Names: {list}

## Error Handling
- Pause call fails: log error, mark "PAUSE FAILED" in Slack, continue
- Slack webhook fails: still write log, do not lose the record
- No active ad sets: log and exit cleanly
- $SLACK_WEBHOOK_URL not set: skip Slack, write log only, warn in console

## Scheduling
Cron: `0 */6 * * * claude --command "/bleed-check" >> /var/log/bleed-check.log 2>&1`
Runs every 6 hours automatically.
