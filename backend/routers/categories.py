"""Category names for the dropdowns. Each user has their own list."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_utils import get_current_user
from database import get_db
from models import Category, User
from schemas import CategoryIn, CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])

DEFAULTS = ["Food", "Rent", "Salary", "Travel", "Shopping"]


def ensure_default_categories(db: Session, user_id: int) -> None:
    existing = db.query(Category).filter(Category.user_id == user_id).count()
    if existing:
        return
    for name in DEFAULTS:
        db.add(Category(name=name, user_id=user_id))
    db.commit()


@router.get("", response_model=list[CategoryOut])
def list_categories(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_default_categories(db, user.id)
    rows = (
        db.query(Category)
        .filter(Category.user_id == user.id)
        .order_by(Category.id)
        .all()
    )
    return [CategoryOut(name=row.name) for row in rows]


@router.post("", response_model=CategoryOut)
def add_category(
    body: CategoryIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = " ".join(body.name.split())
    if not name:
        raise HTTPException(status_code=400, detail="Enter a category name")

    rows = db.query(Category).filter(Category.user_id == user.id).all()
    for row in rows:
        if row.name.lower() == name.lower():
            return CategoryOut(name=row.name)

    row = Category(name=name, user_id=user.id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return CategoryOut(name=row.name)
