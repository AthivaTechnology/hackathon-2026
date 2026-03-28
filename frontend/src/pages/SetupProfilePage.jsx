import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../api/auth'
import useAuthStore from '../store/authStore'

export default function SetupProfilePage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await updateProfile(name.trim())
      setUser(data.user)
      navigate('/hackathon', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save name. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black gradient-text mb-2">One last thing</h1>
          <p className="text-gray-500 text-sm">Tell us your name to finish setting up your account</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Your name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark"
                placeholder="Ada Lovelace"
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading || !name.trim()} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Saving…' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
