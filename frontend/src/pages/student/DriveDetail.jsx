import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function DriveDetail() {
  const { id } = useParams()
  const [drive, setDrive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyResultModal, setApplyResultModal] = useState(null)

  useEffect(() => {
    fetchDrive()
  }, [id])

  const fetchDrive = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/drives/${id}`)
      setDrive(res.data.drive || res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve placement drive dossier.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const res = await api.post(`/applications/apply/${id}`)
      if (res.data.eligible) {
        setApplyResultModal({
          title: 'Application Deposited Successfully',
          type: 'success',
          message: res.data.message || 'Candidate credentials satisfied all published thresholds. Your application has been submitted to the recruitment committee.',
          reasons: [],
        })
      } else {
        setApplyResultModal({
          title: 'Automated Ineligibility Notification',
          type: 'warning',
          message: res.data.message || 'Your academic metrics did not fulfill the requirements stipulated by this recruiter:',
          reasons: res.data.reasons || [],
        })
      }
    } catch (err) {
      setApplyResultModal({
        title: 'Submission Incomplete',
        type: 'error',
        message: err?.response?.data?.message || 'Application could not be submitted.',
        reasons: [],
      })
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Extracting drive specifications from archives...</p>
        </div>
      </div>
    )
  }

  if (error || !drive) {
    return (
      <div className="main-content">
        <div className="np-alert np-alert-error">{error || 'Placement drive not found.'}</div>
        <Link to="/student/drives" className="np-btn">&larr; Return to Open Drives</Link>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="np-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="np-section-tag">
            Drive Specification <span className="np-accent-mark">·</span> Gazette Dossier #{drive._id?.slice(-6)?.toUpperCase()}
          </span>
          <h1>{drive.title}</h1>
          <p className="np-subtitle">
            Conducted by <strong>{drive.company?.name || 'Recruiting Partner'}</strong> &middot;{' '}
            {drive.company?.industry || 'Corporate Sector'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/student/drives" className="np-btn np-btn-sm">
            &larr; All Drives
          </Link>
          <button
            type="button"
            className="np-btn np-btn-primary"
            onClick={handleApply}
            disabled={applying || drive.status === 'Closed' || drive.status === 'Completed'}
          >
            {applying ? 'Submitting...' : 'Submit Candidature'}
          </button>
        </div>
      </div>

      {/* Factual Strip */}
      <section className="np-facts-strip">
        <div className="np-fact-item">
          <div className="np-fact-label">Classification</div>
          <div className="np-fact-value" style={{ fontSize: '1.4rem' }}>{drive.jobType || 'Full Time'}</div>
          <div className="np-fact-sub">Employment model</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Annual Package</div>
          <div className="np-fact-value" style={{ fontSize: '1.4rem' }}>
            {drive.salary ? `₹${Number(drive.salary).toLocaleString('en-IN')}` : 'Undisclosed'}
          </div>
          <div className="np-fact-sub">Per Annum (CTC)</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Location / Hub</div>
          <div className="np-fact-value" style={{ fontSize: '1.4rem' }}>{drive.location || 'Multiple'}</div>
          <div className="np-fact-sub">Primary workplace</div>
        </div>
        <div className="np-fact-item">
          <div className="np-fact-label">Application Deadline</div>
          <div className="np-fact-value" style={{ fontSize: '1.3rem' }}>
            {drive.applicationDeadline
              ? new Date(drive.applicationDeadline).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Open'}
          </div>
          <div className="np-fact-sub">Final date for submission</div>
        </div>
      </section>

      {/* 3:1 Spread: Role Description beside Eligibility Rubric */}
      <div className="np-lead-spread">
        {/* Main Column */}
        <div>
          <article className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>Role Specifications & Brief</h2>
              <Badge status={drive.status}>{drive.status}</Badge>
            </div>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {drive.description || 'No detailed descriptive narrative inscribed for this placement drive.'}
            </div>

            {drive.driveDate && (
              <div style={{ marginTop: '1.5rem', padding: '0.85rem', border: 'var(--dp-border-hairline) solid var(--dp-color-rule)' }}>
                <strong>Scheduled Drive Evaluation Date:</strong>{' '}
                {new Date(drive.driveDate).toLocaleString('en-IN', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </div>
            )}
          </article>

          {/* Corporate Background */}
          {drive.company && (
            <article className="np-panel" style={{ backgroundColor: '#ffffff' }}>
              <div className="np-panel-header">
                <h2>Corporate Enterprise Intelligence</h2>
              </div>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {drive.company.description || 'Enterprise profile on file with the university placement registry.'}
              </p>
              {drive.company.website && (
                <div style={{ fontSize: '0.9rem' }}>
                  <span>Official Corporate Website: </span>
                  <a href={drive.company.website} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                    {drive.company.website} &rarr;
                  </a>
                </div>
              )}
            </article>
          )}
        </div>

        {/* Sidebar: Strict Eligibility Rubric */}
        <aside>
          <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h3>Eligibility Rubric</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>
              Automated compliance engine evaluates candidate files against these boundaries at moment of application.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.4rem' }}>
                <span className="np-fact-label">Minimum CGPA Required:</span>
                <strong>{drive.eligibility?.minCgpa ?? 'Unrestricted'}</strong>
              </div>

              <div style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.4rem' }}>
                <span className="np-fact-label">12th Standard Threshold:</span>
                <strong>
                  {drive.eligibility?.minTwelfthPercentage
                    ? `${drive.eligibility.minTwelfthPercentage}%`
                    : 'Unrestricted'}
                </strong>
              </div>

              <div style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.4rem' }}>
                <span className="np-fact-label">10th Standard Threshold:</span>
                <strong>
                  {drive.eligibility?.minTenthPercentage
                    ? `${drive.eligibility.minTenthPercentage}%`
                    : 'Unrestricted'}
                </strong>
              </div>

              <div style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.4rem' }}>
                <span className="np-fact-label">Eligible Graduation Cohort:</span>
                <strong>{drive.eligibility?.graduationYear || 'All Batches'}</strong>
              </div>

              <div style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.4rem' }}>
                <span className="np-fact-label">Active Backlogs Protocol:</span>
                <strong style={{ color: drive.eligibility?.backlogsAllowed ? 'inherit' : 'var(--dp-color-accent)' }}>
                  {drive.eligibility?.backlogsAllowed ? 'Backlogs Permitted' : 'Strictly Zero Backlogs'}
                </strong>
              </div>

              <div>
                <span className="np-fact-label">Permitted Disciplines / Branches:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                  {drive.eligibility?.allowedBranches?.length > 0 ? (
                    drive.eligibility.allowedBranches.map((br, idx) => (
                      <span key={idx} className="np-badge">
                        {br}
                      </span>
                    ))
                  ) : (
                    <span className="np-badge">All Disciplines Eligible</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="np-btn np-btn-primary"
                onClick={handleApply}
                disabled={applying || drive.status === 'Closed' || drive.status === 'Completed'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {applying ? 'Evaluating Credentials...' : 'Submit Formal Candidature'}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={!!applyResultModal}
        onClose={() => setApplyResultModal(null)}
        title={applyResultModal?.title || 'Dispatch Notice'}
        footer={
          <button type="button" className="np-btn np-btn-primary" onClick={() => setApplyResultModal(null)}>
            Dismiss Notice
          </button>
        }
      >
        <p style={{ fontSize: '1rem', lineHeight: 1.4, marginBottom: '1rem' }}>
          {applyResultModal?.message}
        </p>

        {applyResultModal?.reasons?.length > 0 && (
          <div
            style={{
              border: 'var(--dp-border-hairline) solid var(--dp-color-accent)',
              padding: '0.85rem 1rem',
              backgroundColor: '#fff',
            }}
          >
            <strong style={{ color: 'var(--dp-color-accent)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
              Disqualification Log:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--dp-color-ink)' }}>
              {applyResultModal.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  )
}
