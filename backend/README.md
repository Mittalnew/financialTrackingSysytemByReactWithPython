# Fintrack API

FastAPI backend for the Fintrack React app (`src/api.ts`).

```
Browser (Vite :5173) → FastAPI (:8001) → SQLite (fintrack.db)
```

---

## Layout

| File | Role |
|------|------|
| `main.py` | App entry, CORS, routers |
| `database.py` | SQLite engine + `get_db` |
| `models.py` | SQLAlchemy models (`User`, `Transaction`, `Budget`) |
| `schemas.py` | Pydantic request/response shapes |
| `auth_utils.py` | Password hashing, JWT, `get_current_user` |
| `routers/auth.py` | Signup, login, profile |
| `routers/transactions.py` | Transaction CRUD |
| `routers/budgets.py` | Budget list / upsert / delete |

---

## Run (Windows)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

- Health: http://127.0.0.1:8001/
- OpenAPI docs: http://127.0.0.1:8001/docs

Frontend `.env`:

```
VITE_API_URL=http://127.0.0.1:8001
```

---

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/signup` | No |
| `POST` | `/auth/login` | No |
| `GET` / `PATCH` | `/auth/me` | Bearer JWT |
| `GET` / `POST` | `/transactions` | Bearer JWT |
| `PUT` / `DELETE` | `/transactions/{id}` | Bearer JWT |
| `GET` / `PUT` | `/budgets` | Bearer JWT |
| `DELETE` | `/budgets/{category}` | Bearer JWT |

Header format: `Authorization: Bearer <token>`

---

## Data flow

```
UI → Redux thunk → api.ts → FastAPI → SQLite → JSON → Redux → pages
```
