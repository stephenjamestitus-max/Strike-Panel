# /engage

Find and engage with relevant combat sports coaching content.

## Usage
```
/engage instagram
/engage x
/engage instagram 10
/engage x 20
```

## Instructions

1. Read brand context from GitHub to understand target audience:
   https://raw.githubusercontent.com/stephenjamestitus-max/Strike-Panel/main/.agents/product-marketing-context.md

2. Use Zernio MCP tools to search for recent posts on the platform
   containing keywords:
   - "fight camp" "boxing coach" "mma coach" "bjj coach"
   - "muay thai coach" "weight cut" "athlete readiness"
   - "training session" "combat sports"

3. Filter to accounts with 5000+ followers only.

4. For each post — write a genuine comment:
   - 1-2 sentences max
   - Specific to the actual post content
   - Sound like a coach talking to a coach
   - No emojis, no hyphens
   - Never mention StrikePanel or drop links
   - Never generic ("great post", "love this")

5. Post the comments via Zernio MCP.

6. Default: engage with 10 accounts.
   If user specifies a number, use that instead.

7. Never comment on the same account twice in 7 days.
   Check scripts/marketing/posted_log.json for recent activity.

8. Output: list of every account engaged with + exact comment posted.
