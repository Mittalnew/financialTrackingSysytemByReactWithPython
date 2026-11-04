import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AuthShell from '../components/layout/AuthShell'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { clearAuthError, clearSignupMessage, signupUser } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store'

export default function Signup() {
  const user = useAppSelector((s) => s.auth.user)
  const authError = useAppSelector((s) => s.auth.error)
  const signupMessage = useAppSelector((s) => s.auth.signupMessage)
  const status = useAppSelector((s) => s.auth.status)
  const dispatch = useAppDispatch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch(clearAuthError())
    dispatch(clearSignupMessage())
    await dispatch(signupUser({ name, email, password }))
  }

  return (
    <AuthShell title="Create account" subtitle="Start tracking salary, spend, and what’s left.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {authError && <Alert tone="error" message={authError} />}
        {signupMessage && (
          <Alert
            tone="info"
            message={`${signupMessage} Then come back and sign in.`}
          />
        )}
        {!signupMessage && (
          <>
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
          </>
        )}
        <p className="pt-1 text-center text-sm text-[#5c6b64]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#0b7a6e] hover:text-[#086057]">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
