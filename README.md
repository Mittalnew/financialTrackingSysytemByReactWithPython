# Fintrack

Personal finance tracker built around a simple idea: **salary → spend → leftover**.

Track income and expenses, set category budgets, and see what’s left for the month — with a clear dashboard and basic analytics.

---

## Tech stack

| Layer | Tech |
|--------|------|
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| State | Redux Toolkit |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Backend | FastAPI |
| Database | SQLite |
| Auth | JWT |

---

## Features

- **Dashboard** — monthly leftover (income − expense), insight tip, cashflow chart, budgets, recent activity  
- **Transactions** — add / edit / delete with search and filters  
- **Analytics** — KPIs and charts over selectable time ranges  
- **Settings** — profile and category budget limits  
- **Auth** — signup / login with JWT-protected APIs  

---

## Architecture (high level)

```
React UI  →  Redux (async thunks)  →  FastAPI  →  SQLite
```

- Shared transaction list powers Dashboard, Transactions, and Analytics  
- Calculations live in `utils/`; pages stay thin  
- Reusable UI in `components/ui/`  

More backend detail: [`backend/README.md`](backend/README.md)

---

## Getting started

1. Start the FastAPI server from `backend/` (see backend README).  
2. Copy `.env.example` → `.env` and set the API base URL for Vite.  
3. From the project root: `npm install` then `npm run dev`.  
4. Sign up a new account in the UI and add your first salary / spend entries.

```bash
npm run build
```

---

## Project layout

```
src/          Frontend (pages, store, components, utils, api client)
backend/      FastAPI app (auth, transactions, budgets)
```

---

## Roadmap

- Deploy frontend + API  
- Optional: Postgres or MongoDB instead of SQLite  

---

Personal project / portfolio demo.
