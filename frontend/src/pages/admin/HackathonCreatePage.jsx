import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHackathon } from '../../api/hackathons'

export default function HackathonCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', startTime: '', submissionDeadline: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { data } = await createHackathon(form)
      navigate('/hackathon')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Create Hackathon</h1>
        <p className="text-gray-500 text-sm mt-1">Launch a new hackathon for your team</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-7 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-dark"
            placeholder="Q2 2026 Internal Hackathon"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-dark resize-none"
            placeholder="Describe the theme, goals, and rules of this hackathon…"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="input-dark"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Submission Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={form.submissionDeadline}
              onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })}
              className="input-dark"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
            {saving ? 'Creating…' : 'Create Hackathon'}
          </button>
          <button type="button" onClick={() => navigate('/hackathon')} className="btn-ghost px-6 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
