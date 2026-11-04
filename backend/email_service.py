"""
Send auth emails.

If RESEND_API_KEY is set → call Resend.
Else → print the link in the uvicorn console (easy for local learning).

Verify/reset links go to the API (API_PUBLIC_URL), not Vite —
so click works even if the frontend is down.
"""

import httpx

from config import API_PUBLIC_URL, EMAIL_FROM, RESEND_API_KEY


def send_email(to: str, subject: str, body: str) -> None:
    """Send one plain-text email, or print it if no Resend key."""
    if not RESEND_API_KEY:
        print("\n========== EMAIL (console mode) ==========")
        print(f"To: {to}")
        print(f"Subject: {subject}")
        print(body)
        print("==========================================\n")
        return

    res = httpx.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "text": body,
        },
        timeout=20,
    )
    if res.status_code >= 400:
        raise RuntimeError(f"Email failed: {res.status_code} {res.text}")


def send_verify_email(to: str, raw_token: str) -> None:
    # Hits FastAPI → verifies → simple HTML + link to login
    link = f"{API_PUBLIC_URL}/auth/verify-link?token={raw_token}"
    send_email(
        to,
        "Verify your Fintrack email",
        f"Hi!\n\nClick to verify your account:\n{link}\n\nThis link expires in 24 hours.\n",
    )


def send_reset_email(to: str, raw_token: str) -> None:
    # API redirects to the React reset page (keeps token in the URL)
    link = f"{API_PUBLIC_URL}/auth/reset-link?token={raw_token}"
    send_email(
        to,
        "Reset your Fintrack password",
        f"Hi!\n\nClick to set a new password:\n{link}\n\nIf you did not ask for this, ignore this email.\n",
    )
