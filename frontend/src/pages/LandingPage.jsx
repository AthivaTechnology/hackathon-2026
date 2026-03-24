import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFeatured } from '../api/hackathons'
import useAuthStore from '../store/authStore'

const STATUS_CONFIG = {
  PENDING: { label: 'Upcoming', color: 'text-hack-amber border-hack-amber/30 bg-hack-amber/10' },
  ACTIVE: { label: 'Live Now', color: 'text-hack-green border-hack-green/30 bg-hack-green/10' },
  SUBMISSION_CLOSED: { label: 'Evaluating', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' },
  COMPLETED: { label: 'Completed', color: 'text-gray-400 border-gray-600 bg-gray-800/50' },
}

const steps = [
  { n: '01', title: 'Post Your Idea', desc: 'Share your project idea as soon as the hackathon is announced. No waiting for the start gun.' },
  { n: '02', title: 'Build & Submit', desc: 'Develop your project during the active window. Judges evaluate on innovation, impact, and technical depth.' },
  { n: '03', title: 'Win & Celebrate', desc: 'Results are announced by the admin. Scores become visible and the leaderboard goes live.' },
]

export default function LandingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [hackathon, setHackathon] = useState(null)

  useEffect(() => {
    if (user) { navigate('/hackathon'); return }
    getFeatured().then(({ data }) => setHackathon(data.hackathon)).catch(() => {})
  }, [user])

  if (user) return null

  const status = hackathon ? STATUS_CONFIG[hackathon.status] : null

  return (
    <div className="min-h-screen" style={{ background: '#0d0d14' }}>

      {/* Hero */}
      <section className="relative grid-bg overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />

        <div className="relative max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-hack-cyan border border-hack-cyan/20 bg-hack-cyan/5 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-hack-cyan animate-pulse inline-block" />
            Internal Hackathon Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
            <span className="gradient-text">Build.</span>{' '}
            <span className="gradient-text">Ship.</span>{' '}
            <span className="gradient-text">Win.</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            The internal hackathon platform where ideas become reality. Post your project, get evaluated by judges, and climb the leaderboard.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">
              Join the Hackathon
            </Link>
            <Link to="/login" className="btn-ghost px-8 py-3 text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Hackathon */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">
          Featured Hackathon
        </h2>

        {hackathon ? (
          <div className="card p-8 relative overflow-hidden card-hover">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5 blur-2xl rounded-full"
              style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border font-mono ${status?.color}`}>
                    {status?.label}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{hackathon.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-6">
                  {hackathon.description}
                </p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Deadline</p>
                    <p className="text-white font-mono">{new Date(hackathon.submissionDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Submissions</p>
                    <p className="text-white font-mono">{hackathon._count?.submissions ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link to="/register" className="btn-primary px-6 py-2.5 inline-block text-center whitespace-nowrap">
                  Participate →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <p className="text-gray-400">No active hackathon right now.</p>
            <p className="text-gray-600 text-sm mt-1">Stay tuned — the next one is coming soon.</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-8">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="card p-6 card-hover">
              <div className="font-mono text-4xl font-black gradient-text mb-4">{s.n}</div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
