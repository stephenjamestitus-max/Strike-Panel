# /follow — Follow 15 Combat Sports Coaching Accounts

## Usage
```
/follow instagram
/follow instagram 15
/follow instagram 20
```

## What This Does
Finds 15 real combat sports coaching accounts (US/UK preferred, 5000+ followers,
real engagement). Follows each via Zernio MCP. Logs to posted_log.json.

## Target Criteria — ALL must be met
- 5000+ followers
- Posts at least 2–3 times per week
- Content is COACHING focused — methodology, training, athlete development
- NOT: fighter highlight reels, news/results accounts, pure lifestyle
- US or UK based preferred (check bio/location if visible)
- Real engagement: comments are specific, not just emojis or bot patterns
- Follower/engagement ratio looks natural (not inflated)

## Search Categories (search all, pick best 15 across)
1. Boxing coaches and head trainers
2. MMA coaches and gym owners
3. BJJ head coaches and academies
4. Muay Thai coaches and camps
5. Combat sports strength and conditioning specialists
6. Fight team performance accounts
7. Combat sports periodisation and programming coaches

## Priority Accounts to Follow First (not yet followed)
Check posted_log.json for accounts with action="follow" — skip already followed.

High-value targets:
@coachfariasboxing, @fightiqcoaching, @striking_science,
@coachnickmurphy, @mnbjj, @strengthandconditioning,
@sanda_muay_thai_boxing_coach, @scientificboxing,
@dingesonboxing, @boxingscience_,
@precisestrikingboxing, @thaiboxingassociation

## Do NOT Follow
- Pure fighter accounts (no coaching content)
- Highlight or news-only accounts
- Accounts already followed (check log)
- Anything with suspicious follower/engagement ratio
- Accounts outside combat sports / S&C

## Instructions

1. Read posted_log.json — note all accounts with action="follow" (never re-follow).
2. Use Zernio MCP to search accounts across all 7 categories.
3. Apply all criteria filters. Rank by: relevance → follower count → engagement quality.
4. Select 15 best accounts not already followed.
5. Follow each via Zernio MCP.
6. Log each: {timestamp, platform, account, followerCount, reason, action: "follow"}

## Output
List every account followed with:
- @handle
- Follower count
- Location (if visible)
- One line on why picked

## Best Posting Times for US/UK Market (reference)
Post every 3 days. Optimal windows (Dubai time):
- Tuesday 7:00 PM Dubai = 3pm UK / 10am EST — strong midweek lunch scroll
- Friday 5:00 PM Dubai = 1pm UK / 8am EST — pre-weekend peak
- Sunday 8:00 PM Dubai = 4pm UK / 11am EST — planning mode, both markets active

## Default
15 accounts. If user specifies a different number, use that.
