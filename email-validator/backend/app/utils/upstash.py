"""
Upstash Developer API client — provision and manage Redis databases programmatically.

Docs: https://upstash.com/docs/developer-api/
REST endpoint: https://api.upstash.com/v2/redis/databases
Auth: Basic base64(email:management_api_key)

The management API key is created in the Upstash console:
  Account > Management API > Create API Key
It is shown ONLY at creation time — store it immediately.
"""

import base64
import os
import requests

UPSTASH_API = "https://api.upstash.com/v2/redis"

# --------------------------------------------------------------------------- #
# Configuration — set via environment or pass explicitly to UpstashClient.
# --------------------------------------------------------------------------- #
UPSTASH_MANAGEMENT_KEY = os.getenv("UPSTASH_MANAGEMENT_KEY", "")
UPSTASH_ACCOUNT_EMAIL = os.getenv("UPSTASH_ACCOUNT_EMAIL", "")


class UpstashError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        super().__init__(f"Upstash API {status}: {message}")


class UpstashClient:
    """Thin wrapper over the Upstash Redis Developer API (v2)."""

    def __init__(self, email: str = "", api_key: str = ""):
        self.email = email or UPSTASH_ACCOUNT_EMAIL
        self.api_key = api_key or UPSTASH_MANAGEMENT_KEY
        if not self.email or not self.api_key:
            raise UpstashError(
                401,
                "Missing Upstash credentials. Set UPSTASH_ACCOUNT_EMAIL and "
                "UPSTASH_MANAGEMENT_KEY (env or constructor).",
            )
        cred = base64.b64encode(f"{self.email}:{self.api_key}".encode()).decode()
        self._session = requests.Session()
        self._session.headers.update(
            {
                "Authorization": f"Basic {cred}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        )

    # -- low-level request --------------------------------------------------- #
    def _request(self, method: str, path: str, **kwargs) -> dict | list:
        url = f"{UPSTASH_API}{path}"
        resp = self._session.request(method, url, timeout=15, **kwargs)
        if not resp.ok:
            raise UpstashError(resp.status_code, resp.text)
        return resp.json()

    # -- databases ----------------------------------------------------------- #
    def list_databases(self) -> list[dict]:
        """Return all Redis databases in the account."""
        return self._request("GET", "/databases")

    def get_database(self, database_id: str) -> dict:
        """Return details for a single database (incl. connection string)."""
        return self._request("GET", f"/databases/{database_id}")

    def create_database(
        self,
        name: str,
        region: str = "global",
        primary_region: str = "us-east-1",
        tls: bool = True,
        eviction: bool = False,
    ) -> dict:
        """
        Create a new Redis database.

        region: "global" | "single"
        primary_region: e.g. "us-east-1", "eu-west-1", "us-west-2"
        tls:  enable TLS (rediss://) — recommended
        eviction: enable eviction when memory is full
        """
        body = {
            "database_name": name,
            "region": region,
            "primary_region": primary_region if region != "global" else None,
            "tls": tls,
            "eviction": eviction,
        }
        body = {k: v for k, v in body.items() if v is not None}
        return self._request("POST", "/databases", json=body)

    def delete_database(self, database_id: str) -> dict:
        """Delete a database by id."""
        return self._request("DELETE", f"/databases/{database_id}")

    def rename_database(self, database_id: str, new_name: str) -> dict:
        return self._request(
            "PATCH", f"/databases/{database_id}", json={"database_name": new_name}
        )

    def disable_eviction(self, database_id: str) -> dict:
        return self._request(
            "PATCH", f"/databases/{database_id}", json={"eviction": False}
        )

    def enable_eviction(self, database_id: str) -> dict:
        return self._request(
            "PATCH", f"/databases/{database_id}", json={"eviction": True}
        )

    # -- connection helper --------------------------------------------------- #
    @staticmethod
    def connection_string(db: dict) -> str:
        """Build a redis(s):// connection string from a database dict."""
        user = db.get("user", "default")
        pw = db.get("password", db.get("endpoint_password", ""))
        host = db.get("endpoint", "")
        port = db.get("port", 6379)
        use_tls = db.get("tls", True)
        db_num = db.get("database_id", "")
        scheme = "rediss" if use_tls else "redis"
        return f"{scheme}://{user}:{pw}@{host}:{port}/{db_num}"


# --------------------------------------------------------------------------- #
# CLI helper — run provisioning from the command line
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    import argparse
    import json as _json

    parser = argparse.ArgumentParser(description="Upstash Redis provisioning")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list", help="List all databases")

    g = sub.add_parser("get", help="Get one database")
    g.add_argument("id", help="database id")

    c = sub.add_parser("create", help="Create a database")
    c.add_argument("--name", required=True)
    c.add_argument("--region", default="global")
    c.add_argument("--primary", default="us-east-1")
    c.add_argument("--no-tls", action="store_true")
    c.add_argument("--eviction", action="store_true")

    d = sub.add_parser("delete", help="Delete a database")
    d.add_argument("id")

    r = sub.add_parser("rename", help="Rename a database")
    r.add_argument("id")
    r.add_argument("name")

    conn = sub.add_parser("connection-string", help="Print connection string")
    conn.add_argument("id")

    args = parser.parse_args()
    client = UpstashClient()

    if args.cmd == "list":
        dbs = client.list_databases()
        for db in dbs:
            print(
                f"{db['database_id']}  {db.get('database_name'):30s}  "
                f"{db.get('region'):10s}  tls={db.get('tls')}  "
                f"endpoint={db.get('endpoint')}"
            )

    elif args.cmd == "get":
        print(_json.dumps(client.get_database(args.id), indent=2))

    elif args.cmd == "create":
        db = client.create_database(
            name=args.name,
            region=args.region,
            primary_region=args.primary,
            tls=not args.no_tls,
            eviction=args.eviction,
        )
        print("Created database:")
        print(_json.dumps(db, indent=2))
        print("\nConnection string:")
        print(UpstashClient.connection_string(db))

    elif args.cmd == "delete":
        print(_json.dumps(client.delete_database(args.id), indent=2))

    elif args.cmd == "rename":
        print(_json.dumps(client.rename_database(args.id, args.name), indent=2))

    elif args.cmd == "connection-string":
        db = client.get_database(args.id)
        print(UpstashClient.connection_string(db))
