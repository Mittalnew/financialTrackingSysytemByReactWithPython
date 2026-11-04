import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiForgotPassword } from '../api'
import AuthShell from '../components/layout/AuthShell'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAppSelector } from '../store'

/** Ask for email → backend sends reset link (inbox or server console). */
export default function ForgotPassword() {
  const user = useAppSelector((s) => s.auth.user)

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(null)
    setLoading(true)
    try {
      const res = await apiForgotPassword({ email })
      setOk(res.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We’ll send a reset link to your email (or print it in the API console)."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error" message={error} />}
        {ok && <Alert tone="info" message={ok} />}
        {!ok && (
          <>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
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
