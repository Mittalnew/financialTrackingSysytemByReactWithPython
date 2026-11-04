import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const SLIDES = [
  {
    title: 'See what’s left after payday.',
    text: 'Salary in, spend out — leftover is the number that actually matters.',
  },
  {
    title: 'Budgets that stay honest.',
    text: 'Set a limit per category and watch spent vs plan without spreadsheet noise.',
  },
  {
    title: 'One list. Every screen.',
    text: 'Add a transaction once — dashboard, analytics, and budgets all update together.',
  },
]

type Props = {
  title: string
  subtitle: string
  children: ReactNode
}

function appUrlForQr() {
  // Later: set VITE_PUBLIC_APP_URL to your live or LAN URL (e.g. http://192.168.x.x:5173)
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim()
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://fintrack.app'
}

/** Shared auth layout: left story carousel + QR, right form. */
export default function AuthShell({ title, subtitle, children }: Props) {
  const [index, setIndex] = useState(0)
  const [qrUrl, setQrUrl] = useState('https://fintrack.app')

  useEffect(() => {
    setQrUrl(appUrlForQr())
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[index]

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand + carousel + QR */}
      <aside className="relative hidden overflow-hidden bg-[#0f2a24] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(18,165,148,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(224,122,95,0.18), transparent 50%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#12a594] text-lg font-bold shadow-[0_8px_28px_rgba(18,165,148,0.45)]">
              F
            </span>
            <div>
              <p className="text-xl font-semibold tracking-tight">Fintrack</p>
              <p className="text-xs text-white/55">Salary → spend → left</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7dfff0]/70">
            Why Fintrack
          </p>
          <div key={index} className="auth-slide mt-4">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              {slide.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/65">{slide.text}</p>
          </div>

          <div className="mt-10 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-8 bg-[#12a594]' : 'w-2.5 bg-white/25 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative flex items-end justify-between gap-6">
          <p className="max-w-[12rem] text-sm text-white/40">
            Personal finance, without the clutter.
          </p>
          <div className="rounded-2xl border border-white/15 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
            <QRCodeSVG value={qrUrl} size={112} level="M" includeMargin={false} bgColor="#ffffff" fgColor="#0f2a24" />
            <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-wide text-[#0f2a24]/70">
              Scan for mobile
            </p>
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-gradient-to-br from-[#f4faf6] via-[#e8f1eb] to-[#dfeae4] p-6 sm:p-10">
        <div className="animate-rise w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,42,36,0.1)] backdrop-blur-md sm:p-10">
          <div className="mb-2 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b7a6e] text-sm font-bold text-white">
              F
            </span>
            <span className="text-lg font-semibold text-[#0b7a6e]">Fintrack</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#14201c] sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-[#5c6b64]">{subtitle}</p>
          <div className="mt-6">{children}</div>

          {/* Mobile: compact QR under form */}
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#d5e4da] bg-[#f7fbf8] p-3 lg:hidden">
            <div className="rounded-xl bg-white p-2">
              <QRCodeSVG value={qrUrl} size={72} level="M" bgColor="#ffffff" fgColor="#0f2a24" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#14201c]">Open on another phone</p>
              <p className="mt-0.5 text-xs text-[#5c6b64]">Scan this QR in your camera app.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
