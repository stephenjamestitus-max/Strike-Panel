#!/usr/bin/env python3
"""
generate_content.py
Reads brand context from GitHub, calls Claude API to generate
a week of X posts, saves structured JSON output.
"""

import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
BRAND_URL = "https://raw.githubusercontent.com/stephenjamestitus-max/Strike-Panel/main/.agents/product-marketing-context.md"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "content_batch.json")

CONTENT_PILLARS = [
    "Problem/solution — one sharp line about the problem, one about the fix",
    "Social proof — build around the real coach testimonial in the brief",
    "Fight camp / weight cut — specific coach scenario, fight week detail",
    "Contrarian take — challenge how most coaches currently operate",
    "Soft sell — clean CTA, no hype, link to Gumroad",
    "Question — ask coaches something that sparks a reply",
    "Coaching insight — genuine tip a combat sports coach would value",
]

def fetch_brand_context():
    req = urllib.request.Request(BRAND_URL)
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode("utf-8")

def call_claude(prompt: str) -> str:
    payload = json.dumps({
        "model": "claude-sonnet-4-6",
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["content"][0]["text"]

def generate_week(brand_context: str) -> list:
    today = datetime.utcnow()
    posts = []

    for i, pillar in enumerate(CONTENT_PILLARS):
        post_date = today + timedelta(days=i)
        # Best posting times: 8am, 12pm, 6pm UTC (adjust for audience)
        post_time = "08:00" if i % 3 == 0 else "12:00" if i % 3 == 1 else "18:00"

        prompt = f"""You are writing for StrikePanel™'s X (Twitter) account.

Read this brand brief in full — follow every rule in it exactly:
{brand_context}

Write ONE X post for this content pillar:
{pillar}

Rules:
- Under 240 characters
- Short sentences, active voice
- Max 1 emoji, only if purposeful
- Max 2 hashtags, only if relevant: #CombatSports #CoachingTools
- Never use: game-changer, revolutionary, unlock, platform, wellness
- Sound like a real coach typed this at 6am
- If soft sell: end with https://strikepanel.gumroad.com/l/strikepanel

Return ONLY the post text. Nothing else. No quotes. No labels."""

        print(f"Generating post {i+1}/7: {pillar[:40]}...")
        text = call_claude(prompt).strip().strip('"')

        posts.append({
            "id": i + 1,
            "date": post_date.strftime("%Y-%m-%d"),
            "time": post_time,
            "platform": "x",
            "pillar": pillar,
            "caption": text,
            "hashtags": "",
            "status": "scheduled",
            "performance": {
                "impressions": 0,
                "likes": 0,
                "retweets": 0,
                "replies": 0,
            }
        })

    return posts

def main():
    print("Fetching brand context from GitHub...")
    brand = fetch_brand_context()

    print("Generating 7 posts with Claude...")
    posts = generate_week(brand)

    with open(OUTPUT_FILE, "w") as f:
        json.dump({
            "generated_at": datetime.utcnow().isoformat(),
            "week_start": posts[0]["date"],
            "posts": posts
        }, f, indent=2)

    print(f"\n✓ Saved {len(posts)} posts to content_batch.json")
    for p in posts:
        print(f"\n[{p['date']} {p['time']}] {p['pillar'][:35]}...")
        print(f"  {p['caption'][:100]}...")

if __name__ == "__main__":
    main()
