import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please provide both your registered email address and password.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'student') navigate('/student/dashboard')
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="newsprint-sheet" style={{ maxWidth: '640px', marginTop: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="np-section-tag">
            Credentials Verification <span className="np-accent-mark">·</span> Office of the Registrar
          </span>
          <h1 style={{ fontSize: '2.4rem', textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
            Portal Sign In
          </h1>
          <p className="np-subtitle">Access your candidate dossier, corporate board, or administration terminal</p>
        </div>

        <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
          {error && <div className="np-alert np-alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="email">
                Registered Institutional Email <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="scholar@university.edu or recruiter@enterprise.com"
                className="np-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="password">
                Password <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="np-input"
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="np-btn np-btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                {loading ? 'Authenticating Credentials...' : 'Authenticate & Enter'}
              </button>
            </div>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>First time enrolling?</span>
            <Link to="/register" style={{ fontWeight: 700 }}>
              Register candidate dossier &rarr;
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>&larr; Return to The Placement Chronicle Front Page</Link>
        </div>
      </div>
    </div>
  )
}
