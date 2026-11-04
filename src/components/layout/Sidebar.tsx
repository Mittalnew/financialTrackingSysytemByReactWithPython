import { NavLink, useNavigate } from 'react-router-dom'
import { LuLayoutDashboard } from 'react-icons/lu'
import { HiOutlineArrowsRightLeft } from 'react-icons/hi2'
import { IoAnalyticsOutline, IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5'
import { useAppDispatch, useAppSelector } from '../../store'
import { logoutUser } from '../../store/authSlice'
import { clearBudgets } from '../../store/budgetsSlice'
import { clearTransactions } from '../../store/transactionsSlice'
import { initials } from '../../utils/format'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LuLayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: HiOutlineArrowsRightLeft },
  { to: '/analytics', label: 'Analytics', icon: IoAnalyticsOutline },
  { to: '/settings', label: 'Settings', icon: IoSettingsOutline },
]

type Props = {
  /** Mobile drawer: close menu after a link click. */
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: Props) {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  async function handleLogout() {
    onNavigate?.()
    dispatch(clearTransactions())
    dispatch(clearBudgets())
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[#d5e4da] bg-[#fbfdfb] px-3 py-5">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b7a6e] text-sm font-bold text-white">
          F
        </span>
        <div>
          <p className="text-base font-semibold text-[#14201c]">Fintrack</p>
          <p className="text-[11px] text-[#5c6b64]">Salary → spend → left</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => linkClass(isActive)}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-[#d5e4da] bg-white px-2.5 py-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0b7a6e] text-[11px] font-semibold text-white">
            {user ? initials(user.name) : 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#14201c]">{user?.name}</p>
            <p className="truncate text-[11px] text-[#5c6b64]">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#3d4f47] hover:bg-[#e7efe9] hover:text-[#14201c]"
        >
          <IoLogOutOutline size={17} />
          Log out
        </button>
      </div>
    </aside>
  )
}

function linkClass(isActive: boolean) {
  if (isActive) {
    return 'flex items-center gap-2.5 rounded-lg bg-[#0b7a6e] px-3 py-2 text-sm font-medium text-white'
  }
  return 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#3d4f47] hover:bg-[#e7efe9] hover:text-[#14201c]'
}
