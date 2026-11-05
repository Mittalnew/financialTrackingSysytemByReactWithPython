"""
Pydantic schemas = JSON shapes going in/out of the API.

Think of these like TypeScript types for the backend.
"""

from pydantic import BaseModel, Field


# ---------- Auth ----------


class SignupIn(BaseModel):
    name: str = Field(min_length=1)
    email: str = Field(min_length=3)
    password: str = Field(min_length=4)


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    currency: str
    savings_goal: float = 0
    onboarded: bool = False


class TokenOut(BaseModel):
    """Returned after login (and after refresh we only need access — see RefreshOut)."""

    access_token: str
    refresh_token: str
    user: UserOut


class RefreshIn(BaseModel):
    refresh_token: str


class RefreshOut(BaseModel):
    access_token: str
    refresh_token: str


class LogoutIn(BaseModel):
    refresh_token: str


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    currency: str | None = None
    savings_goal: float | None = None
    onboarded: bool | None = None


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=4)


class ForgotPasswordIn(BaseModel):
    """Only email — we send a reset link (never set password here)."""

    email: str


class ResendVerifyIn(BaseModel):
    """Only email — send a new verify link if account exists and is unverified."""

    email: str


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=4)


class VerifyEmailIn(BaseModel):
    token: str


class MessageOut(BaseModel):
    message: str


# ---------- Transactions ----------


class TransactionIn(BaseModel):
    date: str
    title: str
    category: str
    type: str
    amount: float = Field(gt=0)
    notes: str | None = None


class TransactionOut(BaseModel):
    id: str
    date: str
    title: str
    category: str
    type: str
    amount: float
    notes: str | None = None
    source: str = "manual"
    created_at: str | None = None
    updated_at: str | None = None


class ImportRow(BaseModel):
    date: str
    title: str
    category: str
    type: str
    amount: float = Field(gt=0)


class ImportIn(BaseModel):
    rows: list[ImportRow]


# ---------- Budgets ----------


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)


class CategoryOut(BaseModel):
    name: str


class BudgetIn(BaseModel):
    category: str
    limit: float = Field(gt=0)


class BudgetOut(BaseModel):
    category: str
    limit: float
