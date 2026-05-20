#!/usr/bin/env python3
"""
post_to_x.py
Reads today's scheduled post from content_batch.json
and publishes it to X via Twitter API v2.
"""

import os
import json
import hmac
import hashlib
import time
import urllib.request
import urllib.parse
import base64
import secrets
from datetime import datetime, timezone

# X API credentials — set as GitHub Secrets / env vars
X_API_KEY             = os.environ.get("X_API_KEY", "")
X_API_SECRET          = os.environ.get("X_API_SECRET", "")
X_ACCESS_TOKEN        = os.environ.get("X_ACCESS_TOKEN", "")
X_ACCESS_TOKEN_SECRET = os.environ.get("X_ACCESS_TOKEN_SECRET", "")

BATCH_FILE = os.path.join(os.path.dirname(__file__), "content_batch.json")
POSTED_FILE = os.path.join(os.path.dirname(__file__), "posted_log.json")

def oauth1_header(method: str, url: str, params: dict) -> str:
    nonce = secrets.token_hex(16)
    timestamp = str(int(time.time()))

    oauth_params = {
        "oauth_consumer_key": X_API_KEY,
        "oauth_nonce": nonce,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": timestamp,
        "oauth_token": X_ACCESS_TOKEN,
        "oauth_version": "1.0",
    }

    all_params = {**params, **oauth_params}
    sorted_params = "&".join(
        f"{urllib.parse.quote(k, safe='')}={urllib.parse.quote(str(v), safe='')}"
        for k, v in sorted(all_params.items())
    )

    base_string = "&".join([
        method.upper(),
        urllib.parse.quote(url, safe=""),
        urllib.parse.quote(sorted_params, safe=""),
    ])

    signing_key = f"{urllib.parse.quote(X_API_SECRET, safe='')}&{urllib.parse.quote(X_ACCESS_TOKEN_SECRET, safe='')}"
    signature = base64.b64encode(
        hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()
    ).decode()

    oauth_params["oauth_signature"] = signature
    header = "OAuth " + ", ".join(
        f'{urllib.parse.quote(k, safe="")}="{urllib.parse.quote(str(v), safe="")}"'
        for k, v in sorted(oauth_params.items())
    )
    return header

def post_tweet(text: str) -> dict:
    url = "https://api.twitter.com/2/tweets"
    body = json.dumps({"text": text}).encode("utf-8")
    auth = oauth1_header("POST", url, {})

    req = urllib.request.Request(
        url, data=body,
        headers={
            "Authorization": auth,
            "Content-Type": "application/json",
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def load_posted_log() -> list:
    if os.path.exists(POSTED_FILE):
        with open(POSTED_FILE) as f:
            return json.load(f)
    return []

def save_posted_log(log: list):
    with open(POSTED_FILE, "w") as f:
        json.dump(log, f, indent=2)

def main():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now_hour = int(datetime.now(timezone.utc).strftime("%H"))

    print(f"Checking for scheduled posts on {today}...")

    with open(BATCH_FILE) as f:
        batch = json.load(f)

    posted_log = load_posted_log()
    posted_ids = {entry["id"] for entry in posted_log}

    posted_any = False
    for post in batch["posts"]:
        if post["date"] != today:
            continue
        if post["id"] in posted_ids:
            print(f"Post {post['id']} already sent — skipping")
            continue
        if post["status"] != "scheduled":
            continue

        # Check time window — post within 1 hour of scheduled time
        sched_hour = int(post["time"].split(":")[0])
        if abs(now_hour - sched_hour) > 1:
            print(f"Post {post['id']} not in time window ({post['time']}) — skipping")
            continue

        print(f"Posting: {post['caption'][:80]}...")

        try:
            result = post_tweet(post["caption"])
            tweet_id = result.get("data", {}).get("id", "unknown")

            posted_log.append({
                "id": post["id"],
                "tweet_id": tweet_id,
                "date": today,
                "caption": post["caption"],
                "posted_at": datetime.now(timezone.utc).isoformat(),
            })
            post["status"] = "posted"
            save_posted_log(posted_log)

            print(f"✓ Posted tweet ID: {tweet_id}")
            posted_any = True

        except Exception as e:
            print(f"✗ Failed to post: {e}")

    # Save updated batch
    with open(BATCH_FILE, "w") as f:
        json.dump(batch, f, indent=2)

    if not posted_any:
        print("No posts scheduled for this time window.")

if __name__ == "__main__":
    main()
