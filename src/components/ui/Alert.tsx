type Props = {
  message: string
  tone?: 'error' | 'info'
}

export default function Alert({ message, tone = 'error' }: Props) {
  const color =
    tone === 'error'
      ? 'border-coral/30 bg-coral-soft text-coral'
      : 'border-brand/20 bg-brand-soft text-brand-dark'

  return (
    <p className={`rounded-xl border px-3 py-2 text-sm ${color}`} role="alert">
      {message}
    </p>
  )
}
