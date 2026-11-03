import type { ReactNode } from 'react'

type Props = { title?: string; className?: string; children: ReactNode }

export default function Card({ title, className = '', children }: Props) {
  return (
    <section
      className={`rounded-2xl border border-[#d5e4da] bg-white p-4 shadow-panel ${className}`}
    >
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#5c6b64]">{title}</h3>
      )}
      {children}
    </section>
  )
}
