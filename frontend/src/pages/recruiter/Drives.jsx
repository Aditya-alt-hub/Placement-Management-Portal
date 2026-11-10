import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function RecruiterDrives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDrive, setDeleteDrive] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/drives/my-drives')
      setDrives(res.data.drives || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve recruitment drives.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDrive) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/drives/${deleteDrive._id}`)
      await fetchDrives()
      setDeleteDrive(null)
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete placement drive.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Querying corporate placement drive registers...</p>
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
            Campaign Registry <span className="np-accent-mark">·</span> Corporate Drives
          </span>
          <h1>Placement Drives Management</h1>
          <p className="np-subtitle">
            Configure recruitment titles, compensation brackets, eligibility rubrics, and deadlines
          </p>
        </div>
        <div>
          <Link to="/recruiter/drives/new" className="np-btn np-btn-primary">
            Publish New Placement Drive &rarr;
          </Link>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Drives Table */}
      {drives.length > 0 ? (
        <div className="np-table-container">
          <table className="np-table">
            <thead>
              <tr>
                <th>Drive Designation</th>
                <th>Classification</th>
                <th>Annual Package</th>
                <th>Application Cutoff</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((d) => (
                <tr key={d._id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem' }}>
                      {d.title}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      Location: {d.location || 'Multiple'} &middot; Min CGPA: {d.eligibility?.minCgpa ?? 'None'}
                    </div>
                  </td>
                  <td>
                    <Badge variant="filled">{d.jobType || 'Full Time'}</Badge>
                  </td>
                  <td>
                    <strong>
                      {d.salary ? `₹${Number(d.salary).toLocaleString('en-IN')} p.a.` : 'Competitive'}
                    </strong>
                  </td>
                  <td>
                    {d.applicationDeadline
                      ? new Date(d.applicationDeadline).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Open'}
                  </td>
                  <td>
                    <Badge status={d.status}>{d.status}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link to={`/recruiter/drives/${d._id}/edit`} className="np-btn np-btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="np-btn np-btn-danger np-btn-sm"
                        onClick={() => setDeleteDrive(d)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="np-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--dp-color-secondary)', marginBottom: '1.25rem' }}>
            No placement drives currently active under your corporate entity.
          </p>
          <Link to="/recruiter/drives/new" className="np-btn np-btn-primary">
            Draft First Placement Drive
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteDrive}
        onClose={() => setDeleteDrive(null)}
        title="Confirm Drive Cancellation"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="np-btn" onClick={() => setDeleteDrive(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="np-btn np-btn-danger"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Expunging...' : 'Permanently Delete Drive'}
            </button>
          </div>
        }
      >
        <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
          Are you certain you wish to delete the placement drive titled{' '}
          <strong>&ldquo;{deleteDrive?.title}&rdquo;</strong>?
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-accent)', fontStyle: 'italic' }}>
          This action will expunge the drive and its eligibility rubric from the public gazette.
        </p>
        {deleteError && <div className="np-alert np-alert-error" style={{ marginTop: '1rem' }}>{deleteError}</div>}
      </Modal>
    </div>
  )
}
