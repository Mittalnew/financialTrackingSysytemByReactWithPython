"""
SQLAlchemy models = real database tables.

Frontend types.ts ke close cousins:
  User / Transaction / Budget
"""

from sqlalchemy import String, Float, ForeignKey, UniqueConstraint
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

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="owner")
    budgets: Mapped[list["Budget"]] = relationship(back_populates="owner")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[str] = mapped_column(String(20))  # "YYYY-MM-DD" like frontend
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80))
    type: Mapped[str] = mapped_column(String(20))  # "income" | "expense"
    amount: Mapped[float] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Which user owns this row
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"
    # One limit per category per user
    __table_args__ = (UniqueConstraint("user_id", "category", name="uniq_user_category"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(80))
    limit: Mapped[float] = mapped_column(Float)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="budgets")
