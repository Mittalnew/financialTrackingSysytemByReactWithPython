# Fintrack

Personal finance tracker built around a simple idea: **salary → spend → leftover**.

Track income and expenses, set category budgets, and see what you still have left this month — plus basic analytics.

**Stack:** React (Vite + TypeScript + Redux Toolkit) ↔ FastAPI ↔ SQLite  
Session: JWT token + user in `localStorage`. Transactions and budgets live on the server.

Backend details: [`backend/README.md`](backend/README.md)

---

## Tech stack

| Layer | Tech |
|--------|------|
| UI | React 19, TypeScript, Vite |
| Routing | React Router |
| State | Redux Toolkit (async thunks → API) |
| Charts | Recharts |
| Styling | Tailwind CSS |
| API | FastAPI |
| Database | SQLite |
| Auth | JWT + bcrypt |

---

## Run locally

You need **two** terminals.

```bash
# Terminal 1 — API
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

```bash
# Terminal 2 — UI
cp .env.example .env
npm install
npm run dev
```

- App: http://localhost:5173  
- API docs: http://127.0.0.1:8001/docs  
- `.env` should set `VITE_API_URL=http://127.0.0.1:8001`

Create an account via **Sign up**, or use an existing user if you already registered (e.g. `demo@fintrack.in` / `demo123`).

```bash
npm run build
```

---

## Project structure

```
src/
  api.ts                 # HTTP client + token helpers
  App.tsx                # Routes + shell layout
  types.ts               # Shared TypeScript types
  constants.ts           # Categories, analytics ranges
  utils/                 # format, stats, filters, insights, budgets
  context/               # Toast provider
  store/                 # auth, transactions, budgets slices
  pages/                 # Login, Signup, Dashboard, Transactions, Analytics, Settings
  components/
    LoadUserData.tsx     # Fetches lists after login
    layout/              # Sidebar, Header
    charts.tsx           # Recharts wrappers
    TransactionForm.tsx
    BudgetList.tsx
    ui/                  # Button, Input, Select, Modal, Card, Toast, ...

backend/                 # FastAPI app (see backend/README.md)
```

**Conventions**
- Shared types → `types.ts`
- Constants → `constants.ts`
- Pure helpers → `utils/`
- Reusable UI → `components/ui/`
- Pages stay thin; calculations stay in `utils/`

---

## How the app works

```
main.tsx
  └─ Redux Provider
       └─ App (Router)
            ├─ /login, /signup
            └─ Protected routes
                 └─ Layout (Sidebar + main)
                      ├─ /               Dashboard
                      ├─ /transactions   Transactions
                      ├─ /analytics      Analytics
                      └─ /settings       Settings
```

1. Unauthenticated users are redirected to `/login`.
2. After login/signup, JWT + user are stored locally.
3. `LoadUserData` loads transactions and budgets from the API into Redux.
4. Mutations (`add` / `update` / `delete`) go through thunks → `api.ts` → FastAPI → Redux.
5. Dashboard, Transactions, and Analytics all read the same `transactions.items` list.

```
UI → dispatch(thunk) → api.ts → FastAPI → SQLite
                              ↓
                        Redux store
                              ↓
              Dashboard / Transactions / Analytics
```

---

## Features by page

| Page | What it does |
|------|----------------|
| **Dashboard** | Month leftover (income − expense), tip line, cashflow chart, budgets, recent activity |
| **Transactions** | Search/filter, add/edit/delete via modal |
| **Analytics** | Range KPIs + charts (1M / 3M / 6M / 1Y) |
| **Settings** | Profile update, category budget limits, logout |

---

## Redux (short map)

- **`authSlice`** — signup/login/logout/profile (JWT session)
- **`transactionsSlice`** — fetch/CRUD + UI filters
- **`budgetsSlice`** — fetch/upsert/remove category limits

Hooks: `useAppDispatch`, `useAppSelector` from `store/index.ts`.

---

## Notes

- New accounts start with an empty transaction list — add salary/spend yourself.
- Amounts are displayed in INR formatting.
- Do not commit `.env`, `backend/.venv/`, or `fintrack.db` (ignored).

---

## Roadmap

- Deploy frontend (e.g. Vercel) + API (e.g. Render)
- Optional: move from SQLite to Postgres or MongoDB

---

Personal project / portfolio demo.
