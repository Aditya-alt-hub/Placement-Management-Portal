import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [apps, setApps] = useState([])
  const [interviews, setInterviews] = useState([])
  const [approvedCompanies, setApprovedCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const [profRes, appsRes, intRes, compRes] = await Promise.allSettled([
        api.get('/students/get-profile'),
        api.get('/applications/my-applications'),
        api.get('/interviews/my-interviews'),
        api.get('/companies/approved-company'),
      ])

      if (profRes.status === 'fulfilled') {
        setProfile(profRes.value.data.student || profRes.value.data.profile || null)
      }
      if (appsRes.status === 'fulfilled') {
        setApps(appsRes.value.data.applications || [])
      }
      if (intRes.status === 'fulfilled') {
        setInterviews(intRes.value.data.interviews || [])
      }
      if (compRes.status === 'fulfilled') {
        setApprovedCompanies(compRes.value.data.companies || [])
      }
    } catch (err) {
      setError('Unable to load complete student dossier records.')
    } finally {
      setLoading(false)
    }
  }

  const placedOffer = apps.find(
    (a) => a.status === 'Placed' || a.offer?.status === 'Accepted'
  )
  const pendingOffers = apps.filter((a) => a.offer?.status === 'Offered')
  const shortlistedApps = apps.filter((a) => a.status === 'Shortlisted')

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Compiling candidate dispatch and placement records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="np-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="np-section-tag">
            Candidate Portfolio <span className="np-accent-mark">·</span> Enrollment Desk
          </span>
          <h1>Scholar Placement Dossier</h1>
          <p className="np-subtitle">
            Welcome, {user?.name}. Placement Status:{' '}
            <strong style={{ color: placedOffer ? 'var(--dp-color-ink)' : 'var(--dp-color-accent)' }}>
              {placedOffer ? 'PLACED & CONTRACTED' : profile?.placementStatus || 'IN PROGRESS'}
            </strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/student/drives" className="np-btn np-btn-primary np-btn-sm">
            Browse Open Drives
          </Link>
          <Link to="/student/profile" className="np-btn np-btn-sm">
            Edit Scholastic Data
          </Link>
          <Link to="/student/ai" className="np-btn np-btn-sm">
            AI Career Audit
          </Link>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Profile missing notice */}
      {!profile && (
        <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-accent)', backgroundColor: '#fff' }}>
          <strong>Notice of Incomplete Record:</strong> Your academic profile has not been completed.
          You must record your academic indices (CGPA, Branch, Graduation Year) before you can submit applications to active drives.{' '}
          <Link to="/student/profile" style={{ fontWeight: 700 }}>
            Inscribe Profile Now &rarr;
          </Link>
        </div>
      )}

      {/* Offer pending notice */}
      {pendingOffers.length > 0 && (
        <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-accent)', backgroundColor: '#fff' }}>
          <strong>Action Required:</strong> You have received {pendingOffers.length} formal corporate placement offer(s)!{' '}
          <Link to="/student/applications" style={{ fontWeight: 700 }}>
            Inspect & Respond to Offers in My Applications &rarr;
          </Link>
        </div>
      )}

      {/* Factual Strip */}
      <section className="np-facts-strip">
        <div className="np-fact-item">
          <div className="np-fact-label">Applications Filed</div>
          <div className="np-fact-value">{apps.length}</div>
          <div className="np-fact-sub">Total submissions</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Shortlisted Rounds</div>
          <div className="np-fact-value">{shortlistedApps.length}</div>
          <div className="np-fact-sub">Advanced to next phase</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Scheduled Interviews</div>
          <div className="np-fact-value">{interviews.length}</div>
          <div className="np-fact-sub">Technical & HR sessions</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Active Offers</div>
          <div className="np-fact-value">
            {pendingOffers.length + (placedOffer ? 1 : 0)}
          </div>
          <div className="np-fact-sub">
            {placedOffer ? 'Contract Accepted' : 'Awaiting Decision'}
          </div>
        </div>
      </section>

      {/* 3:1 Spread: Applications Ledger & Quick Sidebar */}
      <div className="np-lead-spread">
        {/* Main Column: Recent Applications & Interview Ledger */}
        <div>
          <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>Recent Applications Ledger</h2>
              <Link to="/student/applications" className="np-btn np-btn-sm">
                View All ({apps.length})
              </Link>
            </div>

            {apps.length > 0 ? (
              <div className="np-table-container">
                <table className="np-table">
                  <thead>
                    <tr>
                      <th>Drive Role</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Offer State</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.slice(0, 5).map((app) => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.drive?.title || 'Placement Drive'}</strong>
                        </td>
                        <td>{app.drive?.company?.name || 'Recruiter'}</td>
                        <td>
                          <Badge status={app.status}>{app.status}</Badge>
                        </td>
                        <td>
                          {app.offer?.status && app.offer.status !== 'Pending' ? (
                            <Badge status={app.offer.status} featured={app.offer.status === 'Offered'}>
                              {app.offer.status} {app.offer.package ? `(₹${app.offer.package} p.a.)` : ''}
                            </Badge>
                          ) : (
                            <span style={{ color: 'var(--dp-color-secondary)', fontSize: '0.85rem' }}>—</span>
                          )}
                        </td>
                        <td>
                          <Link to="/student/applications" className="np-btn np-btn-sm">
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', padding: '1rem 0' }}>
                No applications submitted yet. Browse active recruitment drives to submit your candidacy.
              </p>
            )}
          </div>

          {/* Scheduled Interviews Section */}
          <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>Scheduled Interview Boards</h2>
              <Link to="/student/interviews" className="np-btn np-btn-sm">
                View Calendar ({interviews.length})
              </Link>
            </div>

            {interviews.length > 0 ? (
              <div className="np-table-container">
                <table className="np-table">
                  <thead>
                    <tr>
                      <th>Round</th>
                      <th>Date & Time</th>
                      <th>Mode / Venue</th>
                      <th>Status</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.slice(0, 4).map((it) => (
                      <tr key={it._id}>
                        <td>
                          <strong>{it.round} Round</strong>
                        </td>
                        <td>
                          {new Date(it.interviewDate).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td>
                          {it.mode === 'Online' ? (
                            it.meetingLink ? (
                              <a href={it.meetingLink} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                                Join Online Room &rarr;
                              </a>
                            ) : (
                              'Online Link Pending'
                            )
                          ) : (
                            it.location || 'On Campus'
                          )}
                        </td>
                        <td>
                          <Badge status={it.status}>{it.status}</Badge>
                        </td>
                        <td>
                          <Badge status={it.result}>{it.result || 'Pending'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', padding: '1rem 0' }}>
                No active interview boards scheduled for your profile. Shortlisted applications will appear here.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Column: Candidate Academic Snapshot & Approved Companies */}
        <aside>
          <div className="np-panel">
            <div className="np-panel-header">
              <h3>Scholastic Snapshot</h3>
            </div>
            {profile ? (
              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="np-fact-label">Enrollment:</span>
                  <strong>{profile.enrollmentNumber || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="np-fact-label">Course & Branch:</span>
                  <strong>
                    {profile.course} {profile.branch ? `(${profile.branch})` : ''}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="np-fact-label">Graduation Year:</span>
                  <strong>{profile.graduationYear || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="np-fact-label">Cumulative GPA:</span>
                  <strong>{profile.cgpa || '—'} / 10.0</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="np-fact-label">Backlogs:</span>
                  <strong>{profile.backlogs ?? 0} active</strong>
                </div>
                {profile.skills?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className="np-fact-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
                      Key Skills:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {profile.skills.slice(0, 6).map((sk, idx) => (
                        <span key={idx} className="np-badge">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/student/profile" className="np-btn np-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Update Dossier &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  No scholastic record registered.
                </p>
                <Link to="/student/profile" className="np-btn np-btn-sm np-btn-primary">
                  Inscribe Record
                </Link>
              </div>
            )}
          </div>

          {/* Approved Companies Directory Notice */}
          <div className="np-panel">
            <div className="np-panel-header">
              <h3>Approved Companies</h3>
            </div>
            {approvedCompanies.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {approvedCompanies.slice(0, 5).map((c) => (
                  <li key={c._id} style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.35rem' }}>
                    <strong style={{ display: 'block' }}>{c.name}</strong>
                    <span style={{ color: 'var(--dp-color-secondary)' }}>
                      {c.industry || 'Industry'} &middot; {c.location || 'Multiple'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--dp-color-secondary)' }}>
                Approved recruiters list is being compiled.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
