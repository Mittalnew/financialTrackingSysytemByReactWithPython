import type { ReactNode } from 'react'

type Props = { title: string; subtitle?: string; action?: ReactNode }

export default function Header({ title, subtitle, action }: Props) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#14201c]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-[#5c6b64]">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
