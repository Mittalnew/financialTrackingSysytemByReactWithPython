import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { useAppDispatch, useAppSelector } from '../store'
import { saveProfile } from '../store/authSlice'
import { setBudget } from '../store/budgetsSlice'
import { addTransaction, updateTransaction } from '../store/transactionsSlice'
import { currentMonth } from '../utils/format'

const LIMITS = ['Rent', 'Food', 'Travel', 'Shopping'] as const

export default function Onboarding() {
  const user = useAppSelector((s) => s.auth.user)
  const items = useAppSelector((s) => s.transactions.items)
  const budgets = useAppSelector((s) => s.budgets.items)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const month = currentMonth()
  const salaryRow = items.find(
    (tx) => tx.type === 'income' && tx.category === 'Salary' && tx.date.startsWith(month),
  )

  const [salary, setSalary] = useState(salaryRow ? String(salaryRow.amount) : '')
  const [saveGoal, setSaveGoal] = useState(user?.savings_goal ? String(user.savings_goal) : '')
  const [limits, setLimits] = useState<Record<string, string>>(() => {
    const next: Record<string, string> = {}
    for (const name of LIMITS) {
      const row = budgets.find((budget) => budget.category === name)
      next[name] = row ? String(row.limit) : ''
    }
    return next
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const salaryAmount = Number(salary)
    const goal = Number(saveGoal)
    if (!salaryAmount || salaryAmount < 1) {
      showToast('Enter your monthly salary', 'info')
      return
    }
    setSaving(true)
    try {
      await dispatch(saveProfile({ savings_goal: goal || 0, onboarded: true })).unwrap()
      for (const name of LIMITS) {
        const amount = Number(limits[name])
        if (amount > 0) await dispatch(setBudget({ category: name, limit: amount })).unwrap()
      }
      if (salaryRow) {
        await dispatch(updateTransaction({ ...salaryRow, amount: salaryAmount, title: 'Salary' })).unwrap()
      } else {
        await dispatch(
          addTransaction({
            date: `${month}-01`,
            title: 'Salary',
            category: 'Salary',
            type: 'income',
            amount: salaryAmount,
          }),
        ).unwrap()
      }
      showToast('Plan saved')
      navigate('/')
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Could not save the plan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-rise mx-auto max-w-lg space-y-5">
      <div>
        <p className="inline-flex rounded-full bg-[#e7efe9] px-3 py-1 text-xs font-medium text-[#0b7a6e]">
          Your plan
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#14201c]">Start with a few numbers</h1>
        <p className="mt-1 text-sm text-[#5c6b64]">
          Salary, what you want to save, and a limit for the usual spends. You can upload a bank statement later.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Monthly salary (₹)"
            type="number"
            min="1"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
          <Input
            label="How much do you want to save? (₹)"
            type="number"
            min="0"
            value={saveGoal}
            onChange={(e) => setSaveGoal(e.target.value)}
          />
          {LIMITS.map((name) => (
            <Input
              key={name}
              label={`${name} limit (₹)`}
              type="number"
              min="0"
              value={limits[name]}
              onChange={(e) => setLimits((prev) => ({ ...prev, [name]: e.target.value }))}
            />
          ))}
          <Button type="submit" loading={saving}>
            Save plan
          </Button>
        </form>
      </Card>
    </div>
  )
}
