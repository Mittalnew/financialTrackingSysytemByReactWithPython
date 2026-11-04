"""
Auth routes — production-style, still kept small.

Signup → verify email → login (access + refresh)
Forgot → email link → reset password
Wrong password 5x → temporary lock
"""

from datetime import datetime, timedelta
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from auth_utils import (
    check_password,
    create_email_token,
    create_refresh_session,
    delete_all_refresh_for_user,
    delete_refresh_session,
    find_refresh_session,
    get_current_user,
    hash_password,
    make_access_token,
    tokens_for_user,
    use_email_token,
    user_to_out,
)
from config import FRONTEND_URL, LOCKOUT_ATTEMPTS, LOCKOUT_MINUTES
from database import get_db
from email_service import send_reset_email, send_verify_email
from models import User
from schemas import (
    ChangePasswordIn,
    ForgotPasswordIn,
    LoginIn,
    LogoutIn,
    MessageOut,
    ProfileUpdate,
    RefreshIn,
    RefreshOut,
    ResendVerifyIn,
    ResetPasswordIn,
    SignupIn,
    TokenOut,
    UserOut,
    VerifyEmailIn,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=MessageOut)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    """Create user (not verified yet) + send verify link. No auto-login."""
    exists = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name.strip(),
        email=body.email.lower().strip(),
        password_hash=hash_password(body.password),
        email_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    raw = create_email_token(db, user.id, "verify")
    try:
        send_verify_email(user.email, raw)
    except Exception as exc:
        # Don't roll back the user — Resend free tier often rejects unknown recipients
        print("WARNING: verify email failed:", exc)
        return MessageOut(
            message="Account created, but the verify email could not be sent. Use Resend verification on the login page (or check server logs)."
        )

    return MessageOut(
        message="Account created. Check your email (or server console) for the verify link."
    )


@router.post("/verify-email", response_model=MessageOut)
def verify_email(body: VerifyEmailIn, db: Session = Depends(get_db)):
    """Mark email verified using the one-time link token (JSON — used by React page)."""
    row = use_email_token(db, body.token, "verify")
    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user.email_verified = True
    db.commit()
    return MessageOut(message="Email verified. You can sign in now.")


@router.get("/verify-link", response_class=HTMLResponse)
def verify_link(token: str, db: Session = Depends(get_db)):
    """
    Opened from the email. Works without Vite running.
    Verifies the token, then shows a simple success/error page.
    """
    login_href = f"{FRONTEND_URL}/login"
    try:
        row = use_email_token(db, token, "verify")
        user = db.get(User, row.user_id)
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        user.email_verified = True
        db.commit()
        title = "Email verified"
        msg = "You can sign in now."
        ok = True
    except HTTPException as exc:
        title = "Link not valid"
        msg = str(exc.detail)
        ok = False

    color = "#0b7a6e" if ok else "#b42318"
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>{title}</title>
<style>
  body{{font-family:system-ui,sans-serif;max-width:28rem;margin:4rem auto;padding:0 1rem;color:#14201c}}
  a{{display:inline-block;margin-top:1.25rem;padding:.75rem 1.25rem;background:{color};color:#fff;
     text-decoration:none;border-radius:.75rem;font-weight:600}}
</style></head>
<body>
  <h1>{title}</h1>
  <p>{msg}</p>
  <a href="{login_href}">Go to sign in</a>
</body></html>"""


@router.get("/reset-link")
def reset_link(token: str):
    """Email reset click → bounce to React reset page (needs frontend for the form)."""
    dest = f"{FRONTEND_URL}/reset-password?token={quote(token, safe='')}"
    return RedirectResponse(url=dest, status_code=302)


@router.post("/resend-verification", response_model=MessageOut)
def resend_verification(body: ResendVerifyIn, db: Session = Depends(get_db)):
    """
    Send a fresh verify link.
    Same message always — don't leak whether the email is registered.
    """
    user = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if user and not user.email_verified:
        raw = create_email_token(db, user.id, "verify")
        try:
            send_verify_email(user.email, raw)
        except Exception as exc:
            print("WARNING: resend verify email failed:", exc)
    return MessageOut(
        message="If that account needs verification, a new link was sent. Check inbox (and spam)."
    )


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    """Check email+password, lockout, verified → access + refresh."""
    user = db.query(User).filter(User.email == body.email.lower().strip()).first()

    # Same message if email missing — don't leak "email not found"
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong email or password",
        )

    # Still locked?
    if user.locked_until and user.locked_until > datetime.utcnow():
        mins = max(1, int((user.locked_until - datetime.utcnow()).total_seconds() // 60) + 1)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Too many wrong tries. Try again in about {mins} minute(s).",
        )

    if not check_password(body.password, user.password_hash):
        user.failed_login_count = (user.failed_login_count or 0) + 1
        if user.failed_login_count >= LOCKOUT_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
            user.failed_login_count = 0
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Too many wrong tries. Account locked for {LOCKOUT_MINUTES} minutes.",
            )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong email or password",
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email first (check inbox or server console).",
        )

    # Good login — clear lockout counters
    user.failed_login_count = 0
    user.locked_until = None
    db.commit()

    return tokens_for_user(db, user)


@router.post("/refresh", response_model=RefreshOut)
def refresh(body: RefreshIn, db: Session = Depends(get_db)):
    """Give a new access token (and rotate refresh) if refresh is still valid."""
    row = find_refresh_session(db, body.refresh_token)
    if not row or row.expires_at < datetime.utcnow():
        if row:
            db.delete(row)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )

    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Rotate: delete old refresh, issue new pair
    db.delete(row)
    db.commit()
    new_refresh = create_refresh_session(db, user.id)
    return RefreshOut(
        access_token=make_access_token(user.id),
        refresh_token=new_refresh,
    )


@router.post("/logout", response_model=MessageOut)
def logout(body: LogoutIn, db: Session = Depends(get_db)):
    """Forget this refresh token so it cannot be used again."""
    delete_refresh_session(db, body.refresh_token)
    return MessageOut(message="Logged out")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user_to_out(user)


@router.patch("/me", response_model=UserOut)
def update_me(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.name is not None:
        user.name = body.name.strip()
    if body.email is not None:
        user.email = body.email.lower().strip()
    if body.currency is not None:
        user.currency = body.currency
    db.commit()
    db.refresh(user)
    return user_to_out(user)


@router.post("/change-password", response_model=MessageOut)
def change_password(
    body: ChangePasswordIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not check_password(body.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is wrong")
    if len(body.new_password) < 4:
        raise HTTPException(status_code=400, detail="New password too short")
    user.password_hash = hash_password(body.new_password)
    db.commit()
    # Kick other devices
    delete_all_refresh_for_user(db, user.id)
    return MessageOut(message="Password updated. Please sign in again on other devices.")


@router.post("/forgot-password", response_model=MessageOut)
def forgot_password(body: ForgotPasswordIn, db: Session = Depends(get_db)):
    """Always same message — if email exists, send reset link."""
    user = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if user:
        raw = create_email_token(db, user.id, "reset")
        send_reset_email(user.email, raw)
    return MessageOut(
        message="If that email exists, a reset link was sent (check inbox or server console)."
    )


@router.post("/reset-password", response_model=MessageOut)
def reset_password(body: ResetPasswordIn, db: Session = Depends(get_db)):
    """Use token from email link + set new password."""
    row = use_email_token(db, body.token, "reset")
    user = db.get(User, row.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if len(body.new_password) < 4:
        raise HTTPException(status_code=400, detail="New password too short")
    user.password_hash = hash_password(body.new_password)
    user.failed_login_count = 0
    user.locked_until = None
    db.commit()
    delete_all_refresh_for_user(db, user.id)
    return MessageOut(message="Password updated. You can sign in now.")
