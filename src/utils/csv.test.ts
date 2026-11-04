import { describe, expect, it } from 'vitest'
import { transactionsToCsv } from './csv'
import type { Transaction } from '../types'

describe('transactionsToCsv', () => {
  it('writes header and one row', () => {
    const rows: Transaction[] = [
      {
        id: '1',
        date: '2026-11-04',
        title: 'Salary',
        category: 'Salary',
        type: 'income',
        amount: 50000,
        notes: 'Nov',
      },
    ]
    const csv = transactionsToCsv(rows)
    expect(csv.split('\n')[0]).toBe('date,title,category,type,amount,notes')
    expect(csv).toContain('2026-11-04')
    expect(csv).toContain('"Salary"')
    expect(csv).toContain('50000')
  })
})
