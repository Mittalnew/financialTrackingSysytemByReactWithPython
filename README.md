# Fintrack

**Hook:** Salary → Spend → Left — salaried user ko clearly dikhao *is mahine kitna bacha*.

Personal finance tracker: income, expenses, filters, analytics. Dashboard pe leftover + ek chhota tip.

**Connected mode:** React → FastAPI (`backend/`) → SQLite. Token + user localStorage me; transactions/budgets server pe.

Local chalane ke liye **dono** servers:
1. Backend: `cd backend` → `.\.venv\Scripts\activate` → `uvicorn main:app --reload --port 8001`
2. Frontend: `npm run dev` (API URL `.env`: `VITE_API_URL=http://127.0.0.1:8001`)

Details: [`backend/README.md`](backend/README.md).

---

## Tech stack

| Cheez | Use |
|--------|-----|
| React + TypeScript | UI |
| Vite | Dev server / build |
| React Router | Pages / protected routes |
| Redux Toolkit | Global state (auth + transactions) |
| Recharts | Graphs |
| Tailwind CSS | Styling |
| FastAPI + SQLite | Backend API (`backend/`) |
| localStorage | Sirf JWT token + user (session) |

---

## Kaise chalaye

```bash
# terminal 1 — API
cd backend
.\.venv\Scripts\activate
uvicorn main:app --reload --port 8001

# terminal 2 — UI
npm install
npm run dev
```

Browser: `http://localhost:5173`

Demo login (agar pehle signup kiya ho):
- Email: `demo@fintrack.in`
- Password: `demo123` (real check — FastAPI)

Build: `npm run build`

---

## Folder structure (simple)

```
src/
  api.ts                  → saari backend fetch calls + token helpers
  App.tsx                 → routes + layout
  main.tsx                → Redux Provider
  types.ts                → Transaction, User, Filters, Budget
  constants.ts            → CATEGORIES, analytics ranges

  utils/                  → format, stats, filters, insights, budgets
  context/ToastContext.tsx
  store/                  → auth + transactions + budgets (API thunks)

  pages/                  → Login, Signup, Dashboard, Transactions, Analytics, Settings
  components/
    LoadUserData.tsx      → login ke baad list load
    layout/               → Sidebar, Header
    charts.tsx
    TransactionForm.tsx
    BudgetList.tsx
    ui/                   → Button, Input, Select, Modal, Card,
                            Badge, KpiCard, EmptyState, Alert, Toast

backend/                  → FastAPI + SQLite (see backend/README.md)
```

**Rule of thumb:**
- naya **type** → `types.ts`
- naya **constant** → `constants.ts`
- naya **helper** → `utils/`
- naya **shared UI** → `components/ui/`
- page sirf screen dikhaye — heavy calculation page mein mat rakho

---

## App ka overall flow

```
main.tsx
  └─ Redux <Provider store={store}>
       └─ App.tsx (Router)
            ├─ /login, /signup          → public
            └─ ProtectedRoute
                 └─ AppLayout (Sidebar + main)
                      ├─ /              → Dashboard
                      ├─ /transactions  → Transactions
                      ├─ /analytics     → Analytics
                      └─ /settings      → Settings
```

1. App start hoti hai → `main.tsx` Redux store wrap karta hai.
2. `App.tsx` routes decide karta hai.
3. Agar user login nahi → `/login` pe bhej do (`ProtectedRoute`).
4. Login ke baad Sidebar + page dikhta hai.
5. Login ke baad `LoadUserData` API se transactions + budgets laata hai → Redux.
6. Add/edit/delete → `dispatch(thunk)` → `api.ts` → FastAPI → Redux update → Dashboard/Analytics bhi same `items` se refresh.

---

## Data kaise share hota hai?

### 1) Redux + API — main tarika

```
UI → dispatch(thunk) → api.ts → FastAPI → SQLite
                         ↓
                   Redux items/user
                         ↓
         Dashboard / Transactions / Analytics
```

- Padhna: `useAppSelector((s) => s.transactions.items)`
- Likhna: `dispatch(addTransaction(...))` (async thunk)

**Persist:**
- Token + user → `localStorage` (session)
- Transactions / budgets → **SQLite** (server)

### 2) Props (parent → child) — UI pieces ke liye

Reusable components ko parent **props** se data/actions deta hai.

Example — `TransactionForm`:

```ts
<TransactionForm
  initial={editing}     // edit mode mein purani values
  onCancel={closeModal} // Cancel dabaya
  onSave={handleSave}   // Save dabaya → parent dispatch karega
/>
```

Example — `KpiCard`:

```ts
<KpiCard label="Income" value={formatINR(stats.income)} />
```

Example — `Modal`:

```ts
<Modal open={modalOpen} title="Add transaction" onClose={closeModal}>
  ...form...
</Modal>
```

**Simple samajh:**
- **Redux** = app-wide data (transactions, user)
- **Props** = ek screen ke andar child UI ko values / callbacks dena

Parent se child data jaata hai props se.  
Child se parent ko action chahiye ho to **callback prop** dete hain (`onSave`, `onClose`) — child sirf call karta hai, Redux usually parent handle karta hai.

---

## Props kaise kaam karte hain (easy example)

`Button` component:

```ts
<Button onClick={openAdd}>Add transaction</Button>
```

- `children` → andar ka text ("Add transaction")
- `onClick` → click pe kya chalega
- optional `variant` → primary / secondary look

`EmptyState`:

```ts
<EmptyState title="No transactions" hint="Try another filter or add one." />
```

Sirf dikhane ke liye props — koi Redux nahi.

`Select`:

```ts
<Select
  value={filters.month}
  onChange={(e) => dispatch(setFilters({ month: e.target.value }))}
  options={monthOptions}
/>
```

- `value` / `options` → UI state
- `onChange` → change hote hi Redux filter update

---

## Page-by-page flow

### Login / Signup
1. Form submit → `dispatch(login({ email, name? }))`
2. User object Redux + localStorage mein save
3. Navigate `/`
4. Password **check nahi** hota (demo auth) — Login pe `Alert` se ye clear hai

### Dashboard (`/`)
1. Redux se saari `items` lo
2. `monthCashflow` → **Salary / Spent / Left** (income − expense)
3. `monthTip` → ek short insight line (top category ya vs last month)
4. Charts: `monthlyTotals` + `expenseByCategory`
5. Recent 5 transactions

**Flow:** Page → `insights` / `stats` / `format` → UI

**Interview line:** “App ka sawal simple hai — salary aayi, kitna kharch hua, kitna bacha.”

Budgets card: `budgetProgress` → spent vs limit bars. Limits Settings se set.

### Budgets (Phase 2)
1. `Budget` = `{ category, limit }`
2. Settings → save/remove limit (`budgetsSlice`)
3. Dashboard → progress bars (`BudgetList` + `utils/budgets.ts`)
4. Over limit → coral bar + “over” label

**Interview line:** “Leftover batata hai kitna bacha; budget batata hai category plan vs actual.”

### Transactions (`/transactions`)
1. Redux se `items` + `filters`
2. `applyFilters(items, filters)` → table rows
3. Filter change → `dispatch(setFilters(...))`
4. Add / Edit → Modal + `TransactionForm`
5. Save:
   - editing hai → `updateTransaction`
   - nahi → `addTransaction`
6. Delete → `deleteTransaction(id)`

Yahan **props + Redux dono** milte hain: form props se, list Redux se.

### Analytics (`/analytics`)
1. Range select (1M / 3M / 6M / 1Y) — local `useState`
2. `inLastMonths(items, months)` se list kaato
3. KPIs + charts usi list pe
4. Ranges `constants.ts` se aati hain (`ANALYTICS_RANGES`)

### Settings
1. Profile fields local state mein
2. Save → `updateProfile`
3. Logout → `logout` + `/login`

---

## Utils ka role (calculation alag)

Pages mein heavy math nahi rakha.

| File | Kaam |
|------|------|
| `utils/format.ts` | `formatINR`, dates, `todayISO`, `initials` |
| `utils/stats.ts` | `summary`, `monthlyTotals`, `expenseByCategory`, ... |
| `utils/filters.ts` | `applyFilters`, `monthFilterOptions` |

Interview mein bolo:

> “UI pages thin hain. Calculation `utils` mein hai. State Redux mein hai. Shared look `components/ui` mein hai.”

---

## Store (Redux) short map

### `authSlice`
- `login` → user set + localStorage
- `logout` → user null
- `updateProfile` → name/email/currency update

### `transactionsSlice`
- `addTransaction` / `updateTransaction` / `deleteTransaction`
- `setFilters`
- har change pe list localStorage mein save

Typed hooks (`store/index.ts`):
- `useAppDispatch()`
- `useAppSelector()`

---

## UI components (reusable)

| Component | Kaam |
|-----------|------|
| `Button` | Primary / secondary button |
| `Input` / `Select` | Form fields |
| `Modal` | Overlay dialog |
| `Card` | White content box |
| `Badge` | Category / type pill |
| `KpiCard` | Dashboard / analytics number card |
| `EmptyState` | Empty table/chart message |
| `Alert` | Info / error inline message |
| `Toast` | Bottom floating success / error / info |
| `Header` | Page title + optional action |
| `Sidebar` | Navigation + user chip |
| `charts.tsx` | Sirf chart draw — data page se aata hai |

---

## Important notes (honest)

1. **Data server pe hai** — transactions/budgets SQLite; token+user localStorage.
2. **Auth real hai** — signup/login password check (FastAPI + bcrypt + JWT).
3. **Currency** UI pe; amounts INR format.
4. Naya account pe list empty — pehle salary/spend add karo.

---

## Interview mein 30-second explanation

> Fintrack React + Redux finance SPA hai — hook salary → spend → leftover. Pages shared Redux `items` se chalte hain. Data FastAPI + SQLite pe hai; JWT login ke baad `api.ts` se CRUD. Utils me stats/insights; UI `components/ui` me reusable.

---

## Next steps

1. Git commit / GitHub
2. Free host (Vercel FE + Render API)
3. Optional: Postgres/Mongo later

---

Made as a personal project / portfolio demo.
