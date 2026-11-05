import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { apiResetPassword } from '../api'
import AuthShell from '../components/layout/AuthShell'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAppSelector } from '../store'

/** Opened from reset email: /reset-password?token=... */
export default function ResetPassword() {
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(null)
    if (!token) {
      setError('Missing token in the link.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    setLoading(true)
    try {
      const res = await apiResetPassword({ token, new_password: password })
      setOk(res.message)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Set new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!token && <Alert tone="error" message="This link is missing a token. Request a new reset email." />}
        {error && <Alert tone="error" message={error} />}
        {ok && <Alert tone="info" message={ok} />}
        {token && !ok && (
          <>
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={4}
            />
            <Button type="submit" className="w-full py-3" loading={loading}>
              {loading ? 'Saving…' : 'Update password'}
            </Button>
          </>
        )}
        <p className="pt-1 text-center text-sm text-[#5c6b64]">
          <Link to="/login" className="font-medium text-[#0b7a6e] hover:text-[#086057]">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
