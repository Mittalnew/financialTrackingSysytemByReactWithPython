/** Turn a bank CSV into rows the user can fix before save. */

export type DraftRow = {
  date: string
  title: string
  category: string
  type: 'income' | 'expense'
  amount: number
}

const RULES: { category: string; words: string[] }[] = [
  { category: 'Food', words: ['swiggy', 'zomato', 'blinkit', 'zepto', 'grocery', 'restaurant', 'cafe', 'coffee'] },
  { category: 'Travel', words: ['uber', 'ola', 'rapido', 'metro', 'irctc', 'petrol', 'fuel'] },
  { category: 'Rent', words: ['rent', 'landlord'] },
  { category: 'Shopping', words: ['amazon', 'flipkart', 'myntra'] },
]

export function guessCategory(description: string) {
  const text = description.toLowerCase()
  for (const rule of RULES) {
    if (rule.words.some((word) => text.includes(word))) return rule.category
  }
  return 'Shopping'
}

function splitCsv(line: string) {
  return line.split(',').map((part) => part.trim().replace(/^"|"$/g, ''))
}

/** "05/11/2026" or "2026-11-05" → "2026-11-05". */
function normalizeDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const match = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (!match) return value
  const day = match[1].padStart(2, '0')
  const month = match[2].padStart(2, '0')
  return `${match[3]}-${month}-${day}`
}

export function parseStatement(csv: string): DraftRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) return []

  const header = lines[0].toLowerCase()
  const start = header.includes('date') && header.includes('amount') ? 1 : 0
  const rows: DraftRow[] = []

  for (const line of lines.slice(start)) {
    const parts = splitCsv(line)
    if (parts.length < 3) continue
    const amount = Number(parts[2].replace(/[₹,\s]/g, ''))
    if (!parts[0] || !parts[1] || !amount) continue
    const type = amount < 0 ? 'expense' : 'income'
    rows.push({
      date: normalizeDate(parts[0]),
      title: parts[1],
      category: type === 'income' ? 'Salary' : guessCategory(parts[1]),
      type,
      amount: Math.abs(amount),
    })
  }
  return rows
}
