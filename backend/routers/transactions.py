"""
Transaction CRUD — same idea as transactionsSlice, but for one logged-in user.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_utils import get_current_user
from database import get_db
from models import Transaction, User
from schemas import TransactionIn, TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


def to_out(row: Transaction) -> TransactionOut:
    return TransactionOut(
        id=str(row.id),
        date=row.date,
        title=row.title,
        category=row.category,
        type=row.type,
        amount=row.amount,
        notes=row.notes,
    )


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """All transactions for the logged-in user (newest first)."""
    rows = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .all()
    )
    return [to_out(r) for r in rows]


@router.post("", response_model=TransactionOut)
def create_transaction(
    body: TransactionIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add one transaction (like dispatch(addTransaction))."""
    if body.type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="type must be income or expense")

    row = Transaction(
        date=body.date,
        title=body.title.strip(),
        category=body.category,
        type=body.type,
        amount=body.amount,
        notes=body.notes,
        user_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_out(row)


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: int,
    body: TransactionIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Edit one of *your* transactions."""
    row = db.get(Transaction, tx_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if body.type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="type must be income or expense")

    row.date = body.date
    row.title = body.title.strip()
    row.category = body.category
    row.type = body.type
    row.amount = body.amount
    row.notes = body.notes
    db.commit()
    db.refresh(row)
    return to_out(row)


@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete one of *your* transactions."""
    row = db.get(Transaction, tx_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(row)
    db.commit()
    return {"ok": True}
