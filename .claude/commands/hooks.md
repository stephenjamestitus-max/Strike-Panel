# /hooks — Hook & Copy Variation Engine

## Usage
```
/hooks --seed="Most skincare routines are making your skin worse" --count=50 --audience="female, 28-45, problem-aware"
/hooks --seed="..." --frameworks="PAS,BAB,pattern-interrupt" --count=100 --audience="..."
```

## Parameters
- --seed (required): The seed hook or winning angle as a quoted string
- --frameworks (default: "PAS,BAB,AIDA"): Framework list — "PAS", "BAB", "AIDA",
  "pattern-interrupt", "social-proof", "fear-appeal", "curiosity-gap"
- --count (default: 50): Number of variations to generate
- --audience (required): Audience description — age, gender, awareness level, pain points
- --output (default: ./creatives/hooks-{date}.csv): Output CSV path

## Framework Definitions

**PAS (Problem/Agitate/Solution)**
Name the problem → make it emotionally painful → introduce the solution.
Headline: "[Problem statement that hits home]"
Body: "Every day you [problem], you're [negative consequence]. It doesn't have to be this way. [Product] [solves it]."

**BAB (Before/After/Bridge)**
Current painful state → ideal future state → product as the bridge.
Headline: "[Specific aspirational result]"
Body: "Before [product]: [painful state]. After [product]: [desired state]. The bridge: [how product achieves this]."

**AIDA (Attention/Interest/Desire/Action)**
Headline: "[Pattern interrupt or bold claim]"
Body: "[Surprising hook]. [Specific proof]. [Desire statement]. [CTA with urgency]."

**Pattern Interrupt**
Break expected patterns to force attention. Start with "Stop.", "Wait.", "Don't [expected action].", numbers as openers, rhetorical questions.

**Social Proof**
Lead with credibility — customer count, transformation testimonial, authority endorsement, before/after result.

**Fear Appeal**
Identify threat → quantify cost of inaction → offer solution. Focus on realistic consequences.

**Curiosity Gap**
"The [unexpected thing] about [familiar topic]", "Why [common belief] is wrong".

## Instructions

1. Parse seed and audience — extract core angle, product reference, implied pain
   point, current hook structure, demographics, awareness level, primary pain points.

2. Apply brand voice filter — tone guidelines, prohibited words, preferred vocabulary.

3. Generate variations per framework — distribute --count evenly across --frameworks.
   For each framework vary:
   - Emotional intensity (subtle vs. strong)
   - Specificity (numbers vs. general)
   - POV (second/first/third person)
   - Hook trigger (pain avoidance / aspiration / curiosity / social proof)
   Each variation needs:
   - primary_text (125 chars max)
   - headline (40 chars max)
   - description (30 chars max)

4. Tag each variation:
   - framework
   - emotional_register (fear/aspiration/curiosity/social_proof/humor/urgency)
   - awareness_match (funnel stage it targets)
   - recommended_placement (FEED/STORY/REEL/MESSENGER)

5. Format CSV with columns:
   ad_name, primary_text, headline, description, framework, emotional_register,
   awareness_match, recommended_placement, seed_angle
   Name each: hook_{framework}_{register}_{NNN}.

6. Write summary at top: total variations, breakdown by framework, top 3
   recommended hooks to test first, testing note:
   "Run 5-10 hooks in a $5/day ABO test for 3-4 days before scaling winners."

## Error Handling
- --seed under 5 words: request more detail, do not generate
- --count > 200: cap at 200, warn about quality degradation
