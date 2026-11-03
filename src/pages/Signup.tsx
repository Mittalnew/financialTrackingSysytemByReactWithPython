import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { clearAuthError, signupUser } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store'

export default function Signup() {
  const user = useAppSelector((s) => s.auth.user)
  const authError = useAppSelector((s) => s.auth.error)
  const status = useAppSelector((s) => s.auth.status)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch(clearAuthError())
    const result = await dispatch(signupUser({ name, email, password }))
    if (signupUser.fulfilled.match(result)) navigate('/')
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
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Create account</h1>
          <p className="mt-2 text-sm text-ink-muted">Track salary, spend, and what’s left.</p>
        </div>

        <div className="space-y-4">
          {authError && <Alert tone="error" message={authError} />}
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
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
            minLength={4}
          />
          <Button type="submit" className="w-full py-3" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating…' : 'Sign up'}
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:text-brand-dark">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
