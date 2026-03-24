import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentHackathon, listSubmissions, createSubmission } from '../api/hackathons'
import { updateSubmission } from '../api/submissions'
import useAuthStore from '../store/authStore'

export default function SubmissionFormPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', projectLink: '' })
  const [existingId, setExistingId] = useState(null)
  const [hackathon, setHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getCurrentHackathon()
        setHackathon(data.hackathon)
        const sRes = await listSubmissions(data.hackathon.id)
        const mine = sRes.data.submissions.find((s) => s.userId === user?.id)
        if (mine) {
          setExistingId(mine.id)
          setForm({ title: mine.title, description: mine.description, projectLink: mine.projectLink || '' })
        }
      } catch {
        setError('Failed to load')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (existingId) {
        await updateSubmission(existingId, form)
      } else {
        await createSubmission(hackathon.id, form)
      }
      navigate('/hackathon')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10"><div className="card p-8 animate-pulse h-64" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          {existingId ? 'Edit Submission' : 'Post Your Idea'}
        </h1>
        {hackathon && (
          <p className="text-gray-500 text-sm mt-1">
            for <span className="text-gray-300">{hackathon.title}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-7 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-dark"
            placeholder="e.g. AI-powered onboarding assistant"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-dark resize-none"
            placeholder="Describe your project, the problem it solves, and how it works…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Project Link <span className="text-gray-600 font-normal normal-case">(optional)</span>
          </label>
          <input
            type="url"
            value={form.projectLink}
            onChange={(e) => setForm({ ...form, projectLink: e.target.value })}
            className="input-dark"
            placeholder="https://github.com/you/project"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
            {saving ? 'Saving…' : existingId ? 'Save Changes' : 'Post Idea'}
          </button>
          <button type="button" onClick={() => navigate('/hackathon')} className="btn-ghost px-6 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
