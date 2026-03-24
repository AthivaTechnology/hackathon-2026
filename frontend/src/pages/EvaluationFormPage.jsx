import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSubmission } from '../api/submissions'
import { createEvaluation, updateEvaluation } from '../api/evaluations'
import useAuthStore from '../store/authStore'

const ScoreField = ({ label, name, value, onChange, desc }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <div>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {desc && <p className="text-xs text-gray-600 mt-0.5">{desc}</p>}
      </div>
      <span className="font-mono text-2xl font-black text-hack-cyan tabular-nums w-10 text-right">
        {value}
      </span>
    </div>
    <input
      type="range" min={1} max={10} value={value}
      onChange={(e) => onChange(name, parseInt(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #22d3ee ${(value - 1) / 9 * 100}%, #1e1e2e ${(value - 1) / 9 * 100}%)`
      }}
    />
    <div className="flex justify-between text-xs text-gray-700 font-mono mt-1">
      <span>1</span><span>10</span>
    </div>
  </div>
)

export default function EvaluationFormPage() {
  const { id: submissionId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [existingEval, setExistingEval] = useState(null)
  const [form, setForm] = useState({ innovationScore: 5, impactScore: 5, technicalScore: 5, feedback: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSubmission(submissionId).then(({ data }) => {
      setSubmission(data.submission)
      const mine = data.submission.evaluations?.find((e) => e.judgeId === user?.id)
      if (mine) {
        setExistingEval(mine)
        setForm({ innovationScore: mine.innovationScore ?? 5, impactScore: mine.impactScore ?? 5, technicalScore: mine.technicalScore ?? 5, feedback: mine.feedback || '' })
      }
    }).catch(() => setError('Failed to load')).finally(() => setLoading(false))
  }, [submissionId])

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (existingEval) await updateEvaluation(existingEval.id, form)
      else await createEvaluation(submissionId, form)
      navigate(`/submissions/${submissionId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="max-w-xl mx-auto px-4 py-10"><div className="card p-8 animate-pulse h-64" /></div>
  if (error) return <div className="max-w-xl mx-auto px-4 py-10 text-red-400">{error}</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          {existingEval ? 'Update Evaluation' : 'Evaluate Submission'}
        </h1>
        {submission && (
          <p className="text-gray-500 text-sm mt-1">
            <span className="text-gray-300">{submission.title}</span> by {submission.user?.name}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card p-7 space-y-7">
        <ScoreField label="Innovation" name="innovationScore" value={form.innovationScore} onChange={handleChange}
          desc="Originality and creative thinking" />
        <ScoreField label="Impact" name="impactScore" value={form.impactScore} onChange={handleChange}
          desc="Real-world value and usefulness" />
        <ScoreField label="Technical Complexity" name="technicalScore" value={form.technicalScore} onChange={handleChange}
          desc="Engineering depth and execution quality" />

        <div className="pt-2 border-t border-hack-border">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-mono font-bold text-hack-cyan">
              Total: {((form.innovationScore + form.impactScore + form.technicalScore) / 3).toFixed(1)}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Feedback <span className="text-gray-600 font-normal normal-case">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={form.feedback}
            onChange={(e) => handleChange('feedback', e.target.value)}
            className="input-dark resize-none"
            placeholder="Share your thoughts on this submission…"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
            {saving ? 'Saving…' : existingEval ? 'Update' : 'Submit Evaluation'}
          </button>
          <button type="button" onClick={() => navigate(`/submissions/${submissionId}`)} className="btn-ghost px-6 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
