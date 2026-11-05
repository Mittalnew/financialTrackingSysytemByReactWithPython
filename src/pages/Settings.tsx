import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineFlag, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi2'
import { apiChangePassword } from '../api'
import Button from '../components/ui/Button'
import Spinner, { PageLoader, useDataReady } from '../components/ui/Spinner'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import CategoryField from '../components/CategoryField'
import { useToast } from '../context/ToastContext'
import { useAppDispatch, useAppSelector } from '../store'
import { logoutUser, saveProfile } from '../store/authSlice'
import { clearBudgets, removeBudget, setBudget } from '../store/budgetsSlice'
import { clearCategories } from '../store/categoriesSlice'
import { clearTransactions } from '../store/transactionsSlice'
import { budgetProgress } from '../utils/budgets'
import { currentMonth, formatINR, initials } from '../utils/format'

export default function Settings() {
  const ready = useDataReady()
  const user = useAppSelector((s) => s.auth.user)!
  const budgets = useAppSelector((s) => s.budgets.items)
  const items = useAppSelector((s) => s.transactions.items)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currency, setCurrency] = useState(user.currency)

  const [category, setCategory] = useState('Food')
  const [limit, setLimit] = useState('5000')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingBudget, setSavingBudget] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const month = currentMonth()
  const rows = budgetProgress(budgets, items, month)
  const planned = budgets.reduce((sum, b) => sum + b.limit, 0)

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await dispatch(saveProfile({ name, email, currency })).unwrap()
      showToast('Profile saved')
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Save failed', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    dispatch(clearTransactions())
    dispatch(clearBudgets())
    dispatch(clearCategories())
    await dispatch(logoutUser())
    navigate('/')
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    if (newPassword.length < 4) {
      showToast('New password must be at least 4 characters', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await apiChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      showToast('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Password update failed', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleSaveBudget(e: FormEvent) {
    e.preventDefault()
    const amount = Number(limit)
    if (!amount || amount < 1) {
      showToast('Enter a valid limit', 'info')
      return
    }
    setSavingBudget(true)
    try {
      await dispatch(setBudget({ category, limit: amount })).unwrap()
      showToast(`${category} budget saved`)
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Save failed', 'error')
    } finally {
      setSavingBudget(false)
    }
  }

  async function handleRemoveBudget(cat: string) {
    setRemoving(cat)
    try {
      await dispatch(removeBudget(cat)).unwrap()
      showToast(`${cat} budget removed`)
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Remove failed', 'error')
    } finally {
      setRemoving(null)
    }
  }

  if (!ready) return <PageLoader />

  return (
    <div className="animate-rise space-y-5">
      <div>
        <p className="inline-flex rounded-full bg-[#e7efe9] px-3 py-1 text-xs font-medium text-[#0b7a6e]">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#14201c]">Settings</h1>
        <Link to="/onboarding" className="mt-1 inline-block text-sm font-medium text-[#0b7a6e] hover:text-[#086057]">
          Edit plan
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#0c6b62] to-[#1aa392] p-6 text-white shadow-panel lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-white/75">Your profile</p>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
              <HiOutlineUser size={18} />
            </span>
          </div>
          <div className="mt-8">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-xl font-semibold">
              {initials(name || user.name)}
            </div>
            <p className="mt-4 text-2xl font-semibold">{name || user.name}</p>
            <p className="mt-1 text-sm text-white/80">{email || user.email}</p>
          </div>
          <div className="mt-8 rounded-2xl bg-black/10 px-4 py-3 text-sm">
            <p className="text-xs text-white/70">Currency</p>
            <p className="mt-1">{currency}</p>
          </div>
        </section>

        <Card className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-semibold text-[#14201c]">Edit profile</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[{ value: 'INR (₹)', label: 'INR (₹)' }]}
            />
            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" loading={savingProfile}>
                Save profile
              </Button>
              <Button type="button" variant="secondary" loading={loggingOut} onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#14201c]">Password</h3>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7efe9] text-[#0b7a6e]">
              <HiOutlineLockClosed size={18} />
            </span>
          </div>
          <p className="mb-4 text-sm text-[#5c6b64]">
            Other devices will be signed out after this change.
          </p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={4}
            />
            <Button type="submit" loading={savingPassword}>
              Update password
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#14201c]">Monthly budgets</h3>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7efe9] text-[#0b7a6e]">
              <HiOutlineFlag size={18} />
            </span>
          </div>
          <p className="mb-4 text-sm text-[#5c6b64]">
            {planned > 0
              ? `Planned this month ${formatINR(planned)}.`
              : 'Set a limit per category. Dashboard uses these numbers.'}
          </p>

          <form
            onSubmit={handleSaveBudget}
            className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl bg-[#f4f8f5] p-3"
          >
            <div className="min-w-36 flex-1">
              <CategoryField
                label="Category"
                value={category}
                onChange={setCategory}
                includeSalary={false}
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
            <Button type="submit" loading={savingBudget}>
              Save
            </Button>
          </form>

          {rows.length === 0 ? (
            <p className="text-sm text-[#5c6b64]">No budgets yet.</p>
          ) : (
            <ul className="space-y-4">
              {rows.map((row) => (
                <li key={row.category}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-[#14201c]">{row.category}</span>
                    <span className={row.over ? 'text-[#d97757]' : 'text-[#5c6b64]'}>
                      {formatINR(row.spent)} / {formatINR(row.limit)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#e7efe9]">
                    <div
                      className={`h-full rounded-full ${row.over ? 'bg-[#d97757]' : 'bg-[#0b7a6e]'}`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-[#d97757] hover:opacity-80 disabled:opacity-50"
                    disabled={removing === row.category}
                    onClick={() => handleRemoveBudget(row.category)}
                  >
                    {removing === row.category && <Spinner size={12} />}
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
