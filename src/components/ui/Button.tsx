import type { ButtonHTMLAttributes } from 'react'
import Spinner from './Spinner'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: Props) {
  let color = 'bg-brand text-white hover:bg-brand-dark'
  if (variant === 'secondary') {
    color = 'bg-white/80 text-ink border border-[var(--line)] hover:bg-white'
  }
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${color} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
