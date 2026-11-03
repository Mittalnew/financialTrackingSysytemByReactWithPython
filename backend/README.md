# Fintrack Backend (easy)

React app `src/api.ts` se yahan call karti hai.

```
Browser (React :5173)  →  FastAPI (:8001)  →  SQLite (fintrack.db)
```

---

## Folder map

| File | Kaam |
|------|------|
| `main.py` | App start + CORS + routers |
| `database.py` | SQLite + `get_db` |
| `models.py` | Tables: User, Transaction, Budget |
| `schemas.py` | JSON shapes (≈ frontend `types.ts`) |
| `auth_utils.py` | Password hash + JWT + current user |
| `routers/auth.py` | signup / login / me |
| `routers/transactions.py` | list / add / edit / delete |
| `routers/budgets.py` | list / upsert / delete |

---

## Kaise chalaye (Windows)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

- Health: http://127.0.0.1:8001/
- Docs: http://127.0.0.1:8001/docs

Frontend `.env`: `VITE_API_URL=http://127.0.0.1:8001`

---

## Main routes

| Method | Path | Auth? |
|--------|------|-------|
| POST | `/auth/signup` | no |
| POST | `/auth/login` | no |
| GET/PATCH | `/auth/me` | yes |
| GET/POST | `/transactions` | yes |
| PUT/DELETE | `/transactions/{id}` | yes |
| GET/PUT | `/budgets` | yes |
| DELETE | `/budgets/{category}` | yes |

Header: `Authorization: Bearer <token>`

---

## Frontend flow

```
UI → Redux thunk → api.ts → FastAPI → SQLite → JSON → Redux → pages
```
