import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFeatured } from '../api/hackathons'
import useAuthStore from '../store/authStore'
import { HACKATHON } from '../constants/hackathon'

const STATUS_CONFIG = {
  PENDING: { label: 'Upcoming', color: 'text-hack-amber border-hack-amber/30 bg-hack-amber/10' },
  ACTIVE: { label: 'Registrations Open', color: 'text-hack-green border-hack-green/30 bg-hack-green/10' },
  SUBMISSION_CLOSED: { label: 'Submissions Closed', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' },
  COMPLETED: { label: 'Completed', color: 'text-gray-400 border-gray-600 bg-gray-800/50' },
}

const steps = [
  { n: '01', title: 'Register', desc: 'Create your account using your company email and join as a participant.' },
  { n: '02', title: 'Post Your Idea', desc: 'Submit your project idea. Describe the problem you want to solve and how you plan to tackle it.' },
  { n: '03', title: 'Get Evaluated', desc: 'A panel of internal judges scores every submission on innovation, impact, and technical depth.' },
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
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />

        <div className="relative max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
            <span className="gradient-text">Build.</span>{' '}
            <span className="gradient-text">Ship.</span>{' '}
            <span className="gradient-text">Win.</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Two days. One idea. Build an AI agent that thinks, acts, and wins. Athiva's first internal hackathon — April 3 & 4, 2026.
          </p>
        </div>
      </section>

      {/* Event details */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">
          The Event
        </h2>

        {hackathon ? (
          <div className="card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5 blur-2xl rounded-full"
              style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />

            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border font-mono ${status?.color}`}>
                  {status?.label}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{HACKATHON.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-6">
                {HACKATHON.tagline}
              </p>
              <div className="flex flex-wrap gap-8 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Starts</p>
                  <p className="text-white font-mono">{HACKATHON.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Submission Deadline</p>
                  <p className="text-white font-mono">{HACKATHON.deadline}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">Ideas Submitted</p>
                  <p className="text-white font-mono">{hackathon._count?.submissions ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-white mb-2">{HACKATHON.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{HACKATHON.tagline}</p>
            <p className="text-xs text-gray-600 font-mono">Event details loading…</p>
          </div>
        )}
      </section>

      {/* Prizes */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Prizes</h2>
        <div className="grid grid-cols-3 gap-4">
          {HACKATHON.prizes.map((p) => (
            <div key={p.place} className="card p-6 text-center card-hover">
              <div className="text-4xl mb-3">{p.icon}</div>
              <p className="text-2xl font-black gradient-text mb-1">{p.amount}</p>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{p.place} Place</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-8">
          How to participate
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
