import type { SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: { value: string; label: string }[]
}

export default function Select({ label, options, className = '', ...props }: Props) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1.5 block font-medium text-ink-muted">{label}</span>}
      <select
        {...props}
        className={`w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-ink outline-none transition-colors focus:border-brand focus:bg-white ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
