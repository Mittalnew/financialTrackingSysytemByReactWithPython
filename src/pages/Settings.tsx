import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { BUDGET_CATEGORIES } from '../constants'
import { useToast } from '../context/ToastContext'
import { useAppDispatch, useAppSelector } from '../store'
import { logout, saveProfile } from '../store/authSlice'
import { clearBudgets, removeBudget, setBudget } from '../store/budgetsSlice'
import { clearTransactions } from '../store/transactionsSlice'
import { initials, formatINR } from '../utils/format'

export default function Settings() {
  const user = useAppSelector((s) => s.auth.user)!
  const budgets = useAppSelector((s) => s.budgets.items)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currency, setCurrency] = useState(user.currency)

  const [category, setCategory] = useState<string>(BUDGET_CATEGORIES[0])
  const [limit, setLimit] = useState('5000')

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      await dispatch(saveProfile({ name, email, currency })).unwrap()
      showToast('Profile saved')
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Save failed', 'error')
    }
  }

  function handleLogout() {
    dispatch(clearTransactions())
    dispatch(clearBudgets())
    dispatch(logout())
    navigate('/login')
  }

  async function handleSaveBudget(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(limit)
    if (!amount || amount < 1) {
      showToast('Enter a valid limit', 'info')
      return
    }
    try {
      await dispatch(setBudget({ category, limit: amount })).unwrap()
      showToast(`${category} budget saved`)
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Save failed', 'error')
    }
  }

  async function handleRemoveBudget(cat: string) {
    try {
      await dispatch(removeBudget(cat)).unwrap()
      showToast(`${cat} budget removed`)
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Remove failed', 'error')
    }
  }

  return (
    <div className="animate-rise space-y-5">
      <Header title="Settings" subtitle="Profile + monthly category budgets." />

      <Card className="max-w-xl">
        <h3 className="mb-5 text-xs font-semibold uppercase tracking-wide text-[#5c6b64]">Profile</h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#0b7a6e] text-lg font-semibold text-white">
            {initials(name || user.name)}
          </div>

          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[{ value: 'INR (₹)', label: 'INR (₹)' }]}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit">Save profile</Button>
            <Button type="button" variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </form>
      </Card>

      <Card className="max-w-xl">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5c6b64]">
          Monthly budgets
        </h3>
        <p className="mb-4 text-sm text-[#5c6b64]">
          Set a limit per category. Dashboard shows spent vs limit.
        </p>

        <form onSubmit={handleSaveBudget} className="mb-5 flex flex-wrap items-end gap-3">
          <div className="min-w-36 flex-1">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={BUDGET_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="min-w-32 flex-1">
            <Input
              label="Limit (₹)"
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Save budget</Button>
        </form>

        {budgets.length === 0 ? (
          <p className="text-sm text-[#5c6b64]">No budgets yet.</p>
        ) : (
          <ul className="divide-y divide-[#e7efe9]">
            {budgets.map((b) => (
              <li key={b.category} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium text-[#14201c]">
                  {b.category}{' '}
                  <span className="font-normal text-[#5c6b64]">· {formatINR(b.limit)} / month</span>
                </span>
                <button
                  type="button"
                  className="text-[#d97757] hover:opacity-80"
                  onClick={() => handleRemoveBudget(b.category)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
