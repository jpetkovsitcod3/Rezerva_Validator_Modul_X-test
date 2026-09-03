"""
Upstash FREE TIER Redis client — no account or API key required.

Free-tier endpoints (all unauthenticated):
  GET  https://upstash.com/start-redis            -> instructions (markdown)
  POST https://upstash.com/start-redis            -> create / re-fetch database (markdown)
  GET  https://upstash.com/start-redis/metrics/{id} -> usage metrics (json)

A free database lives 3 days unless claimed at the console URL.
Idempotency-Key header = a UUIDv4 that becomes the database id.
Re-posting the same UUID re-fetches credentials (retry-safe).
"""

import re
import uuid
import requests

START_REDIS = "https://upstash.com/start-redis"
AGENT = "bridge-modul-x-agent"


class FreeTierDB:
    """Parsed credentials from a start-redis response."""

    def __init__(self, db_id: str, endpoint: str, token: str, expires: str, console_url: str):
        self.db_id = db_id
        self.endpoint = endpoint
        self.token = token
        self.expires = expires
        self.console_url = console_url

    def connection_string(self, db: int = 0) -> str:
        """rediss://default:TOKEN@ENDPOINT:6379/DB"""
        return f"rediss://default:{self.token}@{self.endpoint}:6379/{db}"

    def __repr__(self) -> str:
        return f"FreeTierDB(id={self.db_id}, endpoint={self.endpoint}, expires={self.expires})"


def _parse_credential_markdown(text: str) -> FreeTierDB:
    """Extract structured credentials from the start-redis markdown response."""
    def grab(field: str) -> str:
        m = re.search(rf"\*\*{field}:\*\*\s*(.+?)(?:\n|$)", text)
        if not m:
            raise ValueError(f"Could not parse {field} from start-redis response")
        return m.group(1).strip()

    # Endpoint may be a bare host or a markdown link — take the URL/host.
    endpoint_raw = grab("Endpoint")
    endpoint = endpoint_raw
    link = re.search(r"\((https?://[^)]+)\)", endpoint_raw)
    if link:
        endpoint = link.group(1)
    # strip scheme if present so we can rebuild the connection string
    endpoint = re.sub(r"^https?://", "", endpoint)

    console_raw = ""
    cm = re.search(r"\*\*Console:\*\*\s*(.+?)(?:\n|$)", text)
    if not cm:
        # fallback: find any console URL in the text
        cu = re.search(r"(https://upstash\.com/start-redis/console/\S+)", text)
        console_raw = cu.group(1) if cu else ""
    else:
        console_raw = cm.group(1).strip()

    return FreeTierDB(
        db_id=grab("Database ID"),
        endpoint=endpoint,
        token=grab("Token"),
        expires=grab("Expires"),
        console_url=console_raw,
    )


def create_database(db_id: str = "", agent: str = AGENT) -> FreeTierDB:
    """
    Create a free database, or re-fetch an existing one by id.

    Pass a UUIDv4 as db_id to set your own id (retry-safe). Pass "" to let
    the server assign one. Returns parsed credentials.
    """
    if db_id == "":
        db_id = str(uuid.uuid4())
    headers = {
        "Idempotency-Key": db_id,
        "User-Agent": agent,
        "Accept": "text/markdown, text/plain",
    }
    resp = requests.post(START_REDIS, headers=headers, timeout=30)
    if not resp.ok:
        raise RuntimeError(f"start-redis failed: {resp.status_code} {resp.text[:200]}")
    return _parse_credential_markdown(resp.text)


def get_metrics(db_id: str, agent: str = AGENT) -> dict:
    """Return usage metrics dict for a free database (empty dict on failure)."""
    headers = {"User-Agent": agent, "Accept": "application/json"}
    resp = requests.get(f"{START_REDIS}/metrics/{db_id}", headers=headers, timeout=15)
    if not resp.ok:
        return {}
    return resp.json()


def get_instructions(agent: str = AGENT) -> str:
    """Return the raw markdown instructions from Upstash."""
    resp = requests.get(START_REDIS, headers={"User-Agent": agent, "Accept": "text/markdown"}, timeout=15)
    return resp.text if resp.ok else ""


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    import argparse
    import json as _json

    parser = argparse.ArgumentParser(description="Upstash FREE TIER Redis")
    sub = parser.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("create", help="Create a free database (or re-fetch by id)")
    c.add_argument("--id", default="", help="UUIDv4 (= database id). omit to auto-generate.")
    c.add_argument("--agent", default=AGENT)

    m = sub.add_parser("metrics", help="Get usage metrics")
    m.add_argument("id")
    m.add_argument("--agent", default=AGENT)

    sub.add_parser("instructions", help="Show the Upstash instructions markdown")

    args = parser.parse_args()

    if args.cmd == "create":
        db = create_database(db_id=args.id, agent=args.agent)
        print(f"Database ID:   {db.db_id}")
        print(f"Endpoint:      {db.endpoint}")
        print(f"Token:         {db.token}")
        print(f"Expires:       {db.expires}")
        print(f"Console:       {db.console_url}")
        print(f"Connection:    {db.connection_string(0)}")
        print()
        print("NOTE: free-tier databases support ONLY db 0.")
        print("For Celery, create separate databases (broker, result) and use")
        print("their db-0 connection strings in CELERY_BROKER_URL / RESULT_BACKEND.")

    elif args.cmd == "metrics":
        print(_json.dumps(get_metrics(args.id, args.agent), indent=2))

    elif args.cmd == "instructions":
        print(get_instructions(args.agent))
