import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Renders on document.body via portal.
 * Important: pages use CSS transform (animate-rise). Fixed inside a
 * transformed parent sticks to that box — portal avoids that bug.
 */
export default function Modal({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#14201c]/45 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="my-4 w-full max-w-md rounded-2xl border border-[#d5e4da] bg-white p-6 shadow-[0_20px_50px_rgba(20,32,28,0.25)] sm:my-8"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#14201c]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#5c6b64] hover:bg-[#e7efe9] hover:text-[#14201c]"
            aria-label="Close"
          >
            <IoClose size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
