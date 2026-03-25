import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSubmission } from '../api/submissions'
import CommentSection from '../components/CommentSection'
import ScoreDisplay from '../components/ScoreDisplay'
import useAuthStore from '../store/authStore'

export default function SubmissionDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSubmission(id)
      .then(({ data }) => setSubmission(data.submission))
      .catch(() => setError('Submission not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10"><div className="card p-8 animate-pulse h-48" /></div>
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10 text-red-400">{error}</div>

  const isCompleted = submission.hackathon?.status === 'COMPLETED'
  const canEvaluate =
    user?.role === 'JUDGE' &&
    submission.hackathon?.status === 'SUBMISSION_CLOSED' &&
    submission.userId !== user.id
  const myEvaluation = submission.evaluations?.find((e) => e.judgeId === user?.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/hackathon" className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-white transition-colors mb-6">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Submission */}
      <div className="card p-7 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 opacity-5 blur-3xl rounded-full"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl font-bold text-white">{submission.title}</h1>
            <div className="flex gap-2 shrink-0">
              {canEvaluate && !myEvaluation && (
                <Link to={`/submissions/${id}/evaluate`}
                  className="btn-primary px-4 py-1.5 text-xs">
                  Evaluate
                </Link>
              )}
              {canEvaluate && myEvaluation && (
                <Link to={`/submissions/${id}/evaluate`}
                  className="btn-ghost px-4 py-1.5 text-xs">
                  Edit Eval
                </Link>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 font-mono mb-4">
            by <span className="text-gray-300">{submission.user?.name}</span>
            {' · '}
            {new Date(submission.createdAt).toLocaleDateString()}
          </p>

          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-5">{submission.description}</p>

          {submission.projectLink && (
            <a href={submission.projectLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-hack-cyan hover:underline font-mono">
              View Project →
            </a>
          )}
        </div>
      </div>

      {/* Evaluations */}
      {submission.evaluations?.length > 0 && (
        <div className="card p-6 mb-5">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">
            Evaluations ({submission.evaluations.length})
          </h2>
          <div className="space-y-4">
            {submission.evaluations.map((e) => (
              <div key={e.id} className="border border-hack-border rounded-lg p-4 bg-hack-bg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">{e.judge?.name}</span>
                  <span className="text-xs font-mono text-gray-600">
                    {new Date(e.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <ScoreDisplay evaluation={e} isCompleted={isCompleted} />
                {isCompleted && e.feedback && (
                  <p className="mt-3 text-sm text-gray-500 italic border-t border-hack-border pt-3">
                    "{e.feedback}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="card p-6">
        <CommentSection submissionId={id} comments={submission.comments || []} />
      </div>
    </div>
  )
}
