"""
Auth helpers: hash password + make/read JWT token.

Flow:
  signup/login → check password → give token string
  later requests → send token in header → we know which user
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from models import User

# Demo secret — change before real deploy
SECRET_KEY = "fintrack-dev-secret-change-later"
ALGORITHM = "HS256"
TOKEN_DAYS = 7

# auto_error=False → we return a clear 401 instead of bare 403
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(plain: str) -> str:
    """Turn password into a safe hash string for the DB."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(plain: str, password_hash: str) -> bool:
    """True if password matches the stored hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))


def make_token(user_id: int) -> str:
    """Small signed card that says 'I am user X' for TOKEN_DAYS."""
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def user_to_out(user: User):
    """DB User → JSON shape frontend expects (id as string)."""
    from schemas import UserOut

    return UserOut(
        id=str(user.id),
        name=user.name,
        email=user.email,
        currency=user.currency,
    )


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Read Authorization: Bearer <token>, find that user in DB.
    If bad/missing → 401 Unauthorized.
    """
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in. Open Login and sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = creds.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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
