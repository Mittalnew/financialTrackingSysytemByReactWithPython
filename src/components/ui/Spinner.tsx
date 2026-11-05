import { HiOutlineArrowPath } from 'react-icons/hi2'
import { useAppSelector } from '../../store'

type Props = { size?: number; className?: string }

export function Spinner({ size = 16, className = '' }: Props) {
  return <HiOutlineArrowPath className={`animate-spin ${className}`} size={size} />
}

export default Spinner

/** True after the first transactions + budgets response (success or fail). */
export function useDataReady() {
  const txReady = useAppSelector((s) => s.transactions.ready)
  const budgetReady = useAppSelector((s) => s.budgets.ready)
  return txReady && budgetReady
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-[#0b7a6e]">
      <Spinner size={28} />
    </div>
  )
}
