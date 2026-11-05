"""
Transaction CRUD — same idea as transactionsSlice, but for one logged-in user.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_utils import get_current_user
from database import get_db
from models import Transaction, User
from schemas import ImportIn, TransactionIn, TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def stamp(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def to_out(row: Transaction) -> TransactionOut:
    return TransactionOut(
        id=str(row.id),
        date=row.date,
        title=row.title,
        category=row.category,
        type=row.type,
        amount=row.amount,
        notes=row.notes,
        source=row.source or "manual",
        created_at=stamp(row.created_at),
        updated_at=stamp(row.updated_at),
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
        source="manual",
        user_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_out(row)


@router.post("/import", response_model=list[TransactionOut])
def import_statement(
    body: ImportIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Replace this month's uploaded rows, then save the new statement lines."""
    if not body.rows:
        raise HTTPException(status_code=400, detail="No rows to import")

    months = {row.date[:7] for row in body.rows if len(row.date) >= 7}
    for month in months:
        (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user.id,
                Transaction.source == "statement",
                Transaction.date.like(f"{month}%"),
            )
            .delete(synchronize_session=False)
        )

    created: list[Transaction] = []
    for row in body.rows:
        if row.type not in ("income", "expense"):
            raise HTTPException(status_code=400, detail="type must be income or expense")
        item = Transaction(
            date=row.date,
            title=row.title.strip() or "Statement",
            category=row.category,
            type=row.type,
            amount=row.amount,
            source="statement",
            user_id=user.id,
        )
        db.add(item)
        created.append(item)
    db.commit()
    for item in created:
        db.refresh(item)
    return [to_out(item) for item in created]


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
    row.updated_at = now_utc()
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
