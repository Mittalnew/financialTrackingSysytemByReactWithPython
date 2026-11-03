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
    id: str  # string so frontend User.id stays string-friendly
    name: str
    email: str
    currency: str


class TokenOut(BaseModel):
    token: str
    user: UserOut


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    currency: str | None = None


# ---------- Transactions ----------


class TransactionIn(BaseModel):
    date: str
    title: str
    category: str
    type: str  # income | expense
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


# ---------- Budgets ----------


class BudgetIn(BaseModel):
    category: str
    limit: float = Field(gt=0)


class BudgetOut(BaseModel):
    category: str
    limit: float
