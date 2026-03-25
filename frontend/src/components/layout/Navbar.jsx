import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../api/auth'
import useAuthStore from '../../store/authStore'

const ROLE_STYLES = {
  ADMIN: 'text-violet-400 bg-violet-400/10',
  JUDGE: 'text-cyan-400 bg-cyan-400/10',
  PARTICIPANT: 'text-green-400 bg-green-400/10',
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-colors ${open ? 'border-violet-500/40 bg-violet-500/5' : 'border-hack-border bg-hack-surface hover:border-gray-600'}`}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
          <p className={`text-xs font-medium leading-tight ${ROLE_STYLES[user.role]}`}>{user.role}</p>
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 card py-1 z-50" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-hack-border">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Admin links */}
          {user.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/users"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-hack-border/40 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Manage Users
              </Link>
              <div className="border-t border-hack-border my-1" />
            </>
          )}

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); onLogout() }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate('/')
  }

  return (
    <nav className="bg-hack-surface/80 backdrop-blur-sm sticky top-0 z-50" style={{ boxShadow: 'inset 0 -1px 0 0 rgba(139,92,246,0.25), 0 4px 24px rgba(0,0,0,0.4)' }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to={user ? '/hackathon' : '/'}
          className="font-bold text-lg tracking-tight gradient-text"
        >
          Athiva Hackathon'26
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-1.5">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
