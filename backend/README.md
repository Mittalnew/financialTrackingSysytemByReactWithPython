# Fintrack API

FastAPI backend for the Fintrack React client.

```
React app  →  FastAPI  →  PostgreSQL (Neon)  or  SQLite (local fallback)
```

---

## Layout

| File | Role |
|------|------|
| `main.py` | App entry, CORS, routers |
| `config.py` | Env settings (JWT, Resend, DB URL) |
| `database.py` | Engine + session (Postgres or SQLite) |
| `models.py` | SQLAlchemy models |
| `schemas.py` | Pydantic request/response shapes |
| `auth_utils.py` | Password hash, access/refresh/email tokens |
| `email_service.py` | Resend email or console print |
| `routers/` | Auth, transactions, budgets |

---

## Database

**Recommended:** PostgreSQL via [Neon](https://neon.tech) (free).

1. Create a Neon project  
2. Copy the connection string (URI)  
3. Put it in the project root `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

If `DATABASE_URL` is missing, the API uses local `fintrack.db` (SQLite) so you can still learn offline.

`GET /` returns `"db": "postgres"` or `"db": "sqlite"` so you can confirm which one is active.

---

## Run

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

Interactive docs: `/docs`  
Point the frontend `VITE_API_URL` at that API origin (see root `.env.example`).

Without `RESEND_API_KEY`, verify/reset links are printed in the uvicorn console.

**Email links:** verify/reset open **`API_PUBLIC_URL`** first (`/auth/verify-link`).  
`FRONTEND_URL` is only for the “Go to sign in” / reset form redirect.

**Docker:** see root `Dockerfile` / `docker-compose.yml` and `backend/Dockerfile`.  
**Render:** root `render.yaml` (API = Docker, web = static).

---

## Auth flow (simple)

1. `POST /auth/signup` → creates user + verify link (no auto-login)
2. `POST /auth/verify-email` → marks email verified
3. `POST /auth/login` → `access_token` + `refresh_token`
4. API calls use `Authorization: Bearer <access_token>`
5. When access expires → `POST /auth/refresh`
6. `POST /auth/logout` → delete refresh row
7. Forgot → email link → `POST /auth/reset-password`

---

## Main endpoints

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/signup` | No |
| `POST` | `/auth/verify-email` | No |
| `POST` | `/auth/login` | No |
| `POST` | `/auth/refresh` | No (needs refresh body) |
| `POST` | `/auth/logout` | No (needs refresh body) |
| `POST` | `/auth/forgot-password` | No |
| `POST` | `/auth/reset-password` | No |
| `GET` / `PATCH` | `/auth/me` | Yes |
| `POST` | `/auth/change-password` | Yes |
| `GET` / `POST` | `/transactions` | Yes |
| `PUT` / `DELETE` | `/transactions/{id}` | Yes |
| `GET` / `PUT` | `/budgets` | Yes |
| `DELETE` | `/budgets/{category}` | Yes |
