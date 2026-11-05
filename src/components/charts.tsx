/**
 * Thin Recharts wrappers. Pages pass ready-made data arrays — no calc here.
 */
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatChartValue } from '../utils/format'

const COLORS = ['#0b7a6e', '#3d9b8f', '#d97757', '#5c6b64', '#8fb9b0']

type MonthRow = { month: string; income: number; expense: number }
type CategoryRow = { name: string; value: number }
type DayRow = { name: string; amount: number }

export function TrendChart({ data, className = 'h-56' }: { data: MonthRow[]; className?: string }) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20,32,28,0.08)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#5c6b64', fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#5c6b64', fontSize: 12 }}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip formatter={formatChartValue} />
          <Area type="monotone" dataKey="income" stroke="#0b7a6e" fill="#d8f3ee" strokeWidth={2} />
          <Area type="monotone" dataKey="expense" stroke="#d97757" fill="#f8e6df" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryDonut({ data }: { data: CategoryRow[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={formatChartValue} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function IncomeExpenseBars({ data }: { data: MonthRow[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20,32,28,0.08)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#5c6b64', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5c6b64', fontSize: 12 }} />
          <Tooltip formatter={formatChartValue} />
          <Bar dataKey="income" fill="#0b7a6e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#d97757" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryBarChart({ data }: { data: CategoryRow[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={80}
            tick={{ fill: '#5c6b64', fontSize: 12 }}
          />
          <Tooltip formatter={formatChartValue} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DailySpendChart({ data }: { data: DayRow[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#5c6b64', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5c6b64', fontSize: 12 }} />
          <Tooltip formatter={formatChartValue} />
          <Line type="monotone" dataKey="amount" stroke="#0b7a6e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
