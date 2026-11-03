# Fintrack API

FastAPI backend for the Fintrack React client.

```
React app  →  FastAPI  →  SQLite
```

---

## Layout

| File | Role |
|------|------|
| `main.py` | App entry, CORS, routers |
| `database.py` | SQLite engine + session helper |
| `models.py` | SQLAlchemy models |
| `schemas.py` | Pydantic request/response shapes |
| `auth_utils.py` | Password hashing, JWT, current user |
| `routers/` | Auth, transactions, budgets |

---

## Run

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Interactive docs are available at the server’s `/docs` path after start.  
Point the frontend `VITE_API_URL` at that API origin (see root `.env.example`).

---

## Main endpoints

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/signup` | No |
| `POST` | `/auth/login` | No |
| `GET` / `PATCH` | `/auth/me` | Yes |
| `GET` / `POST` | `/transactions` | Yes |
| `PUT` / `DELETE` | `/transactions/{id}` | Yes |
| `GET` / `PUT` | `/budgets` | Yes |
| `DELETE` | `/budgets/{category}` | Yes |

Protected routes expect: `Authorization: Bearer <token>`
