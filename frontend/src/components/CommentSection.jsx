import { useState } from 'react'
import { createComment } from '../api/comments'

export default function CommentSection({ submissionId, comments: initial }) {
  const [comments, setComments] = useState(initial || [])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const { data } = await createComment(submissionId, content.trim())
      setComments((prev) => [...prev, data.comment])
      setContent('')
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div>
      <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">
        Comments ({comments.length})
      </h3>

      <div className="space-y-3 mb-4">
        {comments.length === 0 && (
          <p className="text-sm text-gray-600 italic">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-hack-bg border border-hack-border rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-gray-300">{c.user.name}</span>
              <span className="text-xs text-gray-600 font-mono">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-400">{c.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment…"
          className="input-dark flex-1"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-primary px-4 py-2 shrink-0"
        >
          Post
        </button>
      </form>
    </div>
  )
}
