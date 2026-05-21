# /weekly-report — Weekly Meta Performance Report

## Usage
```
/weekly-report
/weekly-report --date-range=last_7d --compare=previous_7d --slack-channel=#growth
/weekly-report --format=markdown
```

## Parameters
- --date-range (default: last_7d): "last_7d", "last_14d", or "custom:YYYY-MM-DD:YYYY-MM-DD"
- --compare (default: previous_7d): "previous_7d", "previous_4w", or "custom:YYYY-MM-DD:YYYY-MM-DD"
- --format (default: "slack,markdown"): Comma-separated output formats
- --top-n (default: 3): Number of top/bottom performers to highlight
- --slack-channel (default: #growth): Slack channel for summary
- --output-dir (default: ./reports/): Directory for reports

## Prerequisites
- $META_ACCESS_TOKEN with ads_read permission
- $META_ACCOUNT_ID set
- $SLACK_WEBHOOK_URL set
- At least 14 days of account history for WoW comparison

## Instructions

1. Calculate date ranges — parse --date-range and --compare into YYYY-MM-DD
   since/until pairs for primary and comparison periods.

2. Pull account-level metrics for both periods:
   GET https://graph.facebook.com/v21.0/{account_id}/insights
   ?fields=spend,impressions,clicks,actions,purchase_roas,cost_per_action_type,
   cpc,cpm,frequency,reach
   &date_preset={date_range}&access_token=$META_ACCESS_TOKEN
   Repeat for comparison period. Extract: total_spend, total_purchases,
   total_purchase_value, account_roas, average_cpa, average_cpm,
   average_ctr, average_frequency.

3. Pull campaign-level metrics — repeat for both periods with campaign breakdown.

4. Pull creative-level metrics for top/bottom identification — sort by
   purchase_roas for top/bottom lists.

5. Calculate week-over-week changes:
   absolute_change = current - prior
   pct_change = (current-prior)/prior*100
   direction = "up" or "down"

6. Determine account health status:
   GREEN: ROAS >= target AND CPA <= target AND metrics stable
   YELLOW: any key metric declined >10% WoW OR ROAS approaching floor
   RED: ROAS below floor OR CPA >20% above target

7. Generate three recommended actions based on data — one about budget allocation,
   one about creative, one about audience/targeting. Each must reference specific
   campaign names or metric values.

8. Format Slack blocks message with:
   - Header: "Weekly Meta Report — w/c {date}"
   - Account health status
   - 6-metric field grid: ROAS, CPA, Spend, Purchases, CPM, Frequency
     (each with WoW change and direction arrow)
   - Top N creatives by ROAS
   - Bottom N underperformers
   - Three recommended actions

9. POST to $SLACK_WEBHOOK_URL. Confirm 200 "ok".

10. Write ./reports/weekly-report-{YYYY-MM-DD}.md with full metrics table,
    creative performance table, health assessment, three actions with rationale,
    data notes.

## Error Handling
- No data for primary period: stop with error, check date range
- No comparison data: generate report without WoW comparison, note limitation
- Slack POST fails: log full message to ./reports/slack-backup-{date}.json
- Account spend < $100 in period: flag "low spend" warning

## Scheduling
Cron: `0 8 * * 1 claude --command "/weekly-report"` — runs Monday 8am.
