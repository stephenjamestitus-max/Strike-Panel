# /engage — Comment on 15 Combat Sports Coaching Posts

## Usage
```
/engage instagram
/engage instagram 15
/engage instagram 10
```

## What This Does
Finds 15 recent posts from combat sports coaching accounts with 5000+ followers.
Writes one super-human comment per post — sounds like a coach, adds real value,
never generic. Posts via Zernio MCP. Logs to posted_log.json.

## Target Accounts (prioritise these first)
@firas_zahabi, @phil_daru_strength, @ufcpi, @mark_henry_mma,
@boxingscience_, @scientificboxing, @jasonparillo, @roufusport,
@gbteambjj, @thaiboxingassociation, @precisestrikingboxing,
@dingesonboxing, @coachnickmurphy, @striking_science,
@coachfariasboxing, @fightiqcoaching, @mnbjj

## Keyword Search (if above don't have recent posts)
Search for recent posts containing:
"fight camp" "boxing coach" "mma coach" "bjj coach"
"muay thai coach" "weight cut" "athlete readiness"
"training session" "combat sports conditioning"

## Account Filters
- 5000+ followers ONLY
- Posted within last 48 hours
- Coaching-focused content (not fighter highlight accounts)
- Real engagement — check that comments are specific, not just emojis

## Comment Rules — NON-NEGOTIABLE
Every comment must be:
- 1–2 sentences max. No more.
- Specific to the actual content of that post — read it first
- Sound like a coach who knows this space (peer to peer, not fan)
- Add a real insight, a sharp observation, or a genuine question
- No emojis. No hyphens. No "great post" or "love this"
- Never mention strikepane. Never drop any link. Never promotional.

## Comment Examples by Post Type

**Weight cut post:**
"The cut that kills performance starts three weeks out, not three days.
Daily trend weight from contract signing is the only way to stay ahead of it."

**Fight camp management post:**
"Weeks three and four is where camps are lost and coaches don't know it yet.
That's when monitoring has to be tightest, not just programming heaviest."

**Readiness or training load post:**
"The best session on paper means nothing if the athlete walked in at a four out
of ten. Reading where they actually are that day matters more than the plan."

**S&C or conditioning post:**
"Fight-specific conditioning isn't general fitness with gloves on. The energy
system demands and dehydration stress from camp change everything about load."

**Coaching business or athlete management:**
"Independent coaches carry the same athlete volume as programme coaches with
zero support staff. Systems that give visibility without overhead are the game."

**Mindset or mental performance post:**
"You can programme the perfect week and still lose an athlete two weeks out
because nobody saw the signs of accumulated stress. The data usually does."

## Anti-Repeat Rule — ALWAYS CHECK FIRST
Read scripts/marketing/posted_log.json before starting.
Skip any account engaged within the last 7 days.

## Instructions

1. Read posted_log.json — note all accounts with action="comment" in last 7 days.
2. Use Zernio MCP to fetch recent posts from target accounts + keyword search.
3. Filter: 5000+ followers, posted <48 hours ago, not in 7-day cooldown.
4. For each post: read the actual content carefully. Write a comment that
   responds specifically to what they said — not a generic template paste.
5. Post each comment via Zernio MCP.
6. Log each entry: {timestamp, platform, account, postId, comment, action: "comment"}

## Output
List every account engaged + the exact comment posted.
Flag any failures with reason.

## Default
15 accounts. If user specifies a different number, use that.
