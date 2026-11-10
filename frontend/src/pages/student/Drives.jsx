import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function StudentDrives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterJobType, setFilterJobType] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Application feedback modal
  const [applyingId, setApplyingId] = useState(null)
  const [applyResultModal, setApplyResultModal] = useState(null)

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/drives/available-drives')
      setDrives(res.data.drives || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve available drives.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (driveId, driveTitle) => {
    setApplyingId(driveId)
    try {
      const res = await api.post(`/applications/apply/${driveId}`)
      if (res.data.eligible) {
        setApplyResultModal({
          title: `Application Accepted — ${driveTitle}`,
          type: 'success',
          message: res.data.message || 'Your credentials satisfied all qualification thresholds. Application registered.',
          reasons: [],
        })
      } else {
        setApplyResultModal({
          title: `Automated Ineligibility Notice — ${driveTitle}`,
          type: 'warning',
          message: res.data.message || 'Your candidate metrics did not satisfy one or more recruiter criteria:',
          reasons: res.data.reasons || [],
        })
      }
    } catch (err) {
      setApplyResultModal({
        title: 'Application Submission Error',
        type: 'error',
        message: err?.response?.data?.message || 'Could not complete application submission.',
        reasons: [],
      })
    } finally {
      setApplyingId(null)
    }
  }

  const filteredDrives = drives.filter((d) => {
    const matchesJob = filterJobType === 'All' || d.jobType === filterJobType
    const matchesSearch =
      searchTerm === '' ||
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesJob && matchesSearch
  })

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Querying active recruitment notices from portal dispatch...</p>
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
            Gazette Bulletins <span className="np-accent-mark">·</span> Open Recruitment Notices
          </span>
          <h1>Available Placement Drives</h1>
          <p className="np-subtitle">
            Enterprise recruitment drives currently accepting formal student candidatures
          </p>
        </div>
        <div>
          <button type="button" className="np-btn np-btn-sm" onClick={fetchDrives}>
            Refresh Notices
          </button>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Filter and Search Bar */}
      <div
        className="np-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="np-label" style={{ margin: 0 }}>Filter Classification:</span>
          {['All', 'Full Time', 'Internship', 'Internship + Full Time'].map((type) => (
            <button
              key={type}
              type="button"
              className={`np-btn np-btn-sm ${filterJobType === type ? 'np-btn-primary' : ''}`}
              onClick={() => setFilterJobType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            className="np-input"
            placeholder="Search by role, firm, or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.4rem 0.65rem', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Drives Comparison Listing */}
      {filteredDrives.length > 0 ? (
        <div className="np-table-container">
          <table className="np-table">
            <thead>
              <tr>
                <th>Recruitment Notice</th>
                <th>Enterprise Partner</th>
                <th>Terms & Location</th>
                <th>Eligibility Criteria</th>
                <th>Deadline</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrives.map((d) => (
                <tr key={d._id}>
                  <td>
                    <Link
                      to={`/student/drives/${d._id}`}
                      style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem', fontWeight: 800, textDecoration: 'none' }}
                    >
                      {d.title}
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      Status: <Badge status={d.status}>{d.status}</Badge>
                    </div>
                  </td>
                  <td>
                    <strong>{d.company?.name || 'Recruiter'}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {d.company?.industry || 'Enterprise'}
                    </div>
                  </td>
                  <td>
                    <Badge variant="filled">{d.jobType || 'Full Time'}</Badge>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 700 }}>
                      {d.salary ? `₹${Number(d.salary).toLocaleString('en-IN')} p.a.` : 'Industry Standard'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>{d.location || 'Pan India'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.35 }}>
                      <div>Min CGPA: <strong>{d.eligibility?.minCgpa ?? 'N/A'}</strong></div>
                      <div>
                        Branches:{' '}
                        <strong>
                          {d.eligibility?.allowedBranches?.length > 0
                            ? d.eligibility.allowedBranches.join(', ')
                            : 'All Eligible'}
                        </strong>
                      </div>
                      <div>
                        Backlogs:{' '}
                        <strong>{d.eligibility?.backlogsAllowed ? 'Permitted' : 'Strictly Nil'}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    {d.applicationDeadline ? (
                      <span style={{ fontSize: '0.9rem' }}>
                        {new Date(d.applicationDeadline).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      'Open'
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link to={`/student/drives/${d._id}`} className="np-btn np-btn-sm">
                        Inspect
                      </Link>
                      <button
                        type="button"
                        className="np-btn np-btn-primary np-btn-sm"
                        onClick={() => handleApply(d._id, d.title)}
                        disabled={applyingId === d._id}
                      >
                        {applyingId === d._id ? 'Submitting...' : 'Apply Now'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--dp-color-secondary)' }}>
            No open placement drives correspond with the chosen criteria.
          </p>
        </div>
      )}

      {/* Application Result Modal */}
      <Modal
        isOpen={!!applyResultModal}
        onClose={() => setApplyResultModal(null)}
        title={applyResultModal?.title || 'Notice'}
        footer={
          <button type="button" className="np-btn np-btn-primary" onClick={() => setApplyResultModal(null)}>
            Acknowledge & Close
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
              Recorded Ineligibility Rationales:
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
