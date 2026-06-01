# /schedule

Generate and schedule a full week of content across platforms.

## Usage
```
/schedule
/schedule x
/schedule instagram
/schedule x,instagram
```

## Instructions

1. Read brand context from GitHub:
   https://raw.githubusercontent.com/stephenjamestitus-max/Strike-Panel/main/.agents/product-marketing-context.md

2. Generate 7 posts using these content pillars in order:
   1. Problem/solution
   2. Social proof (use real testimonial from brief)
   3. Fight camp / weight cut scenario
   4. Contrarian take on how coaches operate
   5. Coaching insight or tip
   6. Question to spark replies
   7. Soft sell with CTA → https://strikepane.gumroad.com/l/strikepane

3. Best posting times (UTC):
   - X: 8am, 12pm, 6pm
   - Instagram: 7am, 11am, 5pm

4. Use Zernio MCP tools to schedule each post at the correct time.

5. Save the full schedule to scripts/marketing/content_batch.json
   in the same format as the existing file.

6. Output a clean table showing:
   Date | Time | Platform | First 60 chars of caption | Status
