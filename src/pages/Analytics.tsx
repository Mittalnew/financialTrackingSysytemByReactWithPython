import { useState } from 'react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import KpiCard from '../components/ui/KpiCard'
import Header from '../components/layout/Header'
import { CategoryBarChart, DailySpendChart, IncomeExpenseBars } from '../components/charts'
import { ANALYTICS_RANGES } from '../constants'
import { PageLoader, useDataReady } from '../components/ui/Spinner'
import { useAppSelector } from '../store'
import { formatCompactINR } from '../utils/format'
import { expenseByCategory, inLastMonths, monthlyTotals, spendByDay, summary } from '../utils/stats'

export default function Analytics() {
  const ready = useDataReady()
  const items = useAppSelector((s) => s.transactions.items)
  const [months, setMonths] = useState(6)

  const list = inLastMonths(items, months)
  const stats = summary(list)
  const byMonth = monthlyTotals(list, months)
  const byCategory = expenseByCategory(list)
  const byDay = spendByDay(list)

  if (!ready) return <PageLoader />

  return (
    <div className="animate-rise">
      <Header
        title="Analytics"
        subtitle={
          stats.topCategory !== '—'
            ? `Top spend: ${stats.topCategory}. Savings rate ${stats.savingsRate}%.`
            : 'See how salary vs spend looks over time.'
        }
        action={
          <div className="flex rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1 text-sm shadow-panel backdrop-blur-sm">
            {ANALYTICS_RANGES.map((range) => (
              <button
                key={range.months}
                type="button"
                onClick={() => setMonths(range.months)}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  months === range.months ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Avg daily spend" value={formatCompactINR(stats.avgDailySpend)} tone="expense" />
        <KpiCard label="Top category" value={stats.topCategory} />
        <KpiCard label="Busiest weekday" value={stats.busiestWeekday} />
        <KpiCard label="Savings rate" value={`${stats.savingsRate}%`} tone="income" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Income vs expense">
          {byMonth.length === 0 ? (
            <EmptyState title="No data for this range." />
          ) : (
            <IncomeExpenseBars data={byMonth} />
          )}
        </Card>
        <Card title="Spend by category">
          {byCategory.length === 0 ? (
            <EmptyState title="No data for this range." />
          ) : (
            <CategoryBarChart data={byCategory} />
          )}
        </Card>
        <Card title="Daily spend" className="lg:col-span-2">
          {byDay.length === 0 ? (
            <EmptyState title="No data for this range." />
          ) : (
            <DailySpendChart data={byDay} />
          )}
        </Card>
      </div>
    </div>
  )
}
