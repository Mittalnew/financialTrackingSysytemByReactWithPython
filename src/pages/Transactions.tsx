import { useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import Header from '../components/layout/Header'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import TransactionForm from '../components/TransactionForm'
import { CATEGORIES } from '../constants'
import { useToast } from '../context/ToastContext'
import { useAppDispatch, useAppSelector } from '../store'
import {
  addTransaction,
  deleteTransaction,
  setFilters,
  updateTransaction,
} from '../store/transactionsSlice'
import type { Transaction } from '../types'
import { applyFilters, monthFilterOptions } from '../utils/filters'
import { formatDate, formatINR, monthLabel } from '../utils/format'

export default function Transactions() {
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const { items, filters } = useAppSelector((s) => s.transactions)
  const rows = applyFilters(items, filters)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const monthOptions = [
    { value: '', label: 'All months' },
    ...monthFilterOptions(items).map((m) => ({ value: m, label: monthLabel(m) })),
  ]

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(row: Transaction) {
    setEditing(row)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function handleSave(data: Omit<Transaction, 'id'> & { id?: string }) {
    try {
      if (editing) {
        await dispatch(updateTransaction({ ...data, id: editing.id })).unwrap()
        showToast('Transaction updated')
      } else {
        await dispatch(addTransaction(data)).unwrap()
        showToast('Transaction added')
      }
      closeModal()
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Save failed', 'error')
    }
  }

  async function handleDelete(id: string) {
    try {
      await dispatch(deleteTransaction(id)).unwrap()
      showToast('Transaction deleted')
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Delete failed', 'error')
    }
  }

  return (
    <div className="animate-rise">
      <Header title="Transactions" action={<Button onClick={openAdd}>Add transaction</Button>} />

      <Card>
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Input
              placeholder="Search title or category"
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            />
          </div>

          <Select
            value={filters.month}
            onChange={(e) => dispatch(setFilters({ month: e.target.value }))}
            options={monthOptions}
          />

          <Select
            value={filters.category}
            onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
            options={[
              { value: 'all', label: 'All categories' },
              ...CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />

          <TypeTabs value={filters.type} onChange={(type) => dispatch(setFilters({ type }))} />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No transactions"
            hint="Try another filter, or add salary / spend."
            action={
              <Button type="button" onClick={openAdd}>
                Add transaction
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-ink-muted">
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((tx) => (
                  <tr key={tx.id} className="border-t border-[var(--line)] transition-colors hover:bg-white/50">
                    <td className="whitespace-nowrap px-3 py-3 text-ink-muted">{formatDate(tx.date)}</td>
                    <td className="px-3 py-3 font-medium">{tx.title}</td>
                    <td className="px-3 py-3">
                      <Badge>{tx.category}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={tx.type}>{tx.type === 'income' ? 'Income' : 'Expense'}</Badge>
                    </td>
                    <td
                      className={`px-3 py-3 text-right font-medium ${
                        tx.type === 'income' ? 'text-brand' : 'text-ink'
                      }`}
                    >
                      {formatINR(tx.amount)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="text-ink-muted hover:text-ink"
                          onClick={() => openEdit(tx)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          className="text-coral hover:opacity-80"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit transaction' : 'Add transaction'}
        onClose={closeModal}
      >
        <TransactionForm initial={editing} onCancel={closeModal} onSave={handleSave} />
      </Modal>
    </div>
  )
}

function TypeTabs({
  value,
  onChange,
}: {
  value: 'all' | 'income' | 'expense'
  onChange: (type: 'all' | 'income' | 'expense') => void
}) {
  const tabs: Array<'all' | 'income' | 'expense'> = ['all', 'income', 'expense']
  const labels = { all: 'All', income: 'Income', expense: 'Expense' }

  return (
    <div className="flex rounded-xl border border-[var(--line)] bg-white/60 p-0.5 text-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-lg px-3 py-1.5 transition-colors ${
            value === tab ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {labels[tab]}
        </button>
      ))}
    </div>
  )
}
