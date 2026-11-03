"""
Database connection — SQLite file on disk.

Beginner note:
- SQLite = one file DB (fintrack.db). No Neon/Postgres setup needed to learn.
- Later we can switch the URL to Postgres without changing most code.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# File next to this backend folder
DATABASE_URL = "sqlite:///./fintrack.db"

# check_same_thread=False is needed for SQLite + FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Each request gets its own Session (talk channel to DB)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """All tables (User, Transaction, Budget) inherit from this."""

    pass


def get_db():
    """
    FastAPI dependency: open DB session, give to route, then close.

    Usage in a route:
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
