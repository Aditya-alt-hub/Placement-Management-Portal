import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const ROUND_CHOICES = ['Coding', 'Technical', 'HR', 'Final']

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  // Shortlist Modal State
  const [shortlistApp, setShortlistApp] = useState(null)
  const [roundName, setRoundName] = useState('Technical')
  const [shortlisting, setShortlisting] = useState(false)

  // Reject Modal State
  const [rejectApp, setRejectApp] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  // Issue Offer Modal State
  const [offerApp, setOfferApp] = useState(null)
  const [offerPackage, setOfferPackage] = useState('')
  const [issuing, setIssuing] = useState(false)

  // Feedback Notification
  const [feedbackNotice, setFeedbackNotice] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/applications/recruiter')
      setApplications(res.data.applications || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve applicant pipeline.')
    } finally {
      setLoading(false)
    }
  }

  const handleShortlist = async (e) => {
    e.preventDefault()
    if (!shortlistApp || !roundName) return
    setShortlisting(true)
    try {
      const res = await api.patch(`/applications/${shortlistApp._id}/shortlist`, {
        roundName,
      })
      setFeedbackNotice({
        type: 'success',
        title: 'Candidate Shortlisted',
        message: res.data.message || `Candidate successfully advanced to ${roundName} round.`,
      })
      setShortlistApp(null)
      await fetchApplications()
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        title: 'Shortlisting Error',
        message: err?.response?.data?.message || 'Could not shortlist candidate.',
      })
    } finally {
      setShortlisting(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!rejectApp) return
    setRejecting(true)
    try {
      const res = await api.patch(`/applications/${rejectApp._id}/reject`, {
        reason: rejectReason.trim() || 'Candidate credentials did not satisfy stage requirements.',
      })
      setFeedbackNotice({
        type: 'success',
        title: 'Candidate Rejected',
        message: res.data.message || 'Application has been inscribed as rejected.',
      })
      setRejectApp(null)
      setRejectReason('')
      await fetchApplications()
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        title: 'Rejection Error',
        message: err?.response?.data?.message || 'Could not reject candidate application.',
      })
    } finally {
      setRejecting(false)
    }
  }

  const handleIssueOffer = async (e) => {
    e.preventDefault()
    if (!offerApp || !offerPackage || Number(offerPackage) <= 0) return
    setIssuing(true)
    try {
      const res = await api.patch(`/applications/${offerApp._id}/offer`, {
        package: Number(offerPackage),
      })
      setFeedbackNotice({
        type: 'success',
        title: 'Formal Offer Issued',
        message: res.data.message || 'Appointment offer issued to candidate profile with email dispatch.',
      })
      setOfferApp(null)
      setOfferPackage('')
      await fetchApplications()
    } catch (err) {
      setFeedbackNotice({
        type: 'error',
        title: 'Offer Issuance Error',
        message: err?.response?.data?.message || 'Could not issue appointment offer.',
      })
    } finally {
      setIssuing(false)
    }
  }

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'All') return true
    return app.status === filterStatus
  })

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Querying corporate candidate pipeline...</p>
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
            Candidate Pipeline <span className="np-accent-mark">·</span> Evaluation Desk
          </span>
          <h1>Candidate Submissions Ledger</h1>
          <p className="np-subtitle">
            Review applicant qualifications, advance candidates to interview rounds, and extend appointment offers
          </p>
        </div>
        <div>
          <button type="button" className="np-btn np-btn-sm" onClick={fetchApplications}>
            Refresh Ledger
          </button>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Filter Tabs */}
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
        <span className="np-label" style={{ margin: 0 }}>Filter Status:</span>
        {['All', 'Applied', 'Shortlisted', 'Interview', 'Selected', 'Placed', 'Rejected'].map((st) => (
          <button
            key={st}
            type="button"
            className={`np-btn np-btn-sm ${filterStatus === st ? 'np-btn-primary' : ''}`}
            onClick={() => setFilterStatus(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      {filteredApps.length > 0 ? (
        <div className="np-table-container">
          <table className="np-table">
            <thead>
              <tr>
                <th>Candidate Scholar</th>
                <th>Target Drive</th>
                <th>Academic Metrics</th>
                <th>Evaluation Status</th>
                <th>Offer Details</th>
                <th style={{ textAlign: 'right' }}>Committee Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const s = app.student
                return (
                  <tr key={app._id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem' }}>
                        {s?.user?.name || 'Applicant'}
                      </strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                        {s?.user?.email} &middot; Enr #{s?.enrollmentNumber || '—'}
                      </div>
                      {s?.resume?.url && (
                        <div style={{ marginTop: '0.2rem' }}>
                          <a
                            href={s.resume.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            Inspect Deposited CV (PDF) &rarr;
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{app.drive?.title || 'Drive'}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                        {app.drive?.jobType} &middot; {app.drive?.location}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.35 }}>
                        <div>
                          Course: <strong>{s?.course} ({s?.branch})</strong>
                        </div>
                        <div>CGPA: <strong>{s?.cgpa}</strong> / 10.0</div>
                        <div>Backlogs: <strong>{s?.backlogs ?? 0}</strong></div>
                      </div>
                    </td>
                    <td>
                      <Badge status={app.status}>{app.status}</Badge>
                      <div style={{ fontSize: '0.8rem', color: 'var(--dp-color-secondary)', marginTop: '0.2rem' }}>
                        Filed: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : '—'}
                      </div>
                    </td>
                    <td>
                      {app.offer?.status && app.offer.status !== 'Pending' ? (
                        <div>
                          <Badge status={app.offer.status} featured={app.offer.status === 'Offered'}>
                            {app.offer.status}
                          </Badge>
                          {app.offer.package && (
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem' }}>
                              ₹{Number(app.offer.package).toLocaleString('en-IN')} p.a.
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {app.status === 'Applied' && (
                          <button
                            type="button"
                            className="np-btn np-btn-primary np-btn-sm"
                            onClick={() => {
                              setShortlistApp(app)
                              setRoundName('Technical')
                            }}
                          >
                            Shortlist
                          </button>
                        )}

                        {app.status !== 'Rejected' && app.status !== 'Placed' && (
                          <button
                            type="button"
                            className="np-btn np-btn-sm"
                            onClick={() => {
                              setOfferApp(app)
                              setOfferPackage(String(app.drive?.salary || ''))
                            }}
                          >
                            Issue Offer
                          </button>
                        )}

                        {app.status !== 'Rejected' && app.status !== 'Placed' && (
                          <button
                            type="button"
                            className="np-btn np-btn-danger np-btn-sm"
                            onClick={() => {
                              setRejectApp(app)
                              setRejectReason('')
                            }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="np-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--dp-color-secondary)' }}>
            No candidate submissions in the selected status category.
          </p>
        </div>
      )}

      {/* Shortlist Modal */}
      <Modal
        isOpen={!!shortlistApp}
        onClose={() => setShortlistApp(null)}
        title="Advance Candidate to Evaluation Round"
      >
        <form onSubmit={handleShortlist}>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Advancing <strong>{shortlistApp?.student?.user?.name}</strong> for drive{' '}
            <strong>{shortlistApp?.drive?.title}</strong>. Specify the upcoming evaluation round:
          </p>

          <div className="np-form-group">
            <label className="np-label" htmlFor="roundName">
              Next Evaluation Round <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
            </label>
            <select
              id="roundName"
              className="np-select"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              required
            >
              {ROUND_CHOICES.map((r) => (
                <option key={r} value={r}>
                  {r} Round
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="np-btn" onClick={() => setShortlistApp(null)}>
              Cancel
            </button>
            <button type="submit" className="np-btn np-btn-primary" disabled={shortlisting}>
              {shortlisting ? 'Advancing Candidate...' : 'Confirm Shortlist'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectApp}
        onClose={() => setRejectApp(null)}
        title="Inscribe Application Rejection"
      >
        <form onSubmit={handleReject}>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Are you sure you wish to reject the application of{' '}
            <strong>{rejectApp?.student?.user?.name}</strong> for{' '}
            <strong>{rejectApp?.drive?.title}</strong>?
          </p>

          <div className="np-form-group">
            <label className="np-label" htmlFor="rejectReason">
              Formal Rejection Rationale
            </label>
            <textarea
              id="rejectReason"
              className="np-textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Candidate performance in technical review did not meet team benchmark..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="np-btn" onClick={() => setRejectApp(null)}>
              Cancel
            </button>
            <button type="submit" className="np-btn np-btn-danger" disabled={rejecting}>
              {rejecting ? 'Inscribing Rejection...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Offer Modal */}
      <Modal
        isOpen={!!offerApp}
        onClose={() => setOfferApp(null)}
        title="Issue Formal Appointment Offer"
      >
        <form onSubmit={handleIssueOffer}>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Generate and dispatch a formal placement offer to{' '}
            <strong>{offerApp?.student?.user?.name}</strong> for the position of{' '}
            <strong>{offerApp?.drive?.title}</strong>.
          </p>

          <div className="np-form-group">
            <label className="np-label" htmlFor="offerPackage">
              Annual Compensation Package (INR) <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
            </label>
            <input
              id="offerPackage"
              type="number"
              className="np-input"
              value={offerPackage}
              onChange={(e) => setOfferPackage(e.target.value)}
              placeholder="e.g. 1500000"
              required
              min="1"
            />
          </div>

          <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-ink)', backgroundColor: '#fff' }}>
            Upon issuance, an automated notification and letter of offer will be dispatched to the candidate's verified university email.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="np-btn" onClick={() => setOfferApp(null)}>
              Cancel
            </button>
            <button type="submit" className="np-btn np-btn-primary" disabled={issuing}>
              {issuing ? 'Dispatching Letter...' : 'Issue Formal Offer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={!!feedbackNotice}
        onClose={() => setFeedbackNotice(null)}
        title={feedbackNotice?.title || 'Notice'}
        footer={
          <button type="button" className="np-btn np-btn-primary" onClick={() => setFeedbackNotice(null)}>
            Dismiss
          </button>
        }
      >
        <p style={{ fontSize: '1rem', lineHeight: 1.4 }}>{feedbackNotice?.message}</p>
      </Modal>
    </div>
  )
}
