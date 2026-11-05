"""
Auth helpers: password hash, short access JWT, refresh/email tokens.

Simple mental model:
  access token  = short "pass" for API (JWT, ~15 min)
  refresh token = longer "key" stored hashed in DB
  email token   = one-time link for verify / reset (also hashed in DB)
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from config import ACCESS_MINUTES, EMAIL_TOKEN_HOURS, REFRESH_DAYS, SECRET_KEY
from database import get_db
from models import EmailToken, RefreshSession, User

ALGORITHM = "HS256"
bearer_scheme = HTTPBearer(auto_error=False)


# ---------- password ----------


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(plain: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))


# ---------- random tokens (refresh + email links) ----------


def new_raw_token() -> str:
    """Long random string we send to the browser / put in email links."""
    return secrets.token_urlsafe(32)


def hash_token(raw: str) -> str:
    """Store only the hash in DB — if DB leaks, raw token still useless."""
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


# ---------- access JWT ----------


def make_access_token(user_id: int) -> str:
    """Small signed card: 'I am user X' for ACCESS_MINUTES."""
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ---------- refresh session in DB ----------


def create_refresh_session(db: Session, user_id: int) -> str:
    """Save hashed refresh token; return the raw token once."""
    raw = new_raw_token()
    row = RefreshSession(
        user_id=user_id,
        token_hash=hash_token(raw),
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_DAYS),
    )
    db.add(row)
    db.commit()
    return raw


def find_refresh_session(db: Session, raw: str) -> RefreshSession | None:
    return (
        db.query(RefreshSession)
        .filter(RefreshSession.token_hash == hash_token(raw))
        .first()
    )


def delete_refresh_session(db: Session, raw: str) -> None:
    row = find_refresh_session(db, raw)
    if row:
        db.delete(row)
        db.commit()


def delete_all_refresh_for_user(db: Session, user_id: int) -> None:
    db.query(RefreshSession).filter(RefreshSession.user_id == user_id).delete()
    db.commit()


# ---------- email one-time tokens ----------


def create_email_token(db: Session, user_id: int, purpose: str) -> str:
    """purpose = 'verify' or 'reset'. Returns raw token for the email link."""
    # Drop old unused tokens of same purpose so inbox has one clear link
    db.query(EmailToken).filter(
        EmailToken.user_id == user_id,
        EmailToken.purpose == purpose,
        EmailToken.used == False,  # noqa: E712
    ).delete()

    raw = new_raw_token()
    row = EmailToken(
        user_id=user_id,
        token_hash=hash_token(raw),
        purpose=purpose,
        expires_at=datetime.utcnow() + timedelta(hours=EMAIL_TOKEN_HOURS),
        used=False,
    )
    db.add(row)
    db.commit()
    return raw


def use_email_token(db: Session, raw: str, purpose: str) -> EmailToken:
    """Find valid unused token or raise 400."""
    row = (
        db.query(EmailToken)
        .filter(
            EmailToken.token_hash == hash_token(raw),
            EmailToken.purpose == purpose,
        )
        .first()
    )
    if not row or row.used:
        raise HTTPException(status_code=400, detail="Invalid or already used link")
    if row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This link has expired")
    row.used = True
    db.commit()
    return row


# ---------- shared helpers ----------


def user_to_out(user: User):
    from schemas import UserOut

    return UserOut(
        id=str(user.id),
        name=user.name,
        email=user.email,
        currency=user.currency,
        savings_goal=user.savings_goal or 0,
        onboarded=bool(user.onboarded),
    )


def tokens_for_user(db: Session, user: User):
    """After successful login: access JWT + new refresh session."""
    from schemas import TokenOut

    return TokenOut(
        access_token=make_access_token(user.id),
        refresh_token=create_refresh_session(db, user.id),
        user=user_to_out(user),
    )


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Read Authorization: Bearer <access_token> → User, or 401."""
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in. Open Login and sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
