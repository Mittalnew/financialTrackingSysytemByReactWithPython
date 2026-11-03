import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { clearAuthError, loginUser } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store'

export default function Login() {
  const user = useAppSelector((s) => s.auth.user)
  const authError = useAppSelector((s) => s.auth.error)
  const status = useAppSelector((s) => s.auth.status)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [email, setEmail] = useState('demo@fintrack.in')
  const [password, setPassword] = useState('demo123')

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch(clearAuthError())
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) navigate('/')
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="animate-rise w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-10 shadow-panel backdrop-blur-md"
      >
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-lg font-bold text-white">
              F
            </span>
            <span className="text-2xl font-semibold tracking-tight text-brand">Fintrack</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-muted">See what’s left after salary and spend.</p>
        </div>

        <div className="space-y-4">
          <Alert
            tone="info"
            message="API must be running (port 8001). Demo: demo@fintrack.in / demo123"
          />
          {authError && <Alert tone="error" message={authError} />}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full py-3" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-ink-muted">
          <Link to="/signup" className="font-medium text-brand hover:text-brand-dark">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  )
}
