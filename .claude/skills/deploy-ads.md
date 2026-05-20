# /deploy-ads — Meta API Auto-Deployer

## Usage
```
/deploy-ads --manifest=campaigns/summer-sale-manifest.json --mode=draft
/deploy-ads --manifest=campaigns/manifest.json --mode=publish
/deploy-ads --manifest=campaigns/manifest.json --dry-run
```

## Parameters
- --manifest (required): Path to the campaign manifest JSON file
- --mode (default: draft): "draft" creates everything paused; "publish" sets ACTIVE
- --dry-run: Validate manifest and estimate API calls without making requests

## Prerequisites
- $META_ACCESS_TOKEN with ads_management permission
- $META_ACCOUNT_ID set
- $META_PAGE_ID set (your Facebook Page ID for ad creative)
- Creative images at specified paths OR already uploaded (image_hash in manifest)

## Instructions

1. Validate manifest — check all required fields, verify image files exist, confirm
   account ID. If --dry-run: output validation results and stop.

2. Upload creative images — for each ad with image_path:
   POST https://graph.facebook.com/v21.0/{account_id}/adimages
   with multipart image data. Extract image_hash from response.
   Wait 0.5s between uploads.

3. Create campaign:
   POST https://graph.facebook.com/v21.0/{account_id}/campaigns
   {name, objective, status: PAUSED|ACTIVE per --mode, special_ad_categories: []}
   Store campaign_id.

4. Create ad sets:
   POST https://graph.facebook.com/v21.0/{account_id}/adsets
   {campaign_id, targeting, optimization_goal, billing_event, daily_budget, status}
   Store adset_id. Wait 0.5s between creates.

5. Create ad creatives:
   POST https://graph.facebook.com/v21.0/{account_id}/adcreatives
   {object_story_spec: {page_id, link_data: {image_hash, link, message, name,
   call_to_action}}}
   Store creative_id.

6. Create ads:
   POST https://graph.facebook.com/v21.0/{account_id}/ads
   {name, adset_id, creative.creative_id, status}
   Wait 0.5s between creates.

7. Retry logic:
   - HTTP 429: wait 60 seconds, retry
   - HTTP 400: log error, skip item, continue
   - HTTP 500: wait 5 seconds, retry up to 3 times

8. Write ./reports/deploy-{YYYY-MM-DD-HHmm}.md with all created IDs,
   Ads Manager deep links, errors, and total API call count.

## Error Handling
- Manifest file not found: stop with clear path error
- Campaign creation fails: stop, do not create ad sets (avoid orphaned objects)
- Individual ad fails: log and continue
- Token expired: stop with instructions to refresh
