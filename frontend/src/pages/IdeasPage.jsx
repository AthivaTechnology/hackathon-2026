import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentHackathon, listSubmissions, toggleLike } from '../api/hackathons'

function IdeaCard({ submission: s, onLikeToggle }) {
  const [liking, setLiking] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (liking) return
    setLiking(true)
    try {
      const { data } = await toggleLike(s.id)
      onLikeToggle(data)
    } catch {}
    finally { setLiking(false) }
  }

  return (
    <Link
      to={`/submissions/${s.id}`}
      className="card card-hover p-5 flex items-center justify-between gap-4 block"
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-white mb-0.5 truncate">{s.title}</h3>
        <p className="text-sm text-gray-500">by {s.user.name ?? s.user.email}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            s.likedByMe
              ? 'text-hack-violet border-hack-violet/40 bg-hack-violet/10 hover:bg-hack-violet/20'
              : 'text-gray-500 border-gray-700 bg-transparent hover:text-hack-violet hover:border-hack-violet/40 hover:bg-hack-violet/10'
          }`}
        >
          <svg className="w-4 h-4" fill={s.likedByMe ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.960a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
          </svg>
          <span>{s.likeCount ?? 0}</span>
        </button>
        <div className="text-right text-xs font-mono text-gray-600">
          <div>{s._count?.comments ?? 0} comments</div>
          <div>{s._count?.evaluations ?? 0} evals</div>
        </div>
      </div>
    </Link>
  )
}

export default function IdeasPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getCurrentHackathon()
        const sRes = await listSubmissions(data.hackathon.id)
        setSubmissions(sRes.data.submissions)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = submissions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.user.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/hackathon" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1 mb-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to event
          </Link>
          <h1 className="text-2xl font-black text-white">
            Ideas{' '}
            <span className="text-gray-600 font-mono text-lg">({submissions.length})</span>
          </h1>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ideas…"
          className="input-dark max-w-xs py-1.5 text-sm"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-20" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-16 text-center">
          <p className="text-3xl mb-2">💡</p>
          <p className="text-gray-500 text-sm">
            {submissions.length === 0 ? 'No ideas submitted yet. Be the first!' : 'No results match your search.'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((s) => (
          <IdeaCard key={s.id} submission={s} onLikeToggle={(updated) =>
            setSubmissions((prev) => prev.map((x) => x.id === s.id ? { ...x, ...updated } : x))
          } />
        ))}
      </div>
    </div>
  )
}
