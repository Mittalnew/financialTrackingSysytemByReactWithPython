import { Link } from 'react-router-dom'
import BudgetList from '../components/BudgetList'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { CategoryDonut, TrendChart } from '../components/charts'
import { useAppSelector } from '../store'
import { budgetProgress } from '../utils/budgets'
import { currentMonth, formatDate, formatINR, monthLabel } from '../utils/format'
import { monthCashflow, monthTip } from '../utils/insights'
import { expenseByCategory, monthlyTotals } from '../utils/stats'

export default function Dashboard() {
  const items = useAppSelector((s) => s.transactions.items)
  const budgets = useAppSelector((s) => s.budgets.items)

  const month = currentMonth()
  const thisMonth = items.filter((tx) => tx.date.startsWith(month))
  const cash = monthCashflow(items, month)
  const tip = monthTip(items, month)
  const budgetRows = budgetProgress(budgets, items, month)

  const lastSixMonths = monthlyTotals(items, 6)
  const categorySpend = expenseByCategory(thisMonth)
  const recent = [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div className="animate-rise space-y-5">
      {/* Hook: Salary → Spend → Left */}
      <section className="overflow-hidden rounded-2xl border border-[#d5e4da] bg-white shadow-panel">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#0b7a6e]">{monthLabel(month)}</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-[#14201c]">What’s left?</h1>
            <p className="mt-1 text-sm text-[#5c6b64]">
              Salary in, spend out — leftover is what you actually kept.
            </p>
            <p className="mt-3 max-w-lg rounded-lg bg-[#e7efe9] px-3 py-2 text-sm text-[#14201c]">
              {tip}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-6 lg:gap-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#5c6b64]">Left</p>
              <p
                className={`mt-0.5 text-3xl font-semibold tabular-nums ${
                  cash.left >= 0 ? 'text-[#14201c]' : 'text-[#d97757]'
                }`}
              >
                {formatINR(cash.left)}
              </p>
            </div>
            <div className="h-10 w-px bg-[#d5e4da] max-sm:hidden" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#5c6b64]">Salary</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#0b7a6e]">
                {formatINR(cash.income)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#5c6b64]">Spent</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#d97757]">
                {formatINR(cash.spent)}
              </p>
            </div>
            <Link
              to="/transactions"
              className="rounded-lg bg-[#0b7a6e] px-4 py-2 text-sm font-medium text-white hover:bg-[#086057]"
            >
              Add / edit
            </Link>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#0b7a6e] via-[#3d9b8f] to-[#d97757]" />
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Last 6 months" className="lg:col-span-3">
          {lastSixMonths.length === 0 ? (
            <EmptyState
              title="No data yet."
              hint="Log salary and spends to see the trend."
              action={
                <Link to="/transactions" className="text-sm font-medium text-[#0b7a6e]">
                  Go to transactions
                </Link>
              }
            />
          ) : (
            <TrendChart data={lastSixMonths} />
          )}
        </Card>
        <Card title="Budgets this month" className="lg:col-span-2">
          <BudgetList rows={budgetRows} />
          {budgetRows.length > 0 && (
            <Link
              to="/settings"
              className="mt-4 inline-block text-sm font-medium text-[#0b7a6e] hover:text-[#086057]"
            >
              Edit budgets
            </Link>
          )}
        </Card>
      </div>

      <Card title="Spend by category">
        {categorySpend.length === 0 ? (
          <EmptyState
            title="No expenses this month."
            action={
              <Link to="/transactions" className="text-sm font-medium text-[#0b7a6e]">
                Add an expense
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 md:items-center">
            <CategoryDonut data={categorySpend} />
            <ul className="flex flex-col gap-2">
              {categorySpend.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between rounded-lg bg-[#f7fbf8] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-[#14201c]">{c.name}</span>
                  <span className="text-[#5c6b64]">{formatINR(c.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card title="Recent transactions">
        {recent.length === 0 ? (
          <EmptyState
            title="No transactions yet."
            hint="Start with this month’s salary, then add spends."
            action={
              <Link to="/transactions" className="text-sm font-medium text-[#0b7a6e]">
                Add transaction
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#5c6b64]">
                  <th className="whitespace-nowrap px-2 py-2 text-xs font-medium">Date</th>
                  <th className="px-2 py-2 text-xs font-medium">Title</th>
                  <th className="px-2 py-2 text-xs font-medium">Category</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx.id} className="border-t border-[#e7efe9] hover:bg-[#f7fbf8]">
                    <td className="whitespace-nowrap px-2 py-2.5 text-[#5c6b64]">{formatDate(tx.date)}</td>
                    <td className="px-2 py-2.5 font-medium text-[#14201c]">{tx.title}</td>
                    <td className="px-2 py-2.5">
                      <Badge>{tx.category}</Badge>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span className={tx.type === 'income' ? 'font-medium text-[#0b7a6e]' : 'text-[#14201c]'}>
                        {tx.type === 'income' ? '+' : '−'}
                        {formatINR(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
