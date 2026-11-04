import type { Transaction } from '../types'

/** Build a simple CSV string from transactions (for download). */
export function transactionsToCsv(rows: Transaction[]): string {
  const header = ['date', 'title', 'category', 'type', 'amount', 'notes']
  const escape = (v: string) => `"${v.replaceAll('"', '""')}"`
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.date,
        escape(r.title),
        escape(r.category),
        r.type,
        String(r.amount),
        escape(r.notes ?? ''),
      ].join(','),
    ),
  ]
  return lines.join('\n')
}

/** Trigger a browser download of the CSV. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
