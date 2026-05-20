#!/usr/bin/env python3
"""
instagram_insights.py
Reads Instagram account insights via Graph API.
Saves top performing content types to insights_log.json.
Requires: IG_ACCESS_TOKEN, IG_ACCOUNT_ID as env vars.
"""

import os
import json
import urllib.request
import urllib.parse
from datetime import datetime

IG_ACCESS_TOKEN = os.environ.get("IG_ACCESS_TOKEN", "")
IG_ACCOUNT_ID   = os.environ.get("IG_ACCOUNT_ID", "")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "insights_log.json")

def graph_get(path: str, params: dict = {}) -> dict:
    params["access_token"] = IG_ACCESS_TOKEN
    url = f"https://graph.facebook.com/v18.0/{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read())

def get_recent_media() -> list:
    data = graph_get(f"{IG_ACCOUNT_ID}/media", {
        "fields": "id,caption,media_type,timestamp,like_count,comments_count",
        "limit": 20
    })
    return data.get("data", [])

def get_account_insights() -> dict:
    data = graph_get(f"{IG_ACCOUNT_ID}/insights", {
        "metric": "impressions,reach,profile_views,follower_count",
        "period": "day",
    })
    return data.get("data", [])

def analyse_top_content(media: list) -> dict:
    if not media:
        return {}

    by_type = {}
    for post in media:
        t = post.get("media_type", "UNKNOWN")
        likes = post.get("like_count", 0)
        comments = post.get("comments_count", 0)
        engagement = likes + (comments * 3)

        if t not in by_type:
            by_type[t] = {"count": 0, "total_engagement": 0, "posts": []}
        by_type[t]["count"] += 1
        by_type[t]["total_engagement"] += engagement
        by_type[t]["posts"].append({
            "id": post["id"],
            "caption": (post.get("caption", "") or "")[:80],
            "engagement": engagement,
            "timestamp": post.get("timestamp", ""),
        })

    for t in by_type:
        by_type[t]["avg_engagement"] = round(
            by_type[t]["total_engagement"] / by_type[t]["count"], 1
        )
        by_type[t]["posts"].sort(key=lambda x: x["engagement"], reverse=True)

    return by_type

def main():
    print("Fetching Instagram media...")
    media = get_recent_media()

    print("Analysing content performance...")
    analysis = analyse_top_content(media)

    print("Fetching account insights...")
    try:
        insights = get_account_insights()
    except Exception as e:
        insights = []
        print(f"  Note: Account insights require Instagram Business account: {e}")

    output = {
        "fetched_at": datetime.utcnow().isoformat(),
        "total_posts_analysed": len(media),
        "performance_by_type": analysis,
        "account_insights": insights,
        "recommendations": [],
    }

    # Generate recommendations
    if analysis:
        best_type = max(analysis.items(), key=lambda x: x[1]["avg_engagement"])
        output["recommendations"].append(
            f"Best performing content type: {best_type[0]} "
            f"(avg engagement: {best_type[1]['avg_engagement']})"
        )
        output["recommendations"].append(
            "Post more of what works — use this data to inform next week's content batch"
        )

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✓ Insights saved to insights_log.json")
    for rec in output["recommendations"]:
        print(f"  → {rec}")

if __name__ == "__main__":
    main()
