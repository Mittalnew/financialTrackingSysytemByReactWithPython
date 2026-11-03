"""
Auth routes: signup, login, me, profile update.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth_utils import (
    check_password,
    get_current_user,
    hash_password,
    make_token,
    user_to_out,
)
from database import get_db
from models import User
from schemas import LoginIn, ProfileUpdate, SignupIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenOut)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    """Create user + return token (auto-login after signup)."""
    exists = db.query(User).filter(User.email == body.email.lower()).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name.strip(),
        email=body.email.lower().strip(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenOut(token=make_token(user.id), user=user_to_out(user))


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    """Check email+password, return token + user."""
    user = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if not user or not check_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong email or password",
        )
    return TokenOut(token=make_token(user.id), user=user_to_out(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    """Who am I? Needs Bearer token."""
    return user_to_out(user)


@router.patch("/me", response_model=UserOut)
def update_me(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update name / email / currency (Settings page)."""
    if body.name is not None:
        user.name = body.name.strip()
    if body.email is not None:
        user.email = body.email.lower().strip()
    if body.currency is not None:
        user.currency = body.currency
    db.commit()
    db.refresh(user)
    return user_to_out(user)
