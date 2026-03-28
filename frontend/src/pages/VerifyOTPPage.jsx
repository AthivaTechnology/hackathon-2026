import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { verifyOtp, sendOtp } from '../api/auth'
import useAuthStore from '../store/authStore'

export default function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const setAuth = useAuthStore((s) => s.setAuth)

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  if (!email) {
    navigate('/login', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await verifyOtp(email, code)
      setAuth(data.user, data.accessToken)
      if (!data.user.name) {
        navigate('/setup-profile', { replace: true })
      } else {
        navigate('/hackathon', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await sendOtp(email)
      setResent(true)
      setCode('')
      setTimeout(() => setResent(false), 5000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black gradient-text mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm">
            We sent a 6-digit code to <span className="text-gray-300">{email}</span>
          </p>
        </div>

        <div className="card p-8">
          {resent && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-hack-green/10 text-hack-green text-sm border border-hack-green/20">
              New code sent — check your inbox.
            </div>
          )}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Login code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-dark text-center text-2xl tracking-widest font-bold"
                placeholder="000000"
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Verifying…' : 'Verify code'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-600">
            Didn't get it?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-hack-cyan hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          </div>

          <div className="mt-3 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              ← Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
