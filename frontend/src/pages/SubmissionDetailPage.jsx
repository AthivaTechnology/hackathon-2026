import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSubmission } from '../api/submissions'
import { toggleLike } from '../api/hackathons'
import CommentSection from '../components/CommentSection'
import ScoreDisplay from '../components/ScoreDisplay'
import useAuthStore from '../store/authStore'

export default function SubmissionDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liking, setLiking] = useState(false)

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

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      const { data } = await toggleLike(id)
      setSubmission((prev) => ({ ...prev, ...data }))
    } catch {}
    finally { setLiking(false) }
  }

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
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  submission.likedByMe
                    ? 'text-hack-violet border-hack-violet/40 bg-hack-violet/10 hover:bg-hack-violet/20'
                    : 'text-gray-500 border-gray-700 hover:text-hack-violet hover:border-hack-violet/40 hover:bg-hack-violet/10'
                }`}
              >
                <svg className="w-4 h-4" fill={submission.likedByMe ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.960a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                </svg>
                <span>{submission.likeCount ?? 0} Likes</span>
              </button>
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

          <div className="flex flex-wrap gap-4">
            {submission.projectLink && (
              <a href={submission.projectLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-hack-cyan hover:underline font-mono">
                View Project →
              </a>
            )}
            {submission.demoLink && (
              <a href={submission.demoLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-hack-violet hover:underline font-mono">
                Watch Demo →
              </a>
            )}
          </div>
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
