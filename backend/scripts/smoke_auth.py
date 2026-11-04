"""
Smoke: signup → verify → login → transaction → logout

Usage (from backend/, venv on):
  python scripts/smoke_auth.py
  python scripts/smoke_auth.py http://127.0.0.1:8003
  python scripts/smoke_auth.py https://fintrack-api.onrender.com
"""

from __future__ import annotations

import sys
import uuid
from datetime import date
from pathlib import Path

# Allow `python scripts/smoke_auth.py` from backend/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx

from auth_utils import create_email_token
from database import SessionLocal, IS_SQLITE
from models import User


def main() -> None:
    base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8003").rstrip("/")
    # Unique inbox; Resend free may skip send — we verify via DB token below
    email = f"smoke_{uuid.uuid4().hex[:8]}@example.com"
    password = "smoke-pass-123"
    client = httpx.Client(base_url=base, timeout=40)

    print("base", base, "db_local_sqlite" if IS_SQLITE else "db_postgres_config")

    r = client.get("/")
    r.raise_for_status()
    print("1) health", r.json().get("ok"), r.json().get("db"))

    r = client.post("/auth/signup", json={"name": "Smoke", "email": email, "password": password})
    r.raise_for_status()
    print("2) signup", r.json().get("message", "")[:60])

    # Verify via DB token (works for local/Neon when this script can reach same DB).
    # On Render-only smoke without DB access: open verify email link manually, skip this block.
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print("USER_MISSING — is DATABASE_URL the same as the server?")
        sys.exit(1)
    raw = create_email_token(db, user.id, "verify")
    db.close()

    r = client.post("/auth/verify-email", json={"token": raw})
    r.raise_for_status()
    print("3) verify", r.json())

    r = client.post("/auth/login", json={"email": email, "password": password})
    r.raise_for_status()
    data = r.json()
    access, refresh = data["access_token"], data["refresh_token"]
    print("4) login ok")

    headers = {"Authorization": f"Bearer {access}"}
    r = client.post(
        "/transactions",
        headers=headers,
        json={
            "date": date.today().isoformat(),
            "title": "Smoke salary",
            "category": "Salary",
            "type": "income",
            "amount": 1000,
            "notes": "smoke",
        },
    )
    r.raise_for_status()
    print("5) transaction", r.json().get("id"))

    r = client.post("/auth/logout", json={"refresh_token": refresh})
    r.raise_for_status()
    print("6) logout", r.json())

    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 401, r.text
    print("7) refresh after logout blocked")
    print("SMOKE_OK")


if __name__ == "__main__":
    main()
