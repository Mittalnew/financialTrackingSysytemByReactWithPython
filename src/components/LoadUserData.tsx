import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchBudgets } from '../store/budgetsSlice'
import { fetchCategories } from '../store/categoriesSlice'
import { fetchTransactions } from '../store/transactionsSlice'

/**
 * After login, pull transactions + budgets from API into Redux once.
 * Dashboard / Analytics / Transactions then read the same Redux lists.
 */
export default function LoadUserData() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!user) return
    void dispatch(fetchTransactions())
    void dispatch(fetchBudgets())
    void dispatch(fetchCategories())
  }, [user, dispatch])

  return null
}
