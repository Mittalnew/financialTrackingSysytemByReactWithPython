type Props = { children: string; tone?: 'income' | 'expense' | 'neutral' }

export default function Badge({ children, tone = 'neutral' }: Props) {
  let color = 'bg-sage-deep/70 text-ink-muted'
  if (tone === 'income') color = 'bg-brand-soft text-brand-dark'
  if (tone === 'expense') color = 'bg-coral-soft text-coral'

  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {children}
    </span>
  )
}
