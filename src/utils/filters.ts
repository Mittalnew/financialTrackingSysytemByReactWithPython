import type { Filters, Transaction } from '../types'

/** Pure helper — pages call this to get the filtered table rows. */
export function applyFilters(items: Transaction[], filters: Filters) {
  const query = filters.search.trim().toLowerCase()

  return items.filter((tx) => {
    if (query) {
      const inTitle = tx.title.toLowerCase().includes(query)
      const inCategory = tx.category.toLowerCase().includes(query)
      if (!inTitle && !inCategory) return false
    }

    if (filters.month && !tx.date.startsWith(filters.month)) return false
    if (filters.category !== 'all' && tx.category !== filters.category) return false
    if (filters.type !== 'all' && tx.type !== filters.type) return false

    return true
  })
}

/** Build month dropdown options from whatever months exist in the data. */
export function monthFilterOptions(items: Transaction[]) {
  return [...new Set(items.map((tx) => tx.date.slice(0, 7)))].sort().reverse()
}
