import { useState } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import { CATEGORIES } from '../constants'
import { useToast } from '../context/ToastContext'
import { useAppDispatch, useAppSelector } from '../store'
import { addCategory } from '../store/categoriesSlice'

/** Defaults plus any name this user has added. */
export function useCategoryNames(includeSalary = true) {
  const saved = useAppSelector((s) => s.categories.items)
  const names = [...CATEGORIES]
  for (const name of saved) {
    const exists = names.some((item) => item.toLowerCase() === name.toLowerCase())
    if (!exists) names.push(name)
  }
  if (includeSalary) return names
  return names.filter((name) => name.toLowerCase() !== 'salary')
}

type Props = {
  label?: string
  value: string
  onChange: (value: string) => void
  includeSalary?: boolean
}

/** Dropdown plus a small box to add a category that is missing. */
export default function CategoryField({ label = 'Category', value, onChange, includeSalary = true }: Props) {
  const names = useCategoryNames(includeSalary)
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const options = names.map((name) => ({ value: name, label: name }))
  if (value && !names.some((name) => name === value)) {
    options.push({ value, label: value })
  }

  async function handleAdd() {
    const name = draft.trim()
    if (!name) {
      showToast('Enter a category name', 'info')
      return
    }
    setAdding(true)
    try {
      const saved = await dispatch(addCategory(name)).unwrap()
      onChange(saved)
      setDraft('')
      showToast(`${saved} added`)
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Could not add category', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div>
      <Select label={label} value={value} onChange={(e) => onChange(e.target.value)} options={options} />
      <div className="mt-2 flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Input
            label="New category"
            value={draft}
            placeholder="e.g. Health"
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        <Button type="button" variant="secondary" loading={adding} onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  )
}
