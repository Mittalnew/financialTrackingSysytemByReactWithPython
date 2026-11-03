import type { ReactNode } from 'react'

type Props = {
  title: string
  hint?: string
  action?: ReactNode
}

export default function EmptyState({ title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p className="font-medium text-[#14201c]">{title}</p>
      {hint && <p className="text-sm text-[#5c6b64]">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
