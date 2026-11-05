import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
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
import { useCategoryNames } from '../components/CategoryField'
import { apiImportStatement } from '../api'
import Spinner, { PageLoader, useDataReady } from '../components/ui/Spinner'
import { useToast } from '../context/ToastContext'
import { useAppDispatch, useAppSelector } from '../store'
import {
  addTransaction,
  deleteTransaction,
  fetchTransactions,
  setFilters,
  updateTransaction,
} from '../store/transactionsSlice'
import type { Transaction } from '../types'
import { applyFilters, monthFilterOptions } from '../utils/filters'
import { downloadCsv, transactionsToCsv } from '../utils/csv'
import { formatDate, formatINR, formatStamp, monthLabel } from '../utils/format'
import { parseStatement, type DraftRow } from '../utils/statement'

const PAGE_SIZE = 12

export default function Transactions() {
  const ready = useDataReady()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const { items, filters } = useAppSelector((s) => s.transactions)
  const rows = applyFilters(items, filters)
  const categoryNames = useCategoryNames()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<DraftRow[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [page, setPage] = useState(1)
  const fileRef = useRef<HTMLInputElement>(null)

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [filters.search, filters.month, filters.category, filters.type])

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
    setSaving(true)
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
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await dispatch(deleteTransaction(id)).unwrap()
      showToast('Transaction deleted')
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Delete failed', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const rows = parseStatement(String(reader.result || ''))
      if (rows.length === 0) {
        showToast('Could not read that file. Use date, description, amount.', 'error')
        return
      }
      setDrafts(rows)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!drafts || drafts.length === 0) return
    setImporting(true)
    try {
      await apiImportStatement(drafts)
      await dispatch(fetchTransactions()).unwrap()
      setDrafts(null)
      showToast('Statement added')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Import failed', 'error')
    } finally {
      setImporting(false)
    }
  }

  function handleExportCsv() {
    if (rows.length === 0) {
      showToast('Nothing to export', 'error')
      return
    }
    downloadCsv(`fintrack-transactions-${Date.now()}.csv`, transactionsToCsv(rows))
    showToast('CSV downloaded')
  }

  if (!ready) return <PageLoader />

  return (
    <div className="animate-rise">
      <Header
        title="Transactions"
        action={
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
              Upload statement
            </Button>
            <Button type="button" variant="secondary" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button onClick={openAdd}>Add transaction</Button>
          </div>
        }
      />

      {drafts && (
        <Card title="Check the statement" className="mb-4">
          <p className="mb-3 text-sm text-[#5c6b64]">
            Negative amounts are spends. Fix a category if the guess is wrong, then save.
            Uploading again replaces the previous statement for those months.
          </p>
          <ul className="mb-4 max-h-80 space-y-2 overflow-y-auto">
            {drafts.map((row, index) => (
              <li key={`${row.date}-${row.title}-${index}`} className="grid gap-2 rounded-xl bg-[#f4f8f5] p-3 sm:grid-cols-[7rem_1fr_8rem_6rem] sm:items-center">
                <span className="text-xs text-[#5c6b64]">{formatDate(row.date)}</span>
                <span className="text-sm font-medium text-[#14201c]">{row.title}</span>
                <Select
                  value={row.category}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev?.map((item, i) => (i === index ? { ...item, category: e.target.value } : item)) ?? null,
                    )
                  }
                  options={(categoryNames.includes(row.category)
                    ? categoryNames
                    : [...categoryNames, row.category]
                  ).map((c) => ({ value: c, label: c }))}
                />
                <span className={`text-sm font-medium ${row.type === 'income' ? 'text-brand' : 'text-[#14201c]'}`}>
                  {row.type === 'income' ? '+' : '−'}
                  {formatINR(row.amount)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button type="button" loading={importing} onClick={handleImport}>
              Save statement
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDrafts(null)} disabled={importing}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

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
              ...categoryNames.map((c) => ({ value: c, label: c })),
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
          <>
            <p className="mb-3 text-sm text-[#5c6b64]">
              {rows.length} transaction{rows.length === 1 ? '' : 's'}
            </p>
            <ul className="flex flex-col gap-3 md:hidden">
              {pageRows.map((tx, index) => (
                <li
                  key={tx.id}
                  className="rounded-2xl border border-[#e7efe9] bg-[#fbfdfb] px-3.5 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#14201c]">
                        <span className="mr-2 text-xs font-normal text-[#5c6b64]">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}.
                        </span>
                        {tx.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#5c6b64]">{formatDate(tx.date)}</p>
                      <p className="mt-0.5 text-[11px] text-[#5c6b64]">Created {formatStamp(tx.created_at)}</p>
                      <p className="text-[11px] text-[#5c6b64]">Updated {formatStamp(tx.updated_at)}</p>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-semibold ${
                        tx.type === 'income' ? 'text-brand' : 'text-[#14201c]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '−'}
                      {formatINR(tx.amount)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge>{tx.category}</Badge>
                      <Badge tone={tx.type}>{tx.type === 'income' ? 'Income' : 'Expense'}</Badge>
                      <Badge>{tx.source === 'statement' ? 'Statement' : 'Form'}</Badge>
                    </div>
                    <RowActions
                      deleting={deletingId === tx.id}
                      onEdit={() => openEdit(tx)}
                      onDelete={() => handleDelete(tx.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-ink-muted">
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Sr</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Added by</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Created</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Updated</th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((tx, index) => (
                    <tr key={tx.id} className="border-t border-[var(--line)] transition-colors hover:bg-white/50">
                      <td className="whitespace-nowrap px-3 py-3 text-ink-muted">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-ink-muted">{formatDate(tx.date)}</td>
                      <td className="px-3 py-3 font-medium">{tx.title}</td>
                      <td className="px-3 py-3">
                        <Badge>{tx.category}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={tx.type}>{tx.type === 'income' ? 'Income' : 'Expense'}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#5c6b64]">
                        {tx.source === 'statement' ? 'Statement' : 'Form'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-[#5c6b64]">
                        {formatStamp(tx.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-[#5c6b64]">
                        {formatStamp(tx.updated_at)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-medium ${
                          tx.type === 'income' ? 'text-brand' : 'text-ink'
                        }`}
                      >
                        {formatINR(tx.amount)}
                      </td>
                      <td className="px-3 py-3">
                        <RowActions
                          deleting={deletingId === tx.id}
                          onEdit={() => openEdit(tx)}
                          onDelete={() => handleDelete(tx.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-[#14201c] hover:bg-[#e7efe9] disabled:opacity-40"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span className="text-[#5c6b64]">
                  {currentPage} / {pageCount}
                </span>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-[#14201c] hover:bg-[#e7efe9] disabled:opacity-40"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit transaction' : 'Add transaction'}
        onClose={closeModal}
      >
        <TransactionForm initial={editing} saving={saving} onCancel={closeModal} onSave={handleSave} />
      </Modal>
    </div>
  )
}

function RowActions({
  deleting,
  onEdit,
  onDelete,
}: {
  deleting: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex justify-end gap-3">
      <button type="button" className="text-ink-muted hover:text-ink" onClick={onEdit} aria-label="Edit">
        <FiEdit2 />
      </button>
      <button
        type="button"
        className="text-coral hover:opacity-80 disabled:opacity-50"
        disabled={deleting}
        onClick={onDelete}
        aria-label="Delete"
      >
        {deleting ? <Spinner size={14} /> : <FiTrash2 />}
      </button>
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
