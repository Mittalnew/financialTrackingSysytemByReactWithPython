"""
Simple settings — values from env, with safe local defaults.

Copy keys into project .env if you want (optional for local learning).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root (one folder above backend/) and from backend/
_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

# JWT signing — change before real deploy (Render can auto-generate SECRET_KEY)
SECRET_KEY = os.getenv("SECRET_KEY", "fintrack-dev-secret-change-later")
if SECRET_KEY == "fintrack-dev-secret-change-later" and os.getenv("RENDER"):
    raise RuntimeError("Set SECRET_KEY in Render env — do not use the local default.")

# Access JWT dies fast; refresh lives longer in the DB
ACCESS_MINUTES = int(os.getenv("ACCESS_MINUTES", "15"))
REFRESH_DAYS = int(os.getenv("REFRESH_DAYS", "14"))

# Login lockout after too many wrong passwords
LOCKOUT_ATTEMPTS = int(os.getenv("LOCKOUT_ATTEMPTS", "5"))
LOCKOUT_MINUTES = int(os.getenv("LOCKOUT_MINUTES", "15"))

# Verify / reset email links expire after this many hours
EMAIL_TOKEN_HOURS = int(os.getenv("EMAIL_TOKEN_HOURS", "24"))

# Resend: leave empty → we print the link in the server console (same APIs)
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
EMAIL_FROM = os.getenv("EMAIL_FROM", "Fintrack <onboarding@resend.dev>")

# Where users open the React app (login page after verify, reset form).
# Local:  http://127.0.0.1:5173
# Deploy: https://your-real-domain.com
FRONTEND_URL = (
    os.getenv("FRONTEND_URL") or os.getenv("APP_URL") or "http://127.0.0.1:5173"
).strip().rstrip("/")

# Public API URL — verify/reset *email links* hit the API first (always up with uvicorn).
# Local:  http://127.0.0.1:8003
# Deploy: https://api.your-domain.com
API_PUBLIC_URL = (
    os.getenv("API_PUBLIC_URL") or os.getenv("VITE_API_URL") or "http://127.0.0.1:8003"
).strip().rstrip("/")

# Database: set DATABASE_URL for Postgres (Neon). Empty → local SQLite file.
# Neon example: postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()


def cors_allow_origins() -> list[str]:
    """
    Browser origins allowed to call the API.
    - CORS_ORIGINS=* → allow all (local only / emergency)
    - CORS_ORIGINS=url1,url2 → those origins
    - unset → FRONTEND_URL + local Vite
    """
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if raw == "*":
        return ["*"]
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    origins = {
        FRONTEND_URL,
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
    }
    return sorted(origins)
