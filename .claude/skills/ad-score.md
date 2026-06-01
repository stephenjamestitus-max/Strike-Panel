# /ad-score — Ad Creative Scoring Engine

## Usage
```
/ad-score "your caption or hook text"
/ad-score --url="https://..."
/ad-score --file=marketing/posts/draft.txt
/ad-score --competitor=@handle
```

## What This Does
Scores any ad creative (caption, hook, CTA) across 6 dimensions.
Outputs a health scorecard with specific rewrites for weak areas.

## Scoring Dimensions (each 0–10)

1. **Hook Strength** — does the first line stop the scroll?
   - 9-10: Disrupts pattern, creates tension or curiosity
   - 6-8: Clear problem statement, relevant to audience
   - 3-5: Generic opener, could apply to anything
   - 0-2: No hook, jumps straight to features

2. **Copy Clarity** — does a coach understand it in 3 seconds?
   - Scores on: specificity, combat-sports-native language, no jargon
   - Penalises: passive voice, hyphens, emojis (off-brand), corporate tone

3. **CTA Strength** — does it create motion?
   - 9-10: Specific action, urgency, clear next step
   - 6-8: Clear CTA but generic
   - 3-5: Weak or buried CTA
   - 0-2: No CTA

4. **Emotional Resonance** — does it hit the coach's core frustration or aspiration?
   - Target emotions: feeling blind, feeling behind, wanting control, pride in athlete results
   - Score based on how precisely it matches documented customer language

5. **Offer Clarity** — is the value proposition and price clear?
   - 9-10: $99, one-time, specific outcomes stated
   - Penalises: vague benefits, missing price, subscription ambiguity

6. **Visual Alignment** — does the copy set up a clear visual treatment?
   - Score on: headline extractable for slide, stat present, contrast opportunity

## Instructions

1. Read the input (caption, hook, or URL content).

2. Score each dimension 0–10. Show the number and a one-line reason.

3. Calculate **Ad Health Score**: weighted average:
   Hook×25% + Copy×20% + CTA×15% + Emotional×25% + Offer×10% + Visual×5%

4. Output scorecard:

```
AD HEALTH SCORE: XX/100
───────────────────────────────
Hook Strength     X/10  — [reason]
Copy Clarity      X/10  — [reason]
CTA Strength      X/10  — [reason]
Emotional Res.    X/10  — [reason]
Offer Clarity     X/10  — [reason]
Visual Alignment  X/10  — [reason]
───────────────────────────────
VERDICT: [STRONG / NEEDS WORK / WEAK]
```

5. For any dimension scoring below 7 — provide a specific rewrite.
   Label it: "REWRITE: Hook" etc.

6. End with: **Top 1 thing to fix** (the lowest-scoring dimension).

## Competitor Scoring
If --competitor flag: fetch their recent posts via Zernio MCP, score the
last 3 posts, output a comparison table vs strikepanel benchmarks.
