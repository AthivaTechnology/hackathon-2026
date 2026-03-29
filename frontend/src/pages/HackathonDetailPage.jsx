import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentHackathon, listSubmissions, announceResults, getLeaderboard } from '../api/hackathons'
import CountdownTimer from '../components/CountdownTimer'
import useAuthStore from '../store/authStore'
import { HACKATHON } from '../constants/hackathon'

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
      setError('Could not load hackathon data')
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
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <div className="card p-8 animate-pulse h-48" />
      <div className="card p-8 animate-pulse h-32" />
    </div>
  )
  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="card p-12 text-center">
        <p className="text-3xl mb-3">🚀</p>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  )

  const cfg = STATUS_CONFIG[hackathon.status]
  const mySubmission = submissions.find((s) => s.userId === user?.id)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

      {/* Header */}
      <div className="card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 opacity-5 blur-3xl rounded-full"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-black text-white">{HACKATHON.title}</h1>
            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-mono font-medium border ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-gray-400 mb-6 leading-relaxed">{HACKATHON.tagline}</p>

          <div className="flex flex-wrap gap-8 items-end">
            {hackathon.status === 'PENDING' && (
              <CountdownTimer targetDate={HACKATHON.startISO} label="Starts in" expiredLabel="Starting soon…" />
            )}
            {hackathon.status === 'ACTIVE' && (
              <CountdownTimer targetDate={HACKATHON.deadlineISO} label="Deadline in" expiredLabel="Submissions closed" />
            )}

            <div className="flex flex-wrap gap-6 text-sm ml-auto">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Start</p>
                <p className="text-gray-300 font-mono text-xs">{HACKATHON.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Deadline</p>
                <p className="text-gray-300 font-mono text-xs">{HACKATHON.deadline}</p>
              </div>
            </div>
          </div>

          {user?.role === 'PARTICIPANT' && (
            hackathon.status === 'ACTIVE' || hackathon.status === 'PENDING'
          ) && (
            <div className="mt-6 pt-6 border-t border-hack-border flex items-center justify-between gap-4">
              {!mySubmission ? (
                <>
                  <div>
                    <p className="text-sm font-semibold text-white">Ready to compete?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Share your idea before the deadline.</p>
                  </div>
                  <Link to="/hackathon/submit" className="btn-primary px-6 py-2.5 flex items-center gap-2 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Your Idea
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-hack-green/15 border border-hack-green/30">
                      <svg className="w-3.5 h-3.5 text-hack-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">You're in!</p>
                      <p className="text-xs text-gray-500 mt-0.5">"{mySubmission.title}" is submitted.</p>
                    </div>
                  </div>
                  <Link to="/hackathon/submit" className="btn-ghost px-5 py-2 flex items-center gap-2 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Edit your submission
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ideas link */}
      <Link
        to="/hackathon/ideas"
        className="card card-hover p-5 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-white">View all participants' ideas</p>
            <p className="text-xs text-gray-500 mt-0.5">{submissions.length} submitted so far</p>
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Prizes */}
      <div className="grid grid-cols-3 gap-4">
        {HACKATHON.prizes.map((p) => (
          <div key={p.place} className="card p-5 text-center card-hover">
            <div className="text-3xl mb-2">{p.icon}</div>
            <p className="text-xl font-black gradient-text mb-0.5">{p.amount}</p>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{p.place} Place</p>
          </div>
        ))}
      </div>

      {/* Theme, Goals & Rules */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Theme */}
        <div className="card p-6">
          <h2 className="text-xs font-mono text-hack-cyan uppercase tracking-widest mb-3">Theme</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{HACKATHON.theme}</p>
        </div>

        {/* Goals */}
        <div className="card p-6">
          <h2 className="text-xs font-mono text-hack-violet uppercase tracking-widest mb-3">Goals</h2>
          <ul className="space-y-2">
            {HACKATHON.goals.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-400">
                <span className="text-hack-violet mt-0.5 shrink-0">›</span>
                {g}
              </li>
            ))}
          </ul>
        </div>

        {/* Rules */}
        <div className="card p-6">
          <h2 className="text-xs font-mono text-hack-amber uppercase tracking-widest mb-3">Rules</h2>
          <ul className="space-y-2">
            {HACKATHON.rules.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-400">
                <span className="text-hack-amber mt-0.5 shrink-0">›</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Admin action */}
      {user?.role === 'ADMIN' && hackathon.status === 'SUBMISSION_CLOSED' && (
        <div className="flex">
          <button onClick={handleAnnounce} disabled={announcing} className="btn-primary px-5 py-2">
            {announcing ? 'Announcing…' : '🏆 Announce Results'}
          </button>
        </div>
      )}

      {/* Leaderboard */}
      {hackathon.status === 'COMPLETED' && leaderboard.length > 0 && (
        <div>
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

    </div>
  )
}
