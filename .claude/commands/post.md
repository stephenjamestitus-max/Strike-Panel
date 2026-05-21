# /post — Draft and Publish a Post to Instagram

## Usage
```
/post
/post instagram "your caption"
/post instagram --carousel
/post instagram --pillar=weightcut
```

## Posting Cadence
Post every 3 days (not daily). Best times for US/UK market (Dubai timezone):
- Tuesday   7:00 PM Dubai = 3pm UK / 10am EST
- Friday    5:00 PM Dubai = 1pm UK / 8am EST
- Sunday    8:00 PM Dubai = 4pm UK / 11am EST

Check posted_log.json — do not post if last post was less than 2 days ago.

## Content Pillars (rotate, never repeat same pillar twice in a row)
1. Readiness — morning brief, who to push vs protect
2. Fight Camp — managing athletes in camp, countdown
3. Weight Cut — safe cuts, daily tracking, fight night
4. AI Sessions — session generation based on readiness data
5. Problem/Frustration — coaches guessing, spreadsheet chaos, WhatsApp mess
6. Social Proof — what coaches get from using StrikePanel
7. Direct Offer — $99 one-time, no subscription

## Instructions

1. Check posted_log.json — find last post date and pillar used.
   Select next pillar in rotation (never repeat last one).

2. Check today's trends: read marketing/trends.json if it exists.
   Use any relevant combat sports theme to make the post timely.

3. Generate caption:
   - 80–120 words for Instagram
   - First line is the hook — stops the scroll, creates tension or curiosity
   - Body: one sharp insight, coach-to-coach tone
   - End: soft CTA or observation (offer pillar only: "link in bio")
   - Brand voice: direct, no-nonsense, active voice, no emojis, no hyphens
   - Hashtags (15–20, appended below caption): mix of
     #boxingcoach #mmacoach #combatsportscoach #athletereadiness #fightcamp
     #strengthandconditioning #bjjcoach #muaythaicoach #combatsports #coachlife
     #periodization #performancecoach #fightteam #highperformancecoaching
     #sportsscience #trainingload #elitecoaching #independentcoach #coachingtools

4. If --carousel flag or pillar suits multi-slide: run /carousel to generate
   6-slide PNG carousel, then attach to post.

5. Post via Zernio MCP to Instagram @strikepanel.

6. Log entry: {timestamp, platform, pillar, caption_preview, format, status}

## Format Selection
- Every other post: carousel (more reach, more saves)
- Alternating: single text-on-dark image (use existing design templates)
- Reel: when Remotion video is available (run /reel)

## Output
Confirm: posted at [time], pillar used, format, next post due date.
