import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { apiResendVerification } from '../api'
import AuthShell from '../components/layout/AuthShell'
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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resendMsg, setResendMsg] = useState<string | null>(null)
  const [resendBusy, setResendBusy] = useState(false)

  const needsVerify = Boolean(authError?.toLowerCase().includes('verify'))

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResendMsg(null)
    dispatch(clearAuthError())
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) navigate('/')
  }

  async function handleResendVerify() {
    if (!email.trim()) {
      setResendMsg('Enter your email above first.')
      return
    }
    setResendBusy(true)
    setResendMsg(null)
    try {
      const res = await apiResendVerification(email.trim())
      setResendMsg(res.message)
    } catch (err) {
      setResendMsg(err instanceof Error ? err.message : 'Could not resend')
    } finally {
      setResendBusy(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to see what’s left after salary and spend.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {authError && <Alert tone="error" message={authError} />}
        {resendMsg && <Alert tone="info" message={resendMsg} />}
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
        <Button type="submit" className="w-full py-3" loading={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </Button>

        {needsVerify && (
          <Button
            type="button"
            variant="secondary"
            className="w-full py-3"
            loading={resendBusy}
            onClick={handleResendVerify}
          >
            {resendBusy ? 'Sending…' : 'Resend verification email'}
          </Button>
        )}

        <p className="pt-1 text-center text-sm text-[#5c6b64]">
          <Link to="/forgot-password" className="font-medium text-[#0b7a6e] hover:text-[#086057]">
            Forgot password?
          </Link>
        </p>
        <p className="text-center text-sm text-[#5c6b64]">
          New here?{' '}
          <Link to="/signup" className="font-medium text-[#0b7a6e] hover:text-[#086057]">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
