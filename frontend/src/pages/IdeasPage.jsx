import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentHackathon, listSubmissions } from '../api/hackathons'

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
          <Link
            key={s.id}
            to={`/submissions/${s.id}`}
            className="card card-hover p-5 flex items-start justify-between gap-4 block"
          >
            <div>
              <h3 className="font-semibold text-white mb-0.5">{s.title}</h3>
              <p className="text-sm text-gray-500">by {s.user.name ?? s.user.email}</p>
            </div>
            <div className="text-right text-xs font-mono text-gray-600 shrink-0">
              <div>{s._count?.comments ?? 0} comments</div>
              <div>{s._count?.evaluations ?? 0} evals</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
