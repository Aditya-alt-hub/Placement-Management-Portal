import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const studentLinks = [
    { to: '/student/dashboard', label: 'Overview' },
    { to: '/student/profile', label: 'Dossier / Profile' },
    { to: '/student/drives', label: 'Open Drives' },
    { to: '/student/applications', label: 'My Applications' },
    { to: '/student/interviews', label: 'Interviews' },
    { to: '/student/ai', label: 'AI Match & Review' },
  ]

  const recruiterLinks = [
    { to: '/recruiter/dashboard', label: 'Overview' },
    { to: '/recruiter/company', label: 'Corporate Profile' },
    { to: '/recruiter/drives', label: 'Recruitment Drives' },
    { to: '/recruiter/applications', label: 'Candidate Applications' },
    { to: '/recruiter/interviews', label: 'Interview Boards' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview' },
    { to: '/admin/companies', label: 'Company Approvals' },
    { to: '/admin/analytics', label: 'Institutional Analytics' },
    { to: '/admin/announcements', label: 'Official Dispatches' },
  ]

  const links =
    user?.role === 'student'
      ? studentLinks
      : user?.role === 'recruiter'
      ? recruiterLinks
      : user?.role === 'admin'
      ? adminLinks
      : []

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <header className="newsprint-sheet" style={{ paddingBottom: 0 }}>
      {/* Top Edition Strip */}
      <div className="np-top-strip">
        <span>The Official Campus Placement Journal</span>
        <span>
          {todayStr} <span className="np-accent-mark">·</span> Vol. XLVIII No. 102
        </span>
        <span>Verified Academic Dispatches</span>
      </div>

      {/* Masthead */}
      <div className="np-masthead">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="np-masthead-title">The Placement Chronicle</h1>
        </Link>
        <div className="np-masthead-meta">
          <span>University Placement & Corporate Relations Cell</span>
          <span>
            {user ? (
              <span>
                Authenticated as <strong style={{ color: 'var(--dp-color-ink)' }}>{user.name}</strong>{' '}
                <span className="np-accent-mark">[{user.role?.toUpperCase()}]</span>
              </span>
            ) : (
              <span>Campus Recruitment Portal — Standard Issue</span>
            )}
          </span>
          <span>Verified Ledger</span>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="np-navbar">
        {user ? (
          <ul className="np-nav-links">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => `np-nav-link${isActive ? ' active' : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--dp-color-secondary)' }}>
            Welcome to the centralized recruitment intelligence record.
          </div>
        )}

        <div className="np-nav-actions">
          {user ? (
            <button
              type="button"
              className="np-btn np-btn-sm"
              onClick={handleLogout}
              title="Sign out of portal session"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/login" className="np-btn np-btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="np-btn np-btn-primary np-btn-sm">
                Register Candidate
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
