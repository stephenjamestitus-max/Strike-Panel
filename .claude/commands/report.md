# /report

Weekly marketing performance summary with actionable recommendations.

## Usage
```
/report
/report week
/report month
```

## Instructions

1. Pull analytics from all connected platforms via Zernio MCP.

2. Pull posting history from scripts/marketing/posted_log.json.

3. Generate a full weekly report:

   ═══════════════════════════════════
   STRIKEPANEL WEEKLY REPORT
   [date range]
   ═══════════════════════════════════

   POSTS SENT: X
   TOTAL REACH: X
   TOTAL ENGAGEMENTS: X
   NEW FOLLOWERS: X (all platforms combined)

   TOP PERFORMING POST:
   Platform: X
   Caption: [first 80 chars]
   Engagements: X

   WORST PERFORMING POST:
   Platform: X
   Caption: [first 80 chars]
   Engagements: X

   PLATFORM BREAKDOWN:
   Instagram — Reach: X | Eng Rate: X% | +X followers
   X — Impressions: X | Eng Rate: X% | +X followers

   RECOMMENDATIONS FOR NEXT WEEK:
   1. [specific action based on data]
   2. [specific action based on data]
   3. [specific action based on data]

4. Save to scripts/marketing/weekly_report.json

5. Ask: "Want me to schedule next week's content based on these insights?"
