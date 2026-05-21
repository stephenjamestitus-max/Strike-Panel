# /audience-audit — Audience Architecture Auditor

## Usage
```
/audience-audit
/audience-audit --account-id=act_123456789 --output=./reports/audience-audit.md
/audience-audit --include-inactive
```

## Parameters
- --account-id (default: $META_ACCOUNT_ID): Meta ad account ID (with act_ prefix)
- --output (default: ./reports/audience-audit.md): Output file path
- --include-inactive: Include paused/inactive ad sets in analysis

## Prerequisites
- $META_ACCESS_TOKEN with ads_read permission
- At least one custom audience created in the account

## Instructions

1. Pull all custom audiences:
   GET https://graph.facebook.com/v21.0/{account_id}/customaudiences
   ?fields=id,name,subtype,approximate_count,time_created,retention_days,rule,lookalike_spec
   &access_token=$META_ACCESS_TOKEN&limit=100
   Categorize by subtype: CUSTOM (customer file), WEBSITE (pixel-based),
   LOOKALIKE, ENGAGEMENT, OFFLINE.

2. Pull active ad sets and targeting:
   GET https://graph.facebook.com/v21.0/{account_id}/adsets
   ?fields=id,name,status,targeting,campaign_id,daily_budget,
   insights{spend,purchase_roas}
   &filtering=[{"field":"adset.effective_status","operator":"IN","value":["ACTIVE","PAUSED"]}]
   &access_token=$META_ACCESS_TOKEN

3. Map audiences to funnel stages:
   TOFU: interest-based, LAL 3-10%, broad
   MOFU: website visitors (all pages 30-180d), video view audiences (25/50/75%),
         engagement audiences, email subscribers, LAL 1-2%
   BOFU: product page visitors, add-to-cart, initiate checkout, cart abandoners
   RETENTION: past purchasers 180d+, LTV-based audiences

4. Run overlap analysis — flag ad sets that are simultaneously:
   active, same geo, same optimization event (Purchase), and logically overlapping
   audience types with no mutual exclusions.
   Classify pairs as HIGH/MEDIUM/LOW risk.

5. Identify missing exclusions:
   HIGH impact: purchasers not excluded from prospecting ad sets
   MEDIUM: warm audiences not excluded from cold prospecting
   LOW: minor interest/LAL overlap
   Rank by estimated impact.

6. Generate architecture recommendations:
   TOFU/MOFU/BOFU audience lists with sizes, exclusion rules for each layer,
   suggested LAL expansion from best-performing seed audiences.

7. Generate Mermaid flowchart showing: current architecture, funnel stage boxes
   with audiences, arrows showing exclusion relationships, red markers on
   problematic overlaps.

8. Write report with:
   - Executive summary
   - Current architecture Mermaid diagram
   - Funnel stage mapping table
   - Overlap analysis table (Ad Set Pair | Overlap Risk | Missing Exclusion | Priority)
   - Missing exclusions list
   - Recommended architecture

## Error Handling
- No custom audiences: output targeting-only analysis with recommendation
  to create pixel-based audiences
- Mermaid diagram too complex (>20 nodes): generate simplified version and note
- Ad set targeting data unavailable: note limitation, analyze available data only
