import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/analytics/overview')
      setOverview(res.data.overview || res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve institutional placement ledger.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Accessing university placement oversight archives...</p>
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
            Administration Secretariat <span className="np-accent-mark">·</span> Central University Oversight
          </span>
          <h1>Institutional Placement Console</h1>
          <p className="np-subtitle">
            Executive oversight over campus recruitment, corporate accreditations, cohort metrics, and official dispatches
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/admin/companies" className="np-btn np-btn-primary np-btn-sm">
            Vetting Desk ({overview?.totalCompanies - overview?.approvedCompanies || 0} Pending)
          </Link>
          <Link to="/admin/analytics" className="np-btn np-btn-sm">
            Deep Cohort Analytics
          </Link>
          <Link to="/admin/announcements" className="np-btn np-btn-sm">
            Issue Official Dispatch
          </Link>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {overview && (
        <>
          {/* Institutional Factual Strip */}
          <section className="np-facts-strip">
            <div className="np-fact-item">
              <div className="np-fact-label">Registered Scholars</div>
              <div className="np-fact-value">{overview.totalStudents ?? 0}</div>
              <div className="np-fact-sub">Academic candidate dossiers</div>
            </div>
            <div className="np-fact-item">
              <div className="np-fact-label">Placed Scholars</div>
              <div className="np-fact-value" style={{ color: 'var(--dp-color-ink)' }}>
                {overview.placedStudents ?? 0}
              </div>
              <div className="np-fact-sub">Confirmed appointments</div>
            </div>
            <div className="np-fact-item">
              <div className="np-fact-label">Placement Index</div>
              <div className="np-fact-value">{overview.placementRate ?? 0}%</div>
              <div className="np-fact-sub">Institutional success rate</div>
            </div>
            <div className="np-fact-item">
              <div className="np-fact-label">Average Package</div>
              <div className="np-fact-value">
                {overview.averagePackage ? `₹${overview.averagePackage.toLocaleString('en-IN')}` : '₹0'}
              </div>
              <div className="np-fact-sub">Annual median compensation</div>
            </div>
            <div className="np-fact-item">
              <div className="np-fact-label">Peak Package</div>
              <div className="np-fact-value" style={{ color: 'var(--dp-color-accent)' }}>
                {overview.highestPackage ? `₹${overview.highestPackage.toLocaleString('en-IN')}` : '₹0'}
              </div>
              <div className="np-fact-sub">Highest campus offer</div>
            </div>
          </section>

          {/* 3:1 Spread: Summary Ledger beside Quick Action Desk */}
          <div className="np-lead-spread">
            {/* Lead Story: Institutional Report */}
            <div>
              <article className="np-panel" style={{ backgroundColor: '#ffffff' }}>
                <div className="np-panel-header">
                  <h2>Official University Placement State Report</h2>
                  <span className="np-fact-label">Academic Year 2025–2026</span>
                </div>

                <p className="np-story-lead">
                  Institutional placement registries indicate an active engagement of {overview.totalCompanies} corporate entities, of which {overview.approvedCompanies} have completed institutional vetting. An aggregate of {overview.totalDrives} placement drives have been sanctioned, maintaining {overview.openDrives} concurrent open application windows across university faculties.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ border: 'var(--dp-border-hairline) solid var(--dp-color-rule)', padding: '1rem' }}>
                    <span className="np-section-tag">Candidate Placement Roster</span>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Registered Candidates:</span>
                        <strong>{overview.totalStudents}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Scholars Formally Placed:</span>
                        <strong style={{ color: 'var(--dp-color-ink)' }}>{overview.placedStudents}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Awaiting Final Placement:</span>
                        <strong>{overview.notPlacedStudents}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: 'var(--dp-border-hairline) solid var(--dp-color-rule)', padding: '1rem' }}>
                    <span className="np-section-tag">Corporate Relations Roster</span>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Corporate Entities:</span>
                        <strong>{overview.totalCompanies}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Accredited & Approved:</span>
                        <strong style={{ color: 'var(--dp-color-ink)' }}>{overview.approvedCompanies}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Awaiting Administrative Review:</span>
                        <strong style={{ color: 'var(--dp-color-accent)' }}>
                          {overview.totalCompanies - overview.approvedCompanies}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar Desk */}
            <aside>
              <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
                <div className="np-panel-header">
                  <h3>Administrative Desk</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/admin/companies" className="np-btn" style={{ justifyContent: 'center' }}>
                    Review Entity Accreditations &rarr;
                  </Link>
                  <Link to="/admin/analytics" className="np-btn" style={{ justifyContent: 'center' }}>
                    Inspect Branch & Batch Breakdown &rarr;
                  </Link>
                  <Link to="/admin/announcements" className="np-btn np-btn-primary" style={{ justifyContent: 'center' }}>
                    Broadcast Cohort Dispatch &rarr;
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
