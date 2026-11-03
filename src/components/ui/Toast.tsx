type Props = {
  message: string
  tone?: 'success' | 'error' | 'info'
  onClose?: () => void
}

/** Small floating message — used by ToastProvider. */
export default function Toast({ message, tone = 'success', onClose }: Props) {
  let colors = 'bg-[#0b7a6e] text-white'
  if (tone === 'error') colors = 'bg-[#c45c3e] text-white'
  if (tone === 'info') colors = 'bg-[#14201c] text-white'

  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_12px_40px_rgba(20,32,28,0.28)] ${colors}`}
    >
      <p className="flex-1 leading-snug">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md px-1.5 text-white/80 hover:bg-white/15 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}
