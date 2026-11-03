"""
Fintrack API — entry point.

Run from this folder:
  uvicorn main:app --reload

Then open docs:
  http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth, budgets, transactions

# Create tables if they don't exist yet (users, transactions, budgets)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fintrack API",
    description="Simple backend for Fintrack — salary → spend → left",
    version="0.1.0",
)

# Allow local Vite (any port) to call this API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budgets.router)


@app.get("/")
def home():
    """Health check — browser me open karke dekh sakte ho."""
    return {
        "app": "Fintrack API",
        "docs": "/docs",
        "ok": True,
    }
