import { useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { HiOutlineBars3 } from 'react-icons/hi2'
import LoadUserData from './components/LoadUserData'
import Sidebar from './components/layout/Sidebar'
import { ToastProvider } from './context/ToastContext'
import Analytics from './pages/Analytics'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'
import Signup from './pages/Signup'
import Transactions from './pages/Transactions'
import VerifyEmail from './pages/VerifyEmail'
import { useAppSelector } from './store'

/** Redirect to login if there is no saved user. */
function ProtectedRoute() {
  const user = useAppSelector((s) => s.auth.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Shell: sidebar (drawer on mobile) + main content. */
function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile dim overlay */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-[#14201c]/35 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar: drawer on small screens, always visible on lg+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={closeMenu} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-[#d5e4da] bg-[#fbfdfb] px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-[#14201c] hover:bg-[#e7efe9]"
            onClick={() => setMenuOpen(true)}
          >
            <HiOutlineBars3 size={22} />
          </button>
          <span className="text-sm font-semibold text-[#14201c]">Fintrack</span>
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto p-5 lg:p-7">
          <LoadUserData />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
