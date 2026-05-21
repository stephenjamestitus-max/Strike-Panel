# /spy — Competitor Ad Intelligence Scraper

## Usage
```
/spy --competitors="@handle1,@handle2" --country=US --save-baseline
/spy --competitors="123456789,987654321" --country=UK
```

## Parameters
- --competitors (required): Comma-separated Facebook page IDs or @handles
- --country (default: US): Country code for ad library query
- --output (default: report): Output format — "report" (markdown) or "json"
- --save-baseline: Flag to save current pull as baseline for next week's diff

## Instructions

1. Resolve page IDs — for each @handle call:
   GET https://graph.facebook.com/v21.0/{handle}?fields=id&access_token=$META_ACCESS_TOKEN

2. Query Ad Library for each page:
   GET https://graph.facebook.com/v21.0/ads_archive?access_token=$META_ACCESS_TOKEN
   &fields=id,ad_creative_body,ad_creative_link_caption,ad_creative_link_description,
   ad_creative_link_title,ad_delivery_start_time,ad_delivery_stop_time,page_name,
   spend,impressions,currency,ad_snapshot_url
   &search_page_ids={page_id}&ad_reached_countries=["{country}"]
   &ad_active_status=ACTIVE&limit=100
   Paginate through all results using the "next" cursor.
   If HTTP 429, wait 60 seconds and retry.

3. Diff against baseline — load ./reports/spy-last.json, identify new ad IDs not
   in baseline, note stopped ads.

4. Classify each new ad:
   - Hook (opening line or headline)
   - CTA text
   - Offer type (Discount / Free shipping / Free trial / Social proof /
     Problem-solution / Product demo / Testimonial / Urgency / Other)
   - Creative angle (Problem-aware / Solution-aware / Product-aware /
     Brand awareness / Retargeting)
   - Run length (New 0-7d / Testing 8-30d / Winner 30d+)

5. Identify trends — count offer types across competitors, flag any used by 2+
   competitors as "Market Trend".

6. Output ./reports/spy-{YYYY-MM-DD}.md with:
   - Summary section
   - New Ads table (Page | Hook | CTA | Offer Type | Angle | Running)
   - Stopped Ads list
   - Recommended Creative Angles to Test

7. If --save-baseline: overwrite ./reports/spy-last.json with current full pull.

## Error Handling
- Page returns 0 ads: log and continue
- API error 100 (invalid page ID): skip and note in report
- HTTP 429 rate limit: wait 60 seconds, retry up to 3 times
- No baseline exists: note "First run — no diff available"
