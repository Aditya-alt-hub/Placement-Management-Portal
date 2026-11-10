import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function StudentApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Offer Response Modal
  const [offerModalApp, setOfferModalApp] = useState(null)
  const [responding, setResponding] = useState(false)
  const [responseNotice, setResponseNotice] = useState(null)

  // Status Trail Modal
  const [historyModalApp, setHistoryModalApp] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/applications/my-applications')
      setApplications(res.data.applications || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve application ledger.')
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToOffer = async (decision) => {
    if (!offerModalApp) return
    setResponding(true)
    try {
      const res = await api.patch(`/applications/${offerModalApp._id}/offer/respond`, {
        decision, // "Accepted" or "Declined"
      })
      setResponseNotice({
        type: 'success',
        title: `Offer ${decision}`,
        message: res.data.message || `The formal offer has been marked as ${decision}.`,
      })
      setOfferModalApp(null)
      await fetchApplications()
    } catch (err) {
      setResponseNotice({
        type: 'error',
        title: 'Decision Inscription Error',
        message: err?.response?.data?.message || 'Could not register offer response.',
      })
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Compiling student application register...</p>
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
            Candidacy Ledger <span className="np-accent-mark">·</span> Official Submissions
          </span>
          <h1>My Application Archives</h1>
          <p className="np-subtitle">
            Permanent record of submitted candidatures, evaluation progressions, and corporate offers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="np-btn np-btn-sm" onClick={fetchApplications}>
            Refresh Ledger
          </button>
          <Link to="/student/drives" className="np-btn np-btn-primary np-btn-sm">
            Explore Open Drives
          </Link>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Applications Table */}
      {applications.length > 0 ? (
        <div className="np-table-container">
          <table className="np-table">
            <thead>
              <tr>
                <th>Drive Notice & Role</th>
                <th>Enterprise Partner</th>
                <th>Filing Date</th>
                <th>Candidate Status</th>
                <th>Corporate Offer</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <Link
                      to={`/student/drives/${app.drive?._id}`}
                      style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem', fontWeight: 800, textDecoration: 'none' }}
                    >
                      {app.drive?.title || 'Placement Drive'}
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      Dossier Ref #{app._id.slice(-6).toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <strong>{app.drive?.company?.name || 'Recruiter'}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {app.drive?.company?.location || 'Pan India'}
                    </div>
                  </td>
                  <td>
                    {app.appliedAt
                      ? new Date(app.appliedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>
                    <Badge status={app.status}>{app.status}</Badge>
                    {app.rejectionReasons?.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--dp-color-accent)', marginTop: '0.2rem' }}>
                        {app.rejectionReasons[0]}
                      </div>
                    )}
                  </td>
                  <td>
                    {app.offer?.status && app.offer.status !== 'Pending' ? (
                      <div>
                        <Badge
                          status={app.offer.status}
                          featured={app.offer.status === 'Offered' || app.offer.status === 'Accepted'}
                        >
                          {app.offer.status}
                        </Badge>
                        {app.offer.package && (
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem' }}>
                            ₹{Number(app.offer.package).toLocaleString('en-IN')} p.a.
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--dp-color-secondary)', fontSize: '0.85rem' }}>No Offer Issued</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="np-btn np-btn-sm"
                        onClick={() => setHistoryModalApp(app)}
                      >
                        Audit Trail
                      </button>

                      {app.offer?.status === 'Offered' && (
                        <button
                          type="button"
                          className="np-btn np-btn-accent np-btn-sm"
                          onClick={() => setOfferModalApp(app)}
                        >
                          Review Offer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="np-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--dp-color-secondary)', marginBottom: '1rem' }}>
            No formal candidatures recorded on file.
          </p>
          <Link to="/student/drives" className="np-btn np-btn-primary">
            Review Open Recruitment Notices
          </Link>
        </div>
      )}

      {/* Offer Response Modal */}
      <Modal
        isOpen={!!offerModalApp}
        onClose={() => setOfferModalApp(null)}
        title="Formal Corporate Placement Offer"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="np-btn np-btn-danger"
              disabled={responding}
              onClick={() => handleRespondToOffer('Declined')}
            >
              {responding ? 'Writing Ledger...' : 'Decline Offer'}
            </button>
            <button
              type="button"
              className="np-btn np-btn-primary"
              disabled={responding}
              onClick={() => handleRespondToOffer('Accepted')}
            >
              {responding ? 'Confirming...' : 'Accept & Contract'}
            </button>
          </div>
        }
      >
        {offerModalApp && (
          <div>
            <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              <strong>{offerModalApp.drive?.company?.name || 'The Employer'}</strong> has formally issued an offer of appointment for the position of{' '}
              <strong>{offerModalApp.drive?.title}</strong>.
            </p>

            <div className="np-facts-strip" style={{ margin: '1rem 0' }}>
              <div className="np-fact-item">
                <div className="np-fact-label">Offered Package</div>
                <div className="np-fact-value" style={{ color: 'var(--dp-color-accent)' }}>
                  ₹{Number(offerModalApp.offer?.package || 0).toLocaleString('en-IN')}
                </div>
                <div className="np-fact-sub">Annual compensation</div>
              </div>
              <div className="np-fact-item">
                <div className="np-fact-label">Issued Date</div>
                <div className="np-fact-value" style={{ fontSize: '1.2rem' }}>
                  {offerModalApp.offer?.offeredAt
                    ? new Date(offerModalApp.offer.offeredAt).toLocaleDateString('en-IN')
                    : 'Recent'}
                </div>
                <div className="np-fact-sub">Official notification</div>
              </div>
            </div>

            <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-ink)', backgroundColor: '#fff' }}>
              <strong>Notice of Institutional Policy:</strong> Upon acceptance of this offer, your candidate placement status will permanently transition to <em>"Placed"</em>, concluding your eligibility for concurrent campus drives in accordance with placement charter rules.
            </div>
          </div>
        )}
      </Modal>

      {/* Status History / Audit Trail Modal */}
      <Modal
        isOpen={!!historyModalApp}
        onClose={() => setHistoryModalApp(null)}
        title={`Audit Trail — ${historyModalApp?.drive?.title || 'Application'}`}
        footer={
          <button type="button" className="np-btn" onClick={() => setHistoryModalApp(null)}>
            Close Audit
          </button>
        }
      >
        {historyModalApp && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="np-fact-label">Company:</span>{' '}
              <strong>{historyModalApp.drive?.company?.name}</strong> &middot;{' '}
              <span>Status: <Badge status={historyModalApp.status}>{historyModalApp.status}</Badge></span>
            </div>

            <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Sequential Progression Trail
            </h4>

            {historyModalApp.statusHistory?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {historyModalApp.statusHistory.map((step, idx) => (
                  <li
                    key={idx}
                    style={{
                      borderLeft: '2px solid var(--dp-color-ink)',
                      paddingLeft: '0.75rem',
                      paddingBottom: '0.35rem',
                    }}
                  >
                    <strong>{step.status}</strong> &mdash;{' '}
                    <span style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {new Date(step.changedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Application registered on initial status.</p>
            )}

            {historyModalApp.rejectionReasons?.length > 0 && (
              <div style={{ marginTop: '1.25rem', border: '1px solid var(--dp-color-accent)', padding: '0.85rem', backgroundColor: '#fff' }}>
                <strong style={{ color: 'var(--dp-color-accent)', textTransform: 'uppercase', fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>
                  Recorded Reasons:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                  {historyModalApp.rejectionReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Decision Notice Modal */}
      <Modal
        isOpen={!!responseNotice}
        onClose={() => setResponseNotice(null)}
        title={responseNotice?.title || 'Notice'}
        footer={
          <button type="button" className="np-btn np-btn-primary" onClick={() => setResponseNotice(null)}>
            Dismiss Notice
          </button>
        }
      >
        <p style={{ fontSize: '1rem', lineHeight: 1.4 }}>{responseNotice?.message}</p>
      </Modal>
    </div>
  )
}
