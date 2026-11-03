import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  let color = 'bg-brand text-white hover:bg-brand-dark'
  if (variant === 'secondary') {
    color = 'bg-white/80 text-ink border border-[var(--line)] hover:bg-white'
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${color} ${className}`}
    />
  )
}
