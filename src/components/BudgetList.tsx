import { Link } from 'react-router-dom'
import type { BudgetRow } from '../utils/budgets'
import { formatINR } from '../utils/format'
import EmptyState from './ui/EmptyState'

type Props = {
  rows: BudgetRow[]
}

/** Simple progress bars: spent vs monthly limit. */
export default function BudgetList({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No budgets yet."
        hint="Set a category limit in Settings."
        action={
          <Link to="/settings" className="text-sm font-medium text-[#0b7a6e]">
            Open Settings
          </Link>
        }
      />
    )
  }

  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.category}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-[#14201c]">{row.category}</span>
            <span className={row.over ? 'text-[#d97757]' : 'text-[#5c6b64]'}>
              {formatINR(row.spent)} / {formatINR(row.limit)}
              {row.over ? ' · over' : ''}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e7efe9]">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                row.over ? 'bg-[#d97757]' : 'bg-[#0b7a6e]'
              }`}
              style={{ width: `${row.percent}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
