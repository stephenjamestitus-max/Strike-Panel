# /rebalance — Budget Reallocation Engine

## Usage
```
/rebalance --dry-run
/rebalance --roas-floor=0.85 --max-shift-pct=25 --lookback=7 --dry-run
/rebalance --roas-floor=0.85 --max-shift-pct=25 --execute
```

## Parameters
- --roas-floor (default: 0.85): Fraction of account average ROAS below which an ad set is flagged
- --max-shift-pct (default: 30): Maximum % of an ad set's budget to reallocate in one run
- --min-spend (default: 100): Minimum spend to include an ad set in analysis
- --lookback (default: 7): Days of data for ROAS calculation
- --dry-run (default: true): Show plan without executing
- --execute: Apply budget changes via API

## Prerequisites
- $META_ACCESS_TOKEN with ads_management permission
- $META_ACCOUNT_ID set
- Ad sets using ad set-level budgets (not CBO) for direct budget edits

## Instructions

1. Pull active ad sets with performance data:
   GET https://graph.facebook.com/v21.0/{account_id}/adsets
   ?fields=id,name,status,daily_budget,lifetime_budget,campaign_id,
   insights.date_preset(last_{lookback}_d){spend,actions,purchase_roas,
   cost_per_action_type,impressions,clicks}
   &filtering=[{"field":"adset.effective_status","operator":"IN","value":["ACTIVE"]}]
   &access_token=$META_ACCESS_TOKEN

2. Calculate metrics:
   total_spend, purchases (actions type="purchase"),
   purchase_value (action_values type="offsite_conversion.fb_pixel_purchase"),
   roas = purchase_value/total_spend
   Skip if spend < --min-spend.

3. Calculate account benchmarks:
   account_avg_roas = sum(purchase_value)/sum(spend)
   roas_floor_value = account_avg_roas * --roas-floor
   top_performer_threshold = account_avg_roas * 1.15

4. Classify ad sets:
   UNDERPERFORMER: roas < roas_floor_value
   TOP PERFORMER: roas > top_performer_threshold
   MID PERFORMER: between thresholds

5. Calculate reallocation:
   For underperformers: reduction = min(current_budget * max-shift-pct,
   current_budget - min_daily_budget)
   Distribute available_budget to top performers proportionally by ROAS.
   Cap any single increase at 30% of current budget.

6. Generate reallocation table:
   Ad Set | Current Budget | Proposed Budget | Change | Current ROAS | Reasoning

7. Execute if --execute flag set:
   POST https://graph.facebook.com/v21.0/{adset_id}
   {"daily_budget": new_budget_in_cents, "access_token": $META_ACCESS_TOKEN}
   Wait 0.5s between updates.

8. Write ./reports/rebalance-{YYYY-MM-DD}.md with account ROAS benchmarks,
   reallocation table, projected weekly impact, and execution log.

## Error Handling
- All ad sets on CBO: output analysis-only report, note budget edits disabled
- Ad set budget update fails: log error, skip, continue
- No purchases in window: use CPC as proxy metric
- Only 1-2 ad sets with data: flag insufficient sample, do not execute
