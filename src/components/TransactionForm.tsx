import { useState } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import { CATEGORIES } from '../constants'
import type { Transaction } from '../types'
import { todayISO } from '../utils/format'

type Props = {
  initial?: Transaction | null
  onSave: (data: Omit<Transaction, 'id'> & { id?: string }) => void
  onCancel: () => void
}

export default function TransactionForm({ initial, onSave, onCancel }: Props) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'Food')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [notes, setNotes] = useState(initial?.notes ?? '')

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
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
