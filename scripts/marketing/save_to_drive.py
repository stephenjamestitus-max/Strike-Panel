#!/usr/bin/env python3
"""
save_to_drive.py
Saves content_batch.json to a Google Sheet as a content calendar.
Requires GOOGLE_SERVICE_ACCOUNT_JSON env var (base64 encoded).
"""

import os
import json
import base64
import urllib.request
import urllib.parse
import time
import hmac
import hashlib
from datetime import datetime

BATCH_FILE = os.path.join(os.path.dirname(__file__), "content_batch.json")
SHEET_ID   = os.environ.get("GOOGLE_SHEET_ID", "")
SA_JSON_B64 = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")

# Google Sheets API — requires service account with Sheets scope
SCOPES = "https://www.googleapis.com/auth/spreadsheets"

def get_access_token() -> str:
    if not SA_JSON_B64:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON not set")

    sa = json.loads(base64.b64decode(SA_JSON_B64).decode("utf-8"))

    import struct, binascii

    now = int(time.time())
    header = base64.urlsafe_b64encode(json.dumps({"alg":"RS256","typ":"JWT"}).encode()).rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(json.dumps({
        "iss": sa["client_email"],
        "scope": SCOPES,
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now,
        "exp": now + 3600,
    }).encode()).rstrip(b"=").decode()

    # Sign with RSA — use cryptography library if available
    try:
        from cryptography.hazmat.primitives import serialization, hashes
        from cryptography.hazmat.primitives.asymmetric import padding
        from cryptography.hazmat.backends import default_backend

        private_key = serialization.load_pem_private_key(
            sa["private_key"].encode(), password=None, backend=default_backend()
        )
        message = f"{header}.{payload}".encode()
        signature = private_key.sign(message, padding.PKCS1v15(), hashes.SHA256())
        sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()
        jwt = f"{header}.{payload}.{sig_b64}"
    except ImportError:
        raise ImportError("Install cryptography: pip install cryptography")

    # Exchange JWT for access token
    body = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt,
    }).encode()

    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token", data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["access_token"]

def sheets_request(token: str, method: str, path: str, body=None):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method=method
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def main():
    print("Loading content batch...")
    with open(BATCH_FILE) as f:
        batch = json.load(f)

    print("Authenticating with Google...")
    token = get_access_token()

    # Build rows
    headers = ["Date", "Time", "Platform", "Pillar", "Caption", "Status",
               "Impressions", "Likes", "Retweets", "Replies"]
    rows = [headers]

    for post in batch["posts"]:
        perf = post.get("performance", {})
        rows.append([
            post["date"],
            post["time"],
            post["platform"].upper(),
            post["pillar"][:60],
            post["caption"],
            post["status"],
            perf.get("impressions", 0),
            perf.get("likes", 0),
            perf.get("retweets", 0),
            perf.get("replies", 0),
        ])

    # Clear and write sheet
    range_name = f"Sheet1!A1:J{len(rows)}"
    sheets_request(token, "PUT",
        f"/values/{urllib.parse.quote(range_name)}?valueInputOption=RAW",
        {"range": range_name, "majorDimension": "ROWS", "values": rows}
    )

    print(f"✓ Updated Google Sheet with {len(rows)-1} posts")
    print(f"  Sheet ID: {SHEET_ID}")

if __name__ == "__main__":
    main()
