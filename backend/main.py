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
from routers import auth, budgets, categories, transactions

# Create any missing tables (Postgres or SQLite)
Base.metadata.create_all(bind=engine)


def _add_missing_columns() -> None:
    """create_all does not add columns to a table that already exists."""
    insp = inspect(engine)
    names = set(insp.get_table_names())
    flag = "1" if IS_SQLITE else "TRUE"

    if "users" in names:
        cols = {c["name"] for c in insp.get_columns("users")}
        with engine.begin() as conn:
            if IS_SQLITE and "email_verified" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 1"))
                conn.execute(text("UPDATE users SET email_verified = 1"))
            if IS_SQLITE and "failed_login_count" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN failed_login_count INTEGER DEFAULT 0"))
            if IS_SQLITE and "locked_until" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN locked_until DATETIME"))
            if "savings_goal" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN savings_goal FLOAT DEFAULT 0"))
            if "onboarded" not in cols:
                # People already using the app should not be sent through the form.
                conn.execute(text(f"ALTER TABLE users ADD COLUMN onboarded BOOLEAN DEFAULT {flag}"))
                conn.execute(text(f"UPDATE users SET onboarded = {flag}"))

    if "transactions" in names:
        cols = {c["name"] for c in insp.get_columns("transactions")}
        if "source" not in cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN source VARCHAR(20) DEFAULT 'manual'"))
        stamp = "DATETIME" if IS_SQLITE else "TIMESTAMPTZ"
        for column in ("created_at", "updated_at"):
            if column not in cols:
                with engine.begin() as conn:
                    conn.execute(
                        text(
                            f"ALTER TABLE transactions ADD COLUMN {column} {stamp} DEFAULT CURRENT_TIMESTAMP"
                        )
                    )
                    conn.execute(
                        text(f"UPDATE transactions SET {column} = CURRENT_TIMESTAMP WHERE {column} IS NULL")
                    )


_add_missing_columns()

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
app.include_router(categories.router)


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
