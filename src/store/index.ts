import { useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import budgetsReducer from './budgetsSlice'
import categoriesReducer from './categoriesSlice'
import transactionsReducer from './transactionsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    budgets: budgetsReducer,
    categories: categoriesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function useAppDispatch() {
  return useDispatch<AppDispatch>()
}

export function useAppSelector<T>(select: (state: RootState) => T) {
  return useSelector(select)
}
