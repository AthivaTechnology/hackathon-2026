import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentHackathon, listSubmissions, announceResults, getLeaderboard } from '../api/hackathons'
import CountdownTimer from '../components/CountdownTimer'
import useAuthStore from '../store/authStore'

const STATUS_CONFIG = {
  PENDING: { label: 'Upcoming', color: 'text-hack-amber border-hack-amber/30 bg-hack-amber/10' },
  ACTIVE: { label: 'Live', color: 'text-hack-green border-hack-green/30 bg-hack-green/10' },
  SUBMISSION_CLOSED: { label: 'Evaluating', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' },
  COMPLETED: { label: 'Completed', color: 'text-gray-500 border-gray-700 bg-gray-800/50' },
}

export default function HackathonDetailPage() {
  const { user } = useAuthStore()
  const [hackathon, setHackathon] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [announcing, setAnnouncing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const { data } = await getCurrentHackathon()
      setHackathon(data.hackathon)
      const sRes = await listSubmissions(data.hackathon.id)
      setSubmissions(sRes.data.submissions)
      if (data.hackathon.status === 'COMPLETED') {
        const lRes = await getLeaderboard(data.hackathon.id)
        setLeaderboard(lRes.data.leaderboard)
      }
    } catch {
      setError('No hackathon found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAnnounce = async () => {
    if (!confirm('Announce results? Scores will become visible to everyone.')) return
    setAnnouncing(true)
    try {
      await announceResults(hackathon.id)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to announce')
    } finally {
      setAnnouncing(false)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="card p-8 animate-pulse h-48" />
    </div>
  )
  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="card p-12 text-center">
        <p className="text-3xl mb-3">🚀</p>
        <p className="text-gray-400">{error}</p>
        {user?.role === 'ADMIN' && (
          <Link to="/admin/hackathon/new" className="btn-primary px-6 py-2.5 inline-block mt-6">
            Create Hackathon
          </Link>
        )}
      </div>
    </div>
  )

  const cfg = STATUS_CONFIG[hackathon.status]
  const mySubmission = submissions.find((s) => s.userId === user?.id)
  const filtered = submissions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.user.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header card */}
      <div className="card p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 opacity-5 blur-3xl rounded-full"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-black text-white">{hackathon.title}</h1>
            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-mono font-medium border ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-gray-400 mb-6 leading-relaxed">{hackathon.description}</p>

          <div className="flex flex-wrap gap-8 items-end">
            {hackathon.status === 'PENDING' && (
              <CountdownTimer targetDate={hackathon.startTime} label="Starts in" expiredLabel="Starting soon…" />
            )}
            {hackathon.status === 'ACTIVE' && (
              <CountdownTimer targetDate={hackathon.submissionDeadline} label="Deadline in" expiredLabel="Submissions closed" />
            )}

            <div className="flex flex-wrap gap-6 text-sm ml-auto">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Start</p>
                <p className="text-gray-300 font-mono text-xs">{new Date(hackathon.startTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Deadline</p>
                <p className="text-gray-300 font-mono text-xs">{new Date(hackathon.submissionDeadline).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Created by</p>
                <p className="text-gray-300 text-xs">{hackathon.createdBy?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        {user?.role === 'PARTICIPANT' &&
          hackathon.status !== 'SUBMISSION_CLOSED' && hackathon.status !== 'COMPLETED' &&
          !mySubmission && (
            <Link to="/hackathon/submit" className="btn-primary px-5 py-2">
              Post Your Idea
            </Link>
          )}
        {user?.role === 'PARTICIPANT' && mySubmission &&
          hackathon.status !== 'SUBMISSION_CLOSED' && hackathon.status !== 'COMPLETED' && (
            <Link to="/hackathon/submit" className="btn-ghost px-5 py-2">
              Edit My Submission
            </Link>
          )}
        {user?.role === 'ADMIN' && hackathon.status === 'SUBMISSION_CLOSED' && (
          <button onClick={handleAnnounce} disabled={announcing}
            className="btn-primary px-5 py-2">
            {announcing ? 'Announcing…' : '🏆 Announce Results'}
          </button>
        )}
      </div>

      {/* Leaderboard */}
      {hackathon.status === 'COMPLETED' && leaderboard.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Leaderboard</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-hack-border">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-mono text-gray-500">#</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-gray-500">Project</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-gray-500">By</th>
                  <th className="px-5 py-3 text-right text-xs font-mono text-gray-500">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, idx) => (
                  <tr key={item.id} className="border-b border-hack-border/50 last:border-0 hover:bg-hack-border/20 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`font-mono font-bold text-sm ${idx === 0 ? 'text-hack-amber' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/submissions/${item.id}`} className="text-hack-cyan hover:underline font-medium">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{item.submittedBy.name}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-white">
                      {item.averageScore > 0 ? item.averageScore : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submissions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Submissions ({submissions.length})
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="input-dark max-w-xs py-1.5 text-xs"
          />
        </div>

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-3xl mb-2">💡</p>
            <p className="text-gray-500 text-sm">No submissions yet. Be the first!</p>
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
                <p className="text-sm text-gray-500">by {s.user.name}</p>
              </div>
              <div className="text-right text-xs font-mono text-gray-600 shrink-0">
                <div>{s._count?.comments ?? 0} comments</div>
                <div>{s._count?.evaluations ?? 0} evals</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
