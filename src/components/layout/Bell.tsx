import { useEffect, useRef, useState } from 'react'
import {
  HiOutlineBell,
  HiOutlineBuildingOffice,
  HiOutlineCake,
  HiOutlineCheckCircle,
  HiOutlineShoppingBag,
  HiOutlineTruck,
} from 'react-icons/hi2'
import type { IconType } from 'react-icons'
import { useAppSelector } from '../../store'
import { currentMonth, monthLabel } from '../../utils/format'
import { paceWarnings } from '../../utils/insights'

const CATEGORY_ICONS: Record<string, IconType> = {
  Food: HiOutlineCake,
  Rent: HiOutlineBuildingOffice,
  Travel: HiOutlineTruck,
  Shopping: HiOutlineShoppingBag,
}

/** Header bell. Same lines as the budget notes, gathered in one place. */
export default function Bell() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const items = useAppSelector((s) => s.transactions.items)
  const budgets = useAppSelector((s) => s.budgets.items)
  const month = currentMonth()
  const warnings = paceWarnings(items, budgets, month)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        aria-label="Budget alerts"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-1.5 text-[#14201c] hover:bg-[#e7efe9]"
      >
        <HiOutlineBell size={22} />
        {warnings.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#d97757] px-1 text-[10px] font-semibold text-white">
            {warnings.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#d5e4da] bg-white shadow-panel">
          <div className="flex items-center justify-between gap-3 border-b border-[#e7efe9] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7efe9] text-[#0b7a6e]">
                <HiOutlineBell size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#14201c]">Alerts</p>
                <p className="text-xs text-[#5c6b64]">{monthLabel(month)}</p>
              </div>
            </div>
            <span className="rounded-full bg-[#e7efe9] px-2.5 py-1 text-xs font-medium text-[#0b7a6e]">
              {warnings.length === 0 ? 'Clear' : warnings.length}
            </span>
          </div>

          {warnings.length === 0 ? (
            <div className="flex items-center gap-2.5 px-4 py-4 text-sm text-[#5c6b64]">
              <HiOutlineCheckCircle className="shrink-0 text-[#0b7a6e]" size={18} />
              Budgets are fine for the rest of the month.
            </div>
          ) : (
            <ul>
              {warnings.map((warning) => {
                const Icon = CATEGORY_ICONS[warning.category] ?? HiOutlineBell
                return (
                  <li
                    key={warning.category}
                    className="flex items-center gap-3 border-t border-[#e7efe9] px-4 py-3 first:border-t-0"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff7ef] text-[#d97757]">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#14201c]">{warning.category}</p>
                      <p className="text-xs text-[#5c6b64]">{warning.detail}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#f4f8f5] px-2.5 py-1 text-[11px] font-medium text-[#0b7a6e]">
                      {warning.dateLabel}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
