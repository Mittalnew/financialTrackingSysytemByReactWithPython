import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiVerifyEmail } from '../api'
import AuthShell from '../components/layout/AuthShell'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

/** Opened from email/console link: /verify-email?token=... */
export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!token) {
        setError('Missing token in the link.')
        setLoading(false)
        return
      }
      try {
        const res = await apiVerifyEmail(token)
        if (!cancelled) setOk(res.message)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Verify failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <AuthShell title="Verify email" subtitle="Confirming your account…">
      <div className="space-y-4">
        {loading && <Alert tone="info" message="Verifying…" />}
        {error && <Alert tone="error" message={error} />}
        {ok && <Alert tone="info" message={ok} />}
        {!loading && (
          <Link to="/login">
            <Button type="button" className="w-full py-3">
              Go to sign in
            </Button>
          </Link>
        )}
      </div>
    </AuthShell>
  )
}
