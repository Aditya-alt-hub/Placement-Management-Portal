import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

export default function RecruiterCompany() {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    logo: '',
    industry: '',
    location: '',
  })

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/companies/my-company')
      const c = res.data.company || res.data
      if (c && c.name) {
        setCompany(c)
        setForm({
          name: c.name || '',
          description: c.description || '',
          website: c.website || '',
          logo: c.logo || '',
          industry: c.industry || '',
          location: c.location || '',
        })
      } else {
        setEditing(true)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCompany(null)
        setEditing(true)
      } else {
        setError(err.response?.data?.message || 'Could not retrieve corporate profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Company name is mandatory.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      if (company) {
        await api.put('/companies/update-my-company', form)
        setSuccess('Corporate profile updated successfully.')
      } else {
        await api.post('/companies/create-company', form)
        setSuccess('Corporate profile created. Waiting for administrator accreditation.')
      }
      await fetchCompany()
      setEditing(false)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to persist company profile.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Querying corporate registration registry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div
        className="np-section-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <span className="np-section-tag">
            Corporate Registry <span className="np-accent-mark">·</span> Employer Profile
          </span>
          <h1>Corporate Enterprise Profile</h1>
          <p className="np-subtitle">
            Authenticated enterprise credentials and placement board identity
          </p>
        </div>
        {company && !editing && (
          <button type="button" className="np-btn np-btn-primary" onClick={() => setEditing(true)}>
            Edit Corporate Inscriptions
          </button>
        )}
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}
      {success && <div className="np-alert np-alert-success">{success}</div>}

      {!editing && company ? (
        <div className="np-lead-spread">
          {/* Main Entity Record */}
          <article className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>Official Corporate Record</h2>
              <Badge status={company.isApproved ? 'Approved' : 'Pending'}>
                {company.isApproved ? 'Accredited by Administration' : 'Pending Accreditation'}
              </Badge>
            </div>

            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>{company.name}</h3>
            <span className="np-byline">
              Sector: {company.industry || 'General Industry'} &middot; Operational Center: {company.location || 'Multiple'}
            </span>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.6, marginTop: '1rem', whiteSpace: 'pre-line' }}>
              {company.description || 'No corporate description inscribed.'}
            </div>

            {company.website && (
              <div style={{ marginTop: '1.5rem', borderTop: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingTop: '0.75rem' }}>
                <span className="np-fact-label">Official Corporate Portal: </span>
                <a href={company.website} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                  {company.website} &rarr;
                </a>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside>
            <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
              <div className="np-panel-header">
                <h3>Accreditation Standing</h3>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                University placement administrators verify corporate tax status, contact identities, and institutional standing before granting campaign rights.
              </p>
              <div style={{ borderTop: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingTop: '0.75rem' }}>
                <span className="np-fact-label">Approval Status:</span>
                <p style={{ fontWeight: 700, margin: '0.2rem 0' }}>
                  {company.isApproved ? 'Active & Approved' : 'Under Administrative Review'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* Form Mode */
        <div className="np-panel" style={{ backgroundColor: '#ffffff', maxWidth: '780px', margin: '0 auto' }}>
          <div className="np-panel-header">
            <h2>{company ? 'Edit Corporate Profile' : 'Inscribe Corporate Enterprise'}</h2>
            {company && (
              <button type="button" className="np-btn np-btn-sm" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="name">
                Company / Legal Entity Name <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Acme Technologies Inc."
                className="np-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="np-form-group">
                <label className="np-label" htmlFor="industry">
                  Industry / Sector
                </label>
                <input
                  id="industry"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. Software, Financial Services, Automotive"
                  className="np-input"
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="location">
                  Headquarters / Hub Location
                </label>
                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore / Remote / Pan-India"
                  className="np-input"
                />
              </div>
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="website">
                Corporate Website URL
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://company.com"
                className="np-input"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="logo">
                Logo Image URL (Optional)
              </label>
              <input
                id="logo"
                name="logo"
                type="url"
                value={form.logo}
                onChange={handleChange}
                placeholder="https://company.com/logo.png"
                className="np-input"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="description">
                Corporate Mission & Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your organization, scale of operations, and employee value proposition..."
                className="np-textarea"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="np-btn np-btn-primary" disabled={submitting}>
                {submitting ? 'Inscribing...' : company ? 'Update Corporate Entity' : 'Register Corporate Entity'}
              </button>
              {company && (
                <button type="button" className="np-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
