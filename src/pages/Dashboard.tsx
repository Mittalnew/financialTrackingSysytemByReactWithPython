import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineBanknotes, HiOutlineFlag, HiOutlineReceiptPercent } from 'react-icons/hi2'
import BudgetList from '../components/BudgetList'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { CategoryDonut, TrendChart } from '../components/charts'
import { PageLoader, useDataReady } from '../components/ui/Spinner'
import { useAppSelector } from '../store'
import { budgetProgress } from '../utils/budgets'
import { currentMonth, formatDate, formatINR, monthLabel } from '../utils/format'
import { monthTip, paceWarnings, safeToSpend } from '../utils/insights'
import { expenseByCategory, monthlyTotals } from '../utils/stats'

const DOTS = ['#0b7a6e', '#3d9b8f', '#5b8def', '#e0a15a', '#d97757']

export default function Dashboard() {
  const ready = useDataReady()
  const items = useAppSelector((s) => s.transactions.items)
  const budgets = useAppSelector((s) => s.budgets.items)

  const month = currentMonth()
  const thisMonth = items.filter((tx) => tx.date.startsWith(month))
  const safe = safeToSpend(items, budgets, month)
  const tip = monthTip(items, month)
  const budgetRows = budgetProgress(budgets, items, month)
  const lastSixMonths = monthlyTotals(items, 6)
  const categorySpend = expenseByCategory(thisMonth)
  const recent = [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const remaining = safe.planned - safe.spent
  const usedPercent = safe.planned > 0 ? Math.round((safe.spent / safe.planned) * 100) : 0
  const budgetNotes = Object.fromEntries(
    paceWarnings(items, budgets, month).map((warning) => [warning.category, warning.text]),
  )

  if (!ready) return <PageLoader />

  return (
    <div className="animate-rise space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full bg-[#e7efe9] px-3 py-1 text-xs font-medium text-[#0b7a6e]">
            {monthLabel(month)}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#14201c]">Financial overview</h1>
        </div>
        <p className="rounded-full border border-[#d5e4da] bg-white px-3 py-1 text-xs text-[#5c6b64]">
          {safe.daysLeft} day{safe.daysLeft === 1 ? '' : 's'} left
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#0c6b62] to-[#1aa392] p-6 text-white shadow-panel lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-white/75">Daily safe limit</p>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Auto-calculated</span>
          </div>
          <div className="mt-8">
            <p className="text-5xl font-semibold tracking-tight tabular-nums">
              {formatINR(safe.todaySafe)}
              <span className="ml-1 text-2xl font-medium text-white/80">/day</span>
            </p>
            <p className="mt-3 text-sm text-white/90">Safe to spend today without crossing the monthly plan.</p>
          </div>
          <div className="mt-8 rounded-2xl bg-black/10 px-4 py-3">
            <p className="text-xs text-white/70">This month</p>
            <p className="mt-1 text-sm">{tip}</p>
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <MiniStat
            label="Salary"
            value={formatINR(safe.income)}
            icon={<HiOutlineBanknotes size={18} />}
          />
          <MiniStat
            label="Budgets"
            value={formatINR(safe.planned)}
            icon={<HiOutlineFlag size={18} />}
          />
          <MiniStat
            label="Spent so far"
            value={formatINR(safe.spent)}
            hint={safe.planned > 0 ? `${usedPercent}% of the budgets` : undefined}
            icon={<HiOutlineReceiptPercent size={18} />}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Last 6 months" className="lg:col-span-3">
          {lastSixMonths.length === 0 ? (
            <EmptyState title="No data yet." hint="Log salary and spends to see the trend." />
          ) : (
            <>
              <div className="mb-2 flex gap-4 text-xs text-[#5c6b64]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0b7a6e]" /> Income
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#d97757]" /> Expenses
                </span>
              </div>
              <TrendChart data={lastSixMonths} />
            </>
          )}
        </Card>

        <Card title="Budgets this month" className="lg:col-span-2">
          <BudgetList rows={budgetRows} notes={budgetNotes} />
          {budgetRows.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-[#e7efe9] pt-3 text-sm">
              <span className="text-[#5c6b64]">
                Total {formatINR(safe.planned)}
              </span>
              <span className={remaining >= 0 ? 'font-medium text-[#0b7a6e]' : 'font-medium text-[#d97757]'}>
                Left {formatINR(remaining)}
              </span>
            </div>
          )}
          <Link to="/settings" className="mt-3 inline-block text-sm font-medium text-[#0b7a6e] hover:text-[#086057]">
            Edit budgets
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Spend by category">
          {categorySpend.length === 0 ? (
            <EmptyState title="No expenses this month." />
          ) : (
            <div className="grid items-center gap-2 sm:grid-cols-2">
              <div className="relative">
                <CategoryDonut data={categorySpend} />
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wide text-[#5c6b64]">Total</p>
                    <p className="text-sm font-semibold text-[#14201c]">{formatINR(safe.spent)}</p>
                  </div>
                </div>
              </div>
              <ul className="flex flex-col gap-2">
                {categorySpend.map((row, i) => (
                  <li key={row.name} className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 text-[#14201c]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOTS[i % DOTS.length] }} />
                      {row.name}
                    </span>
                    <span className="text-[#5c6b64]">{formatINR(row.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card title="Recent">
          <div className="mb-2 text-right">
            <Link to="/transactions" className="text-xs font-medium text-[#0b7a6e] hover:text-[#086057]">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No transactions yet." hint="Start with this month’s salary." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-[#5c6b64]">
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium">Title</th>
                    <th className="px-2 py-2 font-medium">Category</th>
                    <th className="px-2 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((tx) => (
                    <tr key={tx.id} className="border-t border-[#e7efe9]">
                      <td className="whitespace-nowrap px-2 py-2.5 text-[#5c6b64]">{formatDate(tx.date)}</td>
                      <td className="px-2 py-2.5 font-medium text-[#14201c]">{tx.title}</td>
                      <td className="px-2 py-2.5">
                        <Badge tone={tx.type === 'income' ? 'income' : 'neutral'}>{tx.category}</Badge>
                      </td>
                      <td
                        className={`px-2 py-2.5 text-right font-medium ${
                          tx.type === 'income' ? 'text-[#0b7a6e]' : 'text-[#14201c]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '−'}
                        {formatINR(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint?: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#d5e4da] bg-white px-4 py-3.5 shadow-panel">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#5c6b64]">{label}</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-[#14201c]">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-[#5c6b64]">{hint}</p>}
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7efe9] text-[#0b7a6e]">{icon}</span>
    </div>
  )
}
