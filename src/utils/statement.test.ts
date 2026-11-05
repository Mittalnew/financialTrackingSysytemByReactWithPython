import { describe, expect, it } from 'vitest'
import { parseStatement } from './statement'

describe('parseStatement', () => {
  it('reads date, description, and signed amount', () => {
    const csv = `date,description,amount
2026-11-03,Swiggy dinner,-650
05/11/2026,Uber to office,-240
2026-11-01,November salary,90000`
    expect(parseStatement(csv)).toEqual([
      { date: '2026-11-03', title: 'Swiggy dinner', category: 'Food', type: 'expense', amount: 650 },
      { date: '2026-11-05', title: 'Uber to office', category: 'Travel', type: 'expense', amount: 240 },
      { date: '2026-11-01', title: 'November salary', category: 'Salary', type: 'income', amount: 90000 },
    ])
  })
})
