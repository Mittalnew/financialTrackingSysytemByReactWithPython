"""
Budgets — monthly category limits (like budgetsSlice).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_utils import get_current_user
from database import get_db
from models import Budget, User
from schemas import BudgetIn, BudgetOut

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetOut])
def list_budgets(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(Budget).filter(Budget.user_id == user.id).all()
    return [BudgetOut(category=r.category, limit=r.limit) for r in rows]


@router.put("", response_model=BudgetOut)
def upsert_budget(
    body: BudgetIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update limit for a category (upsert)."""
    row = (
        db.query(Budget)
        .filter(Budget.user_id == user.id, Budget.category == body.category)
        .first()
    )
    if row:
        row.limit = body.limit
    else:
        row = Budget(category=body.category, limit=body.limit, user_id=user.id)
        db.add(row)
    db.commit()
    db.refresh(row)
    return BudgetOut(category=row.category, limit=row.limit)


@router.delete("/{category}")
def delete_budget(
    category: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Budget)
        .filter(Budget.user_id == user.id, Budget.category == category)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(row)
    db.commit()
    return {"ok": True}
