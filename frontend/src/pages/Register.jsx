import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.role) {
      setError('All designated fields are required for registration.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Confirmation password does not match the entered password.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password, form.role)
      if (user.role === 'student') navigate('/student/dashboard')
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please check your data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="newsprint-sheet" style={{ maxWidth: '680px', marginTop: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="np-section-tag">
            Scholastic Registry <span className="np-accent-mark">·</span> Formal Inscription
          </span>
          <h1 style={{ fontSize: '2.4rem', textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
            Account Registration
          </h1>
          <p className="np-subtitle">Enroll as a graduating scholar, enterprise recruiter, or system administrator</p>
        </div>

        <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
          {error && <div className="np-alert np-alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="name">
                Full Legal Name <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. John Doe / Jane Smith"
                className="np-input"
                required
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="email">
                Official Email Address <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="scholar@university.edu"
                className="np-input"
                required
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="role">
                Account Classification / Role <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <select id="role" name="role" value={form.role} onChange={handleChange} className="np-select" required>
                <option value="student">Student (Candidate for Placement)</option>
                <option value="recruiter">Corporate Recruiter (Talent Acquisition)</option>
                <option value="admin">Institutional Administrator (Placement Cell)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  placeholder="Min. 6 characters"
                  className="np-input"
                  required
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="confirmPassword">
                  Confirm Password <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="np-input"
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button
                type="submit"
                className="np-btn np-btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                {loading ? 'Creating Credentials...' : 'Register Profile Dossier'}
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
            <span>Already have registered credentials?</span>
            <Link to="/login" style={{ fontWeight: 700 }}>
              Sign in to session &rarr;
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
