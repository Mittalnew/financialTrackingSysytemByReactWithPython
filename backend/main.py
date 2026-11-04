"""
Fintrack API — entry point.

Local:
  uvicorn main:app --reload --port 8003

Docker / Render:
  uvicorn main:app --host 0.0.0.0 --port $PORT
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from config import API_PUBLIC_URL, FRONTEND_URL, cors_allow_origins
from database import IS_SQLITE, Base, engine
from routers import auth, budgets, transactions

# Create any missing tables (Postgres or SQLite)
Base.metadata.create_all(bind=engine)


def _add_user_columns_if_needed() -> None:
    """
    Only for old local SQLite files.
    create_all does NOT add new columns to an existing SQLite table.
    Fresh Postgres (Neon) gets full schema from create_all — no ALTER needed.
    """
    if not IS_SQLITE:
        return
    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    with engine.begin() as conn:
        if "email_verified" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 1"))
            conn.execute(text("UPDATE users SET email_verified = 1"))
        if "failed_login_count" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN failed_login_count INTEGER DEFAULT 0"))
        if "locked_until" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN locked_until DATETIME"))


_add_user_columns_if_needed()

app = FastAPI(
    title="Fintrack API",
    description="Simple backend for Fintrack — salary → spend → left",
    version="0.3.0",
)

_origins = cors_allow_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budgets.router)


@app.get("/")
def home():
    return {
        "app": "Fintrack API",
        "docs": "/docs",
        "ok": True,
        "db": "sqlite" if IS_SQLITE else "postgres",
        "frontend_url": FRONTEND_URL,
        "api_public_url": API_PUBLIC_URL,
    }
