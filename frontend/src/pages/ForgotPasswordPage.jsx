import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black gradient-text mb-2">Forgot password?</h1>
          <p className="text-gray-500 text-sm">Enter your Athiva email and we'll send you a reset link</p>
        </div>

        <div className="card p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-hack-green/10 border border-hack-green/20 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-hack-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-medium">Reset link generated</p>
              <p className="text-sm text-gray-500">
                If <span className="text-gray-300">{email}</span> is registered, a password reset link has been sent to your email.
                Check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="block text-sm text-hack-cyan hover:underline mt-4">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark"
                    placeholder="you@athivatech.com"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-600">
                <Link to="/login" className="text-hack-cyan hover:underline">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
