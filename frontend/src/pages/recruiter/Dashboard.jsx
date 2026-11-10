import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [drives, setDrives] = useState([])
  const [apps, setApps] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const [compRes, drivesRes, appsRes, intRes] = await Promise.allSettled([
        api.get('/companies/my-company'),
        api.get('/drives/my-drives'),
        api.get('/applications/recruiter'),
        api.get('/interviews/recruiter'),
      ])

      if (compRes.status === 'fulfilled') {
        setCompany(compRes.value.data.company || null)
      }
      if (drivesRes.status === 'fulfilled') {
        setDrives(drivesRes.value.data.drives || [])
      }
      if (appsRes.status === 'fulfilled') {
        setApps(appsRes.value.data.applications || [])
      }
      if (intRes.status === 'fulfilled') {
        setInterviews(intRes.value.data.interviews || [])
      }
    } catch {
      setError('Failed to load corporate recruiter board data.')
    } finally {
      setLoading(false)
    }
  }

  const shortlistedCount = apps.filter((a) => a.status === 'Shortlisted').length
  const offersIssuedCount = apps.filter((a) => a.offer?.status === 'Offered' || a.offer?.status === 'Accepted').length

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Accessing corporate recruitment dispatch desk...</p>
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
            Corporate Operations <span className="np-accent-mark">·</span> Talent Acquisition Desk
          </span>
          <h1>Recruiter Control Console</h1>
          <p className="np-subtitle">
            Enterprise recruitment campaigns, candidate boards, and issuance of appointment offers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/recruiter/drives/new" className="np-btn np-btn-primary np-btn-sm">
            Publish New Drive
          </Link>
          <Link to="/recruiter/applications" className="np-btn np-btn-sm">
            Candidate Pipeline
          </Link>
          <Link to="/recruiter/interviews" className="np-btn np-btn-sm">
            Interview Boards
          </Link>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Company Verification Banner */}
      {!company ? (
        <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-accent)', backgroundColor: '#fff' }}>
          <strong>Action Required:</strong> No enterprise entity is registered to your recruiter account. You must register your corporate profile before creating placement drives.{' '}
          <Link to="/recruiter/company" style={{ fontWeight: 700 }}>
            Register Corporate Entity Now &rarr;
          </Link>
        </div>
      ) : !company.isApproved ? (
        <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-accent)', backgroundColor: '#fff' }}>
          <strong>Institutional Approval Pending:</strong> Your corporate entity <strong>{company.name}</strong> is awaiting administrative validation. Drives cannot accept submissions until approved by the university placement cell.
        </div>
      ) : null}

      {/* Factual Strip */}
      <section className="np-facts-strip">
        <div className="np-fact-item">
          <div className="np-fact-label">Active Drives</div>
          <div className="np-fact-value">{drives.length}</div>
          <div className="np-fact-sub">Managed campaigns</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Submissions Received</div>
          <div className="np-fact-value">{apps.length}</div>
          <div className="np-fact-sub">Candidate applications</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Shortlisted Candidates</div>
          <div className="np-fact-value">{shortlistedCount}</div>
          <div className="np-fact-sub">Advanced candidates</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Offers Issued</div>
          <div className="np-fact-value">{offersIssuedCount}</div>
          <div className="np-fact-sub">Pending / accepted</div>
        </div>
      </section>

      {/* 3:1 Spread: Drives Ledger beside Corporate Standing */}
      <div className="np-lead-spread">
        {/* Main Column: Active Drives & Recent Applicants */}
        <div>
          {/* Drives Overview */}
          <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>My Recruitment Drives</h2>
              <Link to="/recruiter/drives" className="np-btn np-btn-sm">
                Manage Drives ({drives.length})
              </Link>
            </div>

            {drives.length > 0 ? (
              <div className="np-table-container">
                <table className="np-table">
                  <thead>
                    <tr>
                      <th>Drive Role</th>
                      <th>Terms</th>
                      <th>Status</th>
                      <th>Submissions</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drives.slice(0, 4).map((d) => {
                      const countForDrive = apps.filter((a) => a.drive?._id === d._id || a.drive === d._id).length
                      return (
                        <tr key={d._id}>
                          <td>
                            <strong>{d.title}</strong>
                            <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                              {d.location || 'Multiple'} &middot;{' '}
                              {d.salary ? `₹${Number(d.salary).toLocaleString('en-IN')} p.a.` : 'Competitive'}
                            </div>
                          </td>
                          <td>
                            <Badge variant="filled">{d.jobType || 'Full Time'}</Badge>
                          </td>
                          <td>
                            <Badge status={d.status}>{d.status}</Badge>
                          </td>
                          <td>
                            <strong>{countForDrive}</strong> candidates
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Link to={`/recruiter/drives/${d._id}/edit`} className="np-btn np-btn-sm">
                              Edit Rubric
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', padding: '1rem 0' }}>
                No active placement drives published. Click &ldquo;Publish New Drive&rdquo; to launch a campaign.
              </p>
            )}
          </div>

          {/* Recent Candidates */}
          <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>Recent Candidate Submissions</h2>
              <Link to="/recruiter/applications" className="np-btn np-btn-sm">
                Review Pipeline ({apps.length})
              </Link>
            </div>

            {apps.length > 0 ? (
              <div className="np-table-container">
                <table className="np-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Target Role</th>
                      <th>Evaluation Status</th>
                      <th>Filing Date</th>
                      <th style={{ textAlign: 'right' }}>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.slice(0, 5).map((app) => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.student?.user?.name || 'Candidate'}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                            {app.student?.course} ({app.student?.branch}) &middot; CGPA: {app.student?.cgpa}
                          </div>
                        </td>
                        <td>{app.drive?.title || 'Drive'}</td>
                        <td>
                          <Badge status={app.status}>{app.status}</Badge>
                        </td>
                        <td>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to="/recruiter/applications" className="np-btn np-btn-sm">
                            Evaluate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', padding: '1rem 0' }}>
                No candidate submissions recorded yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar: Enterprise Record */}
        <aside>
          <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h3>Enterprise Accreditation</h3>
            </div>

            {company ? (
              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <span className="np-fact-label">Entity Name:</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.2rem 0' }}>{company.name}</p>
                </div>
                <div>
                  <span className="np-fact-label">Accreditation Status:</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <Badge status={company.isApproved ? 'Approved' : 'Pending'}>
                      {company.isApproved ? 'Accredited Partner' : 'Awaiting Administration Approval'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="np-fact-label">Industry Sector:</span>
                  <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{company.industry || 'Undisclosed'}</p>
                </div>
                <div>
                  <span className="np-fact-label">Operational Hub:</span>
                  <p style={{ margin: '0.2rem 0' }}>{company.location || 'Undisclosed'}</p>
                </div>
                {company.website && (
                  <div>
                    <span className="np-fact-label">Web Portal:</span>
                    <div>
                      <a href={company.website} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                        {company.website} &rarr;
                      </a>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/recruiter/company" className="np-btn np-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Edit Corporate Record &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  No corporate entity attached to this recruiter account.
                </p>
                <Link to="/recruiter/company" className="np-btn np-btn-primary np-btn-sm">
                  Register Company Profile
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
