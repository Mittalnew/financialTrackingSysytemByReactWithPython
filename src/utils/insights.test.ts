import { describe, expect, it } from 'vitest'
import { daysLeftInMonth, paceWarnings, previewSpend, safeToSpend } from './insights'
import type { Budget, Transaction } from '../types'

describe('safeToSpend', () => {
  it('counts today in the days left', () => {
    expect(daysLeftInMonth('2026-11', '2026-11-05')).toBe(26)
  })

  it('spreads salary minus budgets over the days left, then takes off today', () => {
    const items: Transaction[] = [
      { id: '1', date: '2026-11-01', title: 'Pay', category: 'Salary', type: 'income', amount: 90000 },
      { id: '2', date: '2026-11-05', title: 'Lunch', category: 'Food', type: 'expense', amount: 650 },
    ]
    const budgets: Budget[] = [
      { category: 'Rent', limit: 18000 },
      { category: 'Food', limit: 8000 },
      { category: 'Travel', limit: 4000 },
      { category: 'Shopping', limit: 5000 },
    ]
    const result = safeToSpend(items, budgets, '2026-11', '2026-11-05')
    // (90000 - 35000) / 26 - 650
    expect(result.daysLeft).toBe(26)
    expect(Math.round(result.todaySafe)).toBe(Math.round(55000 / 26 - 650))
  })
})

describe('previewSpend', () => {
  const budgets: Budget[] = [{ category: 'Food', limit: 8000 }]
  const items: Transaction[] = [
    { id: '1', date: '2026-11-01', title: 'Pay', category: 'Salary', type: 'income', amount: 90000 },
    { id: '2', date: '2026-11-02', title: 'Groceries', category: 'Food', type: 'expense', amount: 3450 },
  ]

  it('shows the budget and today’s limit before save', () => {
    const preview = previewSpend(
      items,
      budgets,
      { type: 'expense', amount: 650, category: 'Food', date: '2026-11-05' },
      '2026-11-05',
    )
    expect(preview?.tone).toBe('ok')
    expect(preview?.lines[0]).toBe('Food goes from ₹3,450 / ₹8,000 to ₹4,100.')
    expect(preview?.lines[1]).toContain('Today’s safe limit goes from')
  })

  it('warns when the draft crosses the budget', () => {
    const preview = previewSpend(
      items,
      budgets,
      { type: 'expense', amount: 5000, category: 'Food', date: '2026-11-05' },
      '2026-11-05',
    )
    expect(preview?.tone).toBe('warn')
    expect(preview?.lines[0]).toContain('over')
  })
})

describe('paceWarnings', () => {
  it('names the day a category runs out', () => {
    const items: Transaction[] = [
      { id: '1', date: '2026-11-02', title: 'Groceries', category: 'Food', type: 'expense', amount: 3450 },
    ]
    const warnings = paceWarnings(items, [{ category: 'Food', limit: 8000 }], '2026-11', '2026-11-05')
    expect(warnings).toEqual([
      {
        category: 'Food',
        text: 'Food runs out on 12 Nov at this pace.',
        detail: 'Runs out at this pace',
        date: '2026-11-12',
        dateLabel: '12 Nov',
      },
    ])
  })
})