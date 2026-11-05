"""
SQLAlchemy models = real database tables.

Frontend types.ts ke close cousins:
  User / Transaction / Budget
"""

from datetime import datetime, timezone

from sqlalchemy import String, Float, ForeignKey, UniqueConstraint, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    # Never store plain password — only the hash string
    password_hash: Mapped[str] = mapped_column(String(200))
    currency: Mapped[str] = mapped_column(String(40), default="INR (₹)")

    # Must click email link before login
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Wrong-password lockout
    failed_login_count: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Plan from onboarding. Existing users are marked onboarded by the startup ALTER.
    savings_goal: Mapped[float] = mapped_column(Float, default=0)
    onboarded: Mapped[bool] = mapped_column(Boolean, default=False)

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="owner")
    budgets: Mapped[list["Budget"]] = relationship(back_populates="owner")
    categories: Mapped[list["Category"]] = relationship(back_populates="owner")


class RefreshSession(Base):
    """
    Long-lived login session. We store only a hash of the refresh token.
    Logout / password change → delete the row → token stops working.
    """

    __tablename__ = "refresh_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)


class EmailToken(Base):
    """One-time link for verify-email or reset-password."""

    __tablename__ = "email_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    purpose: Mapped[str] = mapped_column(String(20))  # "verify" | "reset"
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[str] = mapped_column(String(20))  # "YYYY-MM-DD" like frontend
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80))
    type: Mapped[str] = mapped_column(String(20))  # "income" | "expense"
    amount: Mapped[float] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # "manual" from the form, "statement" from a CSV upload
    source: Mapped[str] = mapped_column(String(20), default="manual")
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="transactions")


class Category(Base):
    """Names the user can pick. Defaults are created the first time they open the list."""

    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uniq_user_category_name"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80))

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="categories")


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (UniqueConstraint("user_id", "category", name="uniq_user_category"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(80))
    limit: Mapped[float] = mapped_column(Float)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="budgets")
