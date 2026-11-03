import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string }

export default function Input({ label, className = '', ...props }: Props) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1.5 block font-medium text-ink-muted">{label}</span>}
      <input
        {...props}
        className={`w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted/50 focus:border-brand focus:bg-white ${className}`}
      />
    </label>
  )
}
