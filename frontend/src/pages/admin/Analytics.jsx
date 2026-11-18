import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function AdminAnalytics() {
  const [branchStats, setBranchStats] = useState([])
  const [companyStats, setCompanyStats] = useState([])
  const [batchStats, setBatchStats] = useState([])
  const [activeTab, setActiveTab] = useState('branches')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      const [brRes, compRes, btRes] = await Promise.all([
        api.get('/admin/analytics/branches'),
        api.get('/admin/analytics/companies'),
        api.get('/admin/analytics/batches'),
      ])
      setBranchStats(brRes.data.branchStats || [])
      setCompanyStats(compRes.data.companyStats || [])
      setBatchStats(btRes.data.batchStats || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve institutional analytics archives.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Computing institutional placement aggregations across academic faculties...</p>
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
            Scholastic Assessment <span className="np-accent-mark">·</span> Deep Cohort Analytics
          </span>
          <h1>Institutional Placement Analytics</h1>
          <p className="np-subtitle">
            Longitudinal evaluations by academic faculty, recruiting partner houses, and graduating cohort classes
          </p>
        </div>
        <div>
          <button type="button" className="np-btn np-btn-sm" onClick={fetchAnalytics}>
            Recalculate Indices
          </button>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Tabs */}
      <div
        className="np-panel"
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#ffffff',
        }}
      >
        <span className="np-label" style={{ margin: 0 }}>Analytics Dimension:</span>
        {[
          { key: 'branches', label: `Faculty Disciplines (${branchStats.length})` },
          { key: 'companies', label: `Enterprise Houses (${companyStats.length})` },
          { key: 'batches', label: `Graduation Batches (${batchStats.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`np-btn np-btn-sm ${activeTab === tab.key ? 'np-btn-primary' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Branch Analytics Table */}
      {activeTab === 'branches' && (
        <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
          <div className="np-panel-header">
            <h2>Placement Performance by Academic Faculty & Discipline</h2>
          </div>

          {branchStats.length > 0 ? (
            <div className="np-table-container">
              <table className="np-table">
                <thead>
                  <tr>
                    <th>Academic Faculty / Branch</th>
                    <th>Enrolled Scholars</th>
                    <th>Placed Scholars</th>
                    <th>Placement Ratio (%)</th>
                    <th>Average Annual Package</th>
                    <th>Peak Offer Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {branchStats.map((b) => (
                    // <tr key={b._id}>
                    <tr key={b.branch}>
                      <td>
                        <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem' }}>
                          {b.branch || 'General Faculty'}
                        </strong>
                      </td>
                      <td>{b.totalStudents} candidates</td>
                      <td>
                        <strong>{b.placedStudents}</strong> placed
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800 }}>{b.placementRate ?? 0}%</span>
                          <div style={{ flex: 1, maxWidth: '100px', height: '6px', background: '#eae5d8' }}>
                            <div
                              style={{
                                width: `${b.placementRate ?? 0}%`,
                                height: '100%',
                                background: 'var(--dp-color-ink)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        {b.averagePackage ? `₹${Number(b.averagePackage).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--dp-color-accent)' }}>
                          {b.highestPackage ? `₹${Number(b.highestPackage).toLocaleString('en-IN')}` : '—'}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', padding: '2rem 0', textAlign: 'center' }}>
              No branch placement metrics available.
            </p>
          )}
        </div>
      )} 
{/* Company Analytics Table */}
{activeTab === 'companies' && (
  <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
    <div className="np-panel-header">
      <h2>Enterprise Partner Placement Activity & Compensation</h2>
    </div>

    {companyStats.length > 0 ? (
      <div className="np-table-container">
        <table className="np-table">
          <thead>
            <tr>
              <th>Corporate Partner</th>
              <th>Industry Sector</th>
              <th>Drives Launched</th>
              <th>Applications Evaluated</th>
              <th>Offers Issued</th>
              <th>Placed Candidates</th>
              <th>Package Bracket</th>
            </tr>
          </thead>

          <tbody>
            {companyStats.map((c) => (
              <tr key={c.companyId}>
                <td>
                  <strong
                    style={{
                      fontFamily: 'var(--dp-typography-display)',
                      fontSize: '1.05rem',
                    }}
                  >
                    {c.companyName || 'Unknown Company'}
                  </strong>
                </td>

                <td>{c.industry || 'Not Specified'}</td>

                <td>{c.totalDrives ?? 0} drives</td>

                <td>{c.totalApplications ?? 0} applications</td>

                <td>{c.totalOffersIssued ?? 0} offers</td>

                <td>
                  <strong>{c.totalPlacedStudents ?? 0}</strong> candidates
                </td>

                <td>
                  <div>
                    Avg: {c.averagePackage != null
                      ? `₹${Number(c.averagePackage).toLocaleString('en-IN')}`
                      : '—'}
                  </div>

                  {c.highestPackage != null && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--dp-color-accent)',
                      }}
                    >
                      Max: ₹{Number(c.highestPackage).toLocaleString('en-IN')}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p
        style={{
          fontStyle: 'italic',
          color: 'var(--dp-color-secondary)',
          padding: '2rem 0',
          textAlign: 'center',
        }}
      >
        No enterprise hiring metrics recorded on file.
      </p>
    )}
  </div>
)}


      {/* Graduation Batch Analytics */}
      {activeTab === 'batches' && (
        <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
          <div className="np-panel-header">
            <h2>Graduation Cohort Placement Index</h2>
          </div>

          {batchStats.length > 0 ? (
            <div className="np-table-container">
              <table className="np-table">
                <thead>
                  <tr>
                    <th>Graduation Year Class</th>
                    <th>Total Cohort Scholars</th>
                    <th>Scholars Placed</th>
                    <th>Batch Placement Rate</th>
                    <th>Average Annual Package</th>
                    <th>Peak Offer Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStats.map((bt) => (
                    <tr key={bt.graduationYear}>
                      <td>
                        <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.1rem' }}>
                          {bt.graduationYear || 'Unknown Year'}
                        </strong>
                      </td>
                      <td>{bt.totalStudents} students</td>
                      <td>
                        <strong>{bt.placedStudents}</strong> placed
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800 }}>{bt.placementRate ?? 0}%</span>
                          <div style={{ flex: 1, maxWidth: '100px', height: '6px', background: '#eae5d8' }}>
                            <div
                              style={{
                                width: `${bt.placementRate ?? 0}%`,
                                height: '100%',
                                background: 'var(--dp-color-ink)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        {bt.averagePackage ? `₹${Number(bt.averagePackage).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--dp-color-accent)' }}>
                          {bt.highestPackage ? `₹${Number(bt.highestPackage).toLocaleString('en-IN')}` : '—'}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', padding: '2rem 0', textAlign: 'center' }}>
              No cohort batch placement data available.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
