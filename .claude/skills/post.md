# /post

Post content to one or more platforms via Zernio.

## Usage
```
/post instagram "Your caption here"
/post x "Your tweet here"
/post instagram,x "Cross-post this caption"
/post all "Post everywhere"
```

## Instructions

1. Read the brand context from:
   https://raw.githubusercontent.com/stephenjamestitus-max/Strike-Panel/main/.agents/product-marketing-context.md

2. If the user provides caption text — use it exactly as written.
   If they just say `/post instagram` with no text — generate a post
   using the brand context. Pick a content pillar at random:
   - Problem/solution
   - Social proof
   - Fight camp scenario
   - Contrarian coaching take
   - Soft sell with Gumroad link

3. Apply brand voice rules:
   - Short sentences, active voice
   - No emojis unless 1, purposeful
   - Max 2 hashtags
   - Never: game-changer, revolutionary, unlock, platform
   - Under 240 chars for X, up to 2200 for Instagram

4. Use Zernio MCP tools to post to the requested platform(s).
   Available platforms: instagram, x, tiktok, linkedin, facebook

5. Confirm what was posted and to which platforms.
   Save a log entry to scripts/marketing/posted_log.json.
