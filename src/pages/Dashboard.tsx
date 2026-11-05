import { Link } from 'react-router-dom'
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import BudgetList from '../components/BudgetList'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { CategoryDonut, TrendChart } from '../components/charts'
import { PageLoader, useDataReady } from '../components/ui/Spinner'
import { useAppSelector } from '../store'
import { budgetProgress } from '../utils/budgets'
import { currentMonth, formatDate, formatINR, monthLabel, todayISO } from '../utils/format'
import { monthPace, monthReport, monthTip, paceWarnings, safeToSpend, versusLastMonth } from '../utils/insights'
import type { MoneyDelta } from '../utils/insights'
import { expenseByCategory, monthlyTotals } from '../utils/stats'

const DOTS = ['#0b7a6e', '#3d9b8f', '#5b8def', '#e0a15a', '#d97757']

export default function Dashboard() {
  const ready = useDataReady()
  const items = useAppSelector((s) => s.transactions.items)
  const budgets = useAppSelector((s) => s.budgets.items)
  const savingsGoal = useAppSelector((s) => s.auth.user?.savings_goal ?? 0)

  const month = currentMonth()
  const today = todayISO()
  const thisMonth = items.filter((tx) => tx.date.startsWith(month))
  const safe = safeToSpend(items, budgets, month, today, savingsGoal)
  const compare = versusLastMonth(items, month)
  const pace = monthPace(items, budgets, month, today)
  const report = monthReport(items, budgets, month, savingsGoal)
  const tip = monthTip(items, month)
  const budgetRows = budgetProgress(budgets, items, month)
  const lastSixMonths = monthlyTotals(items, 6)
  const categorySpend = expenseByCategory(thisMonth)
  const recent = [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const cash = compare.now
  const remaining = safe.planned - safe.spent
  const usedPercent = safe.planned > 0 ? Math.round((safe.spent / safe.planned) * 100) : 0
  const budgetNotes = Object.fromEntries(
    paceWarnings(items, budgets, month).map((warning) => [warning.category, warning.text]),
  )

  if (!ready) return <PageLoader />

  return (
    <div className="animate-rise space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b7a6e]">Overview</p>
          <h1 className="mt-1 text-[1.65rem] font-semibold tracking-tight text-[#14201c]">Financial overview</h1>
        </div>
        <p className="text-sm text-[#5c6b64]">
          {monthLabel(month)}
          <span className="mx-2 text-[#c5d5cc]">·</span>
          {safe.daysLeft} day{safe.daysLeft === 1 ? '' : 's'} left
        </p>
      </header>

      <section className="rounded-3xl border border-[#d5e4da] bg-white p-5 shadow-panel sm:p-6">
        <p className="text-xs font-medium text-[#5c6b64]">Salary − spent = left</p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <LedgerStat label="Salary" value={formatINR(cash.income)} delta={compare.hasPrevious ? compare.income : undefined} kind="income" />
          <LedgerStat label="Spent" value={formatINR(cash.spent)} delta={compare.hasPrevious ? compare.spent : undefined} kind="spent" />
          <LedgerStat label="Left" value={formatINR(cash.left)} delta={compare.hasPrevious ? compare.left : undefined} kind="left" />
          <LedgerStat label="Save goal" value={formatINR(savingsGoal)} hint={goalHint(cash.left, savingsGoal)} />
        </div>

        <div className="mt-6 border-t border-[#e7efe9] pt-5">
          {pace.ready ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-[#14201c]">
                  {pace.label}
                  <span className="text-[#5c6b64]">
                    {' '}
                    · month {pace.elapsed}% through · {pace.comparesToPlan ? 'plan' : 'income'} {pace.used}% used
                  </span>
                </p>
                <p className={`text-xs font-medium ${pace.ahead ? 'text-[#d97757]' : 'text-[#0b7a6e]'}`}>
                  {pace.ahead ? 'Ahead of the month' : 'Inside the month’s pace'}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                <PaceBar label="Month" percent={pace.elapsed} tone="neutral" />
                <PaceBar label={pace.comparesToPlan ? 'Plan' : 'Income'} percent={pace.used} tone={pace.ahead ? 'warn' : 'ok'} />
              </div>
            </>
          ) : (
            <p className="text-sm text-[#5c6b64]">Add a salary or category limits to compare this month’s pace.</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#0c6b62] to-[#1aa392] p-6 text-white shadow-panel lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-white/75">Daily safe limit</p>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">From the plan</span>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-semibold tracking-tight tabular-nums">
              {formatINR(safe.todaySafe)}
              <span className="ml-1 text-2xl font-medium text-white/80">/day</span>
            </p>
            <p className="mt-3 max-w-md text-sm text-white/90">Safe to spend today without crossing the monthly plan.</p>
          </div>
          <div className="mt-6 rounded-2xl bg-black/10 px-4 py-3">
            <p className="text-xs text-white/70">This month</p>
            <p className="mt-1 text-sm">{tip}</p>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-3xl border border-[#d5e4da] bg-white p-5 shadow-panel lg:col-span-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5c6b64]">Monthly plan</p>
            {safe.planned > 0 ? (
              <>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[#14201c]">{formatINR(safe.planned)}</p>
                <p className="mt-1 text-sm text-[#5c6b64]">set aside in category limits</p>
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-[#5c6b64]">
                    <span>{usedPercent}% used</span>
                    <span className={remaining >= 0 ? 'text-[#0b7a6e]' : 'text-[#d97757]'}>
                      {formatINR(remaining)} left
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#e7efe9]">
                    <div
                      className={`h-full rounded-full ${usedPercent > 100 ? 'bg-[#d97757]' : 'bg-[#0b7a6e]'}`}
                      style={{ width: `${Math.min(usedPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-[#5c6b64]">Set category limits so this month has a plan to measure against.</p>
            )}
          </div>
          <Link to="/settings" className="mt-5 inline-block text-sm font-medium text-[#0b7a6e] hover:text-[#086057]">
            Edit plan
          </Link>
        </section>
      </div>

      {report.length > 0 && (
        <Card title="Plan check">
          <ul className="space-y-2">
            {report.map((line) => (
              <li key={line.text} className="flex items-start gap-2 text-sm text-[#14201c]">
                {line.tone === 'warn' ? (
                  <HiOutlineExclamationTriangle className="mt-0.5 shrink-0 text-[#d97757]" size={16} />
                ) : (
                  <HiOutlineCheckCircle className="mt-0.5 shrink-0 text-[#0b7a6e]" size={16} />
                )}
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

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

function goalHint(left: number, goal: number) {
  if (goal <= 0) return 'Set this in your plan'
  if (left >= goal) return 'Goal is covered'
  return `${formatINR(goal - left)} still to cover`
}

function deltaClass(kind: 'income' | 'spent' | 'left', diff: number) {
  if (Math.round(diff) === 0) return 'text-[#5c6b64]'
  const up = diff > 0
  if (kind === 'spent') return up ? 'text-[#d97757]' : 'text-[#0b7a6e]'
  return up ? 'text-[#0b7a6e]' : 'text-[#d97757]'
}

function LedgerStat({
  label,
  value,
  delta,
  kind,
  hint,
}: {
  label: string
  value: string
  delta?: MoneyDelta
  kind?: 'income' | 'spent' | 'left'
  hint?: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5c6b64]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#14201c]">{value}</p>
      {delta && kind && <p className={`mt-1 text-xs ${deltaClass(kind, delta.diff)}`}>{delta.text}</p>}
      {hint && <p className="mt-1 text-xs text-[#5c6b64]">{hint}</p>}
    </div>
  )
}

function PaceBar({ label, percent, tone }: { label: string; percent: number; tone: 'neutral' | 'ok' | 'warn' }) {
  const fill = tone === 'warn' ? 'bg-[#d97757]' : tone === 'ok' ? 'bg-[#0b7a6e]' : 'bg-[#8aa89a]'
  return (
    <div className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3 text-xs text-[#5c6b64]">
      <span>{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e7efe9]">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
      </div>
      <span className="text-right tabular-nums">{percent}%</span>
    </div>
  )
}
