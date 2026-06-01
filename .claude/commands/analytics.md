# /analytics

Pull performance data across all connected platforms and report insights.

## Usage
```
/analytics
/analytics instagram
/analytics x
/analytics week
/analytics top
```

## Instructions

1. Use Zernio MCP tools to fetch analytics for the requested
   platform(s) for the last 7 days.

2. Pull these metrics per platform:
   - Impressions / reach
   - Engagement rate
   - Follower growth
   - Top performing post (most likes + comments + shares)
   - Worst performing post

3. Output a clean report:

   strikepanel ANALYTICS — [date range]
   ─────────────────────────────────────
   INSTAGRAM
   Reach: X | Engagement: X% | Followers: +X
   Top post: [first 60 chars] — X engagements

   X (TWITTER)
   Impressions: X | Engagement: X% | Followers: +X
   Top post: [first 60 chars] — X engagements

4. Bottom of report — 2-3 recommendations:
   - What content type is working best
   - Best day/time based on actual data
   - What to do more of next week

5. Save full report to scripts/marketing/insights_log.json
