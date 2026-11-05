import type { IconType } from 'react-icons'
import {
  HiOutlineArrowRight,
  HiOutlineArrowsRightLeft,
  HiOutlineBanknotes,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineFlag,
  HiOutlineArrowUpTray,
} from 'react-icons/hi2'
import { Link } from 'react-router-dom'

const STEPS: { n: string; title: string; text: string; icon: IconType }[] = [
  {
    n: '01',
    title: 'Set the month',
    text: 'Salary, a save goal, and a limit for Food, Rent, Travel, and Shopping.',
    icon: HiOutlineFlag,
  },
  {
    n: '02',
    title: 'Add the spends',
    text: 'Type them in, or upload a bank CSV at the end of the month.',
    icon: HiOutlineArrowUpTray,
  },
  {
    n: '03',
    title: 'Read the pace',
    text: 'See what is left today, and whether the plan is still on track.',
    icon: HiOutlineChartBar,
  },
]

const POINTS: { title: string; text: string; icon: IconType; tint: string }[] = [
  {
    title: 'Daily safe limit',
    text: 'Salary minus the plan, split across the days that are left.',
    icon: HiOutlineBanknotes,
    tint: 'bg-[#e7f6f3] text-[#0b7a6e]',
  },
  {
    title: 'Plan versus pace',
    text: 'A category that will run out early shows up before the month ends.',
    icon: HiOutlineExclamationTriangle,
    tint: 'bg-[#fdeee8] text-[#d97757]',
  },
  {
    title: 'Statement upload',
    text: 'One CSV format. Uploading the same month again replaces the old lines.',
    icon: HiOutlineDocumentText,
    tint: 'bg-[#e8eefc] text-[#3d5a99]',
  },
  {
    title: 'Last month, beside this one',
    text: 'Salary, spend, and leftover each say how they moved since last month.',
    icon: HiOutlineArrowsRightLeft,
    tint: 'bg-[#e7efe9] text-[#14201c]',
  },
]

export default function Landing() {
  return (
    <div className="relative min-h-screen text-[#14201c]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] overflow-hidden">
        <div className="landing-grid absolute inset-0" />
        <div className="landing-drift absolute -left-24 top-28 h-72 w-72 rounded-full bg-[#0b7a6e]/25 blur-3xl" />
        <div className="landing-drift-slow absolute -right-10 top-8 h-72 w-72 rounded-full bg-[#d97757]/25 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/40 bg-[#f4faf6]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0b7a6e] text-sm font-bold text-white shadow-[0_8px_20px_rgba(11,122,110,0.35)]">
              F
            </span>
            <span className="text-base font-semibold tracking-tight">Fintrack</span>
          </a>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <a href="#how" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-[#5c6b64] hover:text-[#14201c] sm:inline">
              How it works
            </a>
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-[#14201c] hover:bg-white">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-[#0b7a6e] px-3.5 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(11,122,110,0.28)] hover:bg-[#086057]"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-8 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
          <div>
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-[#d5e4da] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b7a6e]">
              <span className="landing-glow h-1.5 w-1.5 rounded-full bg-[#0b7a6e]" />
              Salary, spend, left
            </p>
            <h1 className="animate-rise landing-d1 mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              See what’s left
              <span className="mt-1 block bg-gradient-to-r from-[#0b7a6e] to-[#1aa392] bg-clip-text text-transparent">
                after payday.
              </span>
            </h1>
            <p className="animate-rise landing-d2 mt-5 max-w-md text-base leading-relaxed text-[#5c6b64]">
              One number for today. A plan for the month. A clear read when the bank statement comes in.
            </p>
            <div className="animate-rise landing-d3 mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0b7a6e] px-5 py-3.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(11,122,110,0.32)] transition hover:-translate-y-0.5 hover:bg-[#086057]"
              >
                Create account
                <HiOutlineArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-[#d5e4da] bg-white/90 px-5 py-3.5 text-sm font-medium text-[#14201c] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                I already have one
              </Link>
            </div>
          </div>

          <div className="animate-rise landing-d2 relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="mb-3 flex flex-col gap-2 sm:hidden">
              <Chip icon={HiOutlineExclamationTriangle} tone="warn" text="Food runs out 12 Nov" />
              <Chip icon={HiOutlineCheckCircle} tone="ok" text="₹2,400 more than last month" delay />
            </div>
            <div className="absolute -left-3 top-8 z-10 hidden sm:block">
              <Chip icon={HiOutlineExclamationTriangle} tone="warn" text="Food runs out 12 Nov" />
            </div>
            <div className="absolute -right-2 bottom-8 z-10 hidden sm:block">
              <Chip icon={HiOutlineCheckCircle} tone="ok" text="₹2,400 more than last month" delay />
            </div>
            <div className="rounded-[1.8rem] bg-gradient-to-br from-[#123f38] to-[#0c6b62] p-3 shadow-[0_30px_70px_rgba(15,42,36,0.28)]">
              <PreviewCard />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-6">
          <div className="animate-rise grid gap-3 rounded-[1.7rem] border border-white/70 bg-white/75 p-4 shadow-panel backdrop-blur sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:px-6">
            <Formula label="Salary" value="₹90,000" />
            <span className="hidden text-lg text-[#8aa89a] sm:block">−</span>
            <Formula label="Spent" value="₹21,690" />
            <span className="hidden text-lg text-[#8aa89a] sm:block">=</span>
            <Formula label="Left" value="₹68,310" accent />
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-5 py-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5c6b64]">How it works</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <article
                key={step.n}
                className={`group animate-rise relative overflow-hidden rounded-3xl border border-[#d5e4da] bg-white p-5 shadow-panel transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,42,36,0.08)] ${delayClass(i)}`}
              >
                <p className="absolute -right-1 -top-3 text-5xl font-semibold text-[#e7efe9]">{step.n}</p>
                <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f6f3] text-[#0b7a6e]">
                  <step.icon size={20} />
                </span>
                <h3 className="relative mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-[#5c6b64]">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-5 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5c6b64]">What you see</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {POINTS.map((point, i) => (
              <article
                key={point.title}
                className={`animate-rise flex gap-4 rounded-3xl border border-white/80 bg-white/80 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white ${delayClass(i)}`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${point.tint}`}>
                  <point.icon size={20} />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5c6b64]">{point.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 pt-8">
          <div className="animate-rise relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-[#0c6b62] via-[#12897a] to-[#1aa392] px-6 py-10 text-white shadow-[0_24px_50px_rgba(12,107,98,0.28)] sm:px-10">
            <div className="landing-drift pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">Start this month</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">A plan first. The statement later.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
              Four numbers on day one. At month end, upload the bank file and see what held.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-[#0b7a6e] transition hover:-translate-y-0.5"
              >
                Sign up
                <HiOutlineArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d5e4da]/80 px-5 py-6 text-center text-xs text-[#5c6b64]">
        Fintrack · salary, spend, and what’s left
      </footer>
    </div>
  )
}

function delayClass(index: number) {
  return ['landing-d1', 'landing-d2', 'landing-d3', 'landing-d4'][index] ?? ''
}

function Formula({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? 'rounded-2xl bg-[#e7f6f3] px-3 py-2' : 'px-3 py-2'}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5c6b64]">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${accent ? 'text-[#0b7a6e]' : 'text-[#14201c]'}`}>{value}</p>
    </div>
  )
}

function Chip({
  icon: Icon,
  text,
  tone,
  delay,
}: {
  icon: IconType
  text: string
  tone: 'ok' | 'warn'
  delay?: boolean
}) {
  const color = tone === 'warn' ? 'text-[#d97757]' : 'text-[#0b7a6e]'
  return (
    <p className={`landing-chip ${delay ? 'landing-d3' : ''} flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-2 text-xs font-medium text-[#14201c] shadow-[0_10px_30px_rgba(15,42,36,0.12)]`}>
      <Icon className={color} size={15} />
      {text}
    </p>
  )
}

function PreviewCard() {
  return (
    <div className="landing-float rounded-[1.35rem] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5c6b64]">Daily safe limit</p>
        <span className="rounded-full bg-[#e7f6f3] px-2.5 py-1 text-[11px] font-medium text-[#0b7a6e]">November</span>
      </div>
      <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight text-[#14201c]">
        ₹1,846<span className="ml-1 text-lg font-medium text-[#5c6b64]">/day</span>
      </p>
      <p className="mt-2 text-sm text-[#5c6b64]">Safe to spend today without crossing the plan.</p>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#e7efe9] pt-4">
        <Mini label="Salary" value="₹90,000" />
        <Mini label="Spent" value="₹21,690" />
        <Mini label="Left" value="₹68,310" />
      </div>

      <div className="mt-5 space-y-2.5">
        <Bar label="Month" width="17%" tone="bg-[#8aa89a]" delay="0.15s" />
        <Bar label="Plan" width="42%" tone="bg-[#d97757]" delay="0.3s" />
      </div>
      <p className="mt-3 text-xs font-medium text-[#d97757]">Ahead of the month</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5c6b64]">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function Bar({ label, width, tone, delay }: { label: string; width: string; tone: string; delay: string }) {
  return (
    <div className="grid grid-cols-[3.2rem_1fr] items-center gap-2 text-xs text-[#5c6b64]">
      <span>{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e7efe9]">
        <div className={`landing-bar h-full rounded-full ${tone}`} style={{ width, animationDelay: delay }} />
      </div>
    </div>
  )
}
