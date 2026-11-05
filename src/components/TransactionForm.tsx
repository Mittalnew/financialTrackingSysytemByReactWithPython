import { useState } from 'react'
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import { CATEGORIES } from '../constants'
import { useAppSelector } from '../store'
import type { Transaction } from '../types'
import { todayISO } from '../utils/format'
import { previewSpend } from '../utils/insights'

type Props = {
  initial?: Transaction | null
  saving?: boolean
  onSave: (data: Omit<Transaction, 'id'> & { id?: string }) => void
  onCancel: () => void
}

export default function TransactionForm({ initial, saving = false, onSave, onCancel }: Props) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'Food')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const items = useAppSelector((s) => s.transactions.items)
  const budgets = useAppSelector((s) => s.budgets.items)
  const preview = previewSpend(items, budgets, {
    id: initial?.id,
    type,
    amount: Number(amount),
    category,
    date,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id: initial?.id,
      type,
      amount: Number(amount),
      title,
      category,
      date,
      notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value as 'income' | 'expense')}
        options={[
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
        ]}
      />
      <Input
        label="Amount"
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      {preview && (
        <p
          className={`flex items-start gap-1.5 text-xs ${
            preview.tone === 'warn' ? 'text-[#d97757]' : 'text-[#5c6b64]'
          }`}
        >
          {preview.tone === 'warn' ? (
            <HiOutlineExclamationTriangle className="mt-0.5 shrink-0" size={14} />
          ) : (
            <HiOutlineCheckCircle className="mt-0.5 shrink-0 text-[#0b7a6e]" size={14} />
          )}
          <span>{preview.lines.join(' ')}</span>
        </p>
      )}
      <Input
        label="Description"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save
        </Button>
      </div>
    </form>
  )
}
