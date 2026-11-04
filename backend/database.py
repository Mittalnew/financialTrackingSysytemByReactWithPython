"""
Database connection.

Industry default: PostgreSQL (Neon free cloud is easy).
Local fallback: SQLite file if DATABASE_URL is not set.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from config import DATABASE_URL


def _make_url() -> str:
    """Pick Postgres from env, else SQLite next to this folder."""
    if DATABASE_URL:
        url = DATABASE_URL
        # Neon / most hosts give postgresql://... — tell SQLAlchemy to use psycopg v3
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]
        if url.startswith("postgresql://") and "+psycopg" not in url:
            url = "postgresql+psycopg://" + url[len("postgresql://") :]
        return url
    return "sqlite:///./fintrack.db"


SQLALCHEMY_DATABASE_URL = _make_url()
IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

# SQLite needs check_same_thread; Postgres does not
_connect_args = {"check_same_thread": False} if IS_SQLITE else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=_connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """All tables inherit from this."""

    pass


def get_db():
    """
    FastAPI dependency: open DB session, give to route, then close.

    Usage:
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
