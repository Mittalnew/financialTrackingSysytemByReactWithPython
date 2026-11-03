type Props = {
  label: string
  value: string
  tone?: 'default' | 'income' | 'expense'
}

export default function KpiCard({ label, value, tone = 'default' }: Props) {
  let valueColor = 'text-[#14201c]'
  if (tone === 'income') valueColor = 'text-[#0b7a6e]'
  if (tone === 'expense') valueColor = 'text-[#d97757]'

  return (
    <div className="rounded-2xl border border-[#d5e4da] bg-white p-4 shadow-panel">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#5c6b64]">{label}</p>
      <p className={`mt-1.5 text-xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  )
}
