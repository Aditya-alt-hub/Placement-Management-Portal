import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    title: '',
    subject: '',
    message: '',
    recipientType: 'All Students',
  })

  // Selected announcement for inspecting text
  const [inspectedAnnouncement, setInspectedAnnouncement] = useState(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/announcements')
      setAnnouncements(res.data.announcements || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve announcement archives.')
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
    if (!form.title.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Title, subject line, and official dispatch message are all required.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        recipientType: 'All Students', // Default broadcast
      }

      await api.post('/announcements', payload)
      setSuccess('Official placement dispatch queued and distributed to student cohorts.')
      setCreating(false)
      setForm({
        title: '',
        subject: '',
        message: '',
        recipientType: 'All Students',
      })
      await fetchAnnouncements()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to dispatch official announcement.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Compiling university announcement dispatches...</p>
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
            Official Dispatches <span className="np-accent-mark">·</span> Secretarial Broadcasts
          </span>
          <h1>University Placement Dispatches</h1>
          <p className="np-subtitle">
            Issue formal announcements, procedural updates, and interview directives to student cohorts
          </p>
        </div>
        <div>
          {!creating && (
            <button
              type="button"
              className="np-btn np-btn-primary"
              onClick={() => setCreating(true)}
            >
              Draft Official Dispatch &rarr;
            </button>
          )}
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}
      {success && <div className="np-alert np-alert-success">{success}</div>}

      {/* Draft Form */}
      {creating && (
        <div className="np-panel" style={{ backgroundColor: '#ffffff', maxWidth: '780px', margin: '0 auto 2rem' }}>
          <div className="np-panel-header">
            <h2>Draft New Official Dispatch</h2>
            <button type="button" className="np-btn np-btn-sm" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="title">
                Gazette Announcement Title <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Mandatory Briefing on Spring Enterprise Recruitment"
                className="np-input"
                required
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="subject">
                Email Subject Line <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. [Placement Cell Notice] Revised Schedule for Technical Rounds"
                className="np-input"
                required
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="message">
                Official Dispatch Narrative <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder="Inscribe official instructions, policy directives, and required student actions..."
                className="np-textarea"
                required
              />
            </div>

            <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-ink)', backgroundColor: '#fff' }}>
              <strong>Distribution Scope:</strong> This dispatch will be distributed to all active, enrolled student candidates via verified institutional email.
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
              <button type="submit" className="np-btn np-btn-primary" disabled={submitting}>
                {submitting ? 'Transmitting Dispatches...' : 'Broadcast Official Dispatch'}
              </button>
              <button type="button" className="np-btn" onClick={() => setCreating(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements Table */}
      <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
        <div className="np-panel-header">
          <h2>Recorded Dispatches History</h2>
          <span className="np-fact-label">{announcements.length} Issued</span>
        </div>

        {announcements.length > 0 ? (
          <div className="np-table-container">
            <table className="np-table">
              <thead>
                <tr>
                  <th>Dispatch Headline</th>
                  <th>Subject Line</th>
                  <th>Distribution Target</th>
                  <th>Delivery Status</th>
                  <th>Issued By</th>
                  <th>Transmission Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <tr key={ann._id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem' }}>
                        {ann.title}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.9rem' }}>{ann.subject}</span>
                    </td>
                    <td>
                      <Badge variant="filled">{ann.recipientType || 'All Students'}</Badge>
                      <div style={{ fontSize: '0.8rem', color: 'var(--dp-color-secondary)', marginTop: '0.15rem' }}>
                        {ann.totalRecipients || 0} scholars
                      </div>
                    </td>
                    <td>
                      <Badge status={ann.status}>{ann.status}</Badge>
                      <div style={{ fontSize: '0.8rem', color: 'var(--dp-color-secondary)', marginTop: '0.15rem' }}>
                        Delivered: {ann.successfulEmails ?? 0} &middot; Failed: {ann.failedEmails ?? 0}
                      </div>
                    </td>
                    <td>
                      <strong>{ann.sentBy?.name || 'Administrator'}</strong>
                    </td>
                    <td>
                      {ann.sentAt || ann.createdAt
                        ? new Date(ann.sentAt || ann.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="np-btn np-btn-sm"
                        onClick={() => setInspectedAnnouncement(ann)}
                      >
                        Inspect Text
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', padding: '2rem 0', textAlign: 'center' }}>
            No official dispatches on file.
          </p>
        )}
      </div>

      {/* Inspect Dispatch Modal */}
      <Modal
        isOpen={!!inspectedAnnouncement}
        onClose={() => setInspectedAnnouncement(null)}
        title={inspectedAnnouncement?.title || 'Dispatch Inscription'}
        footer={
          <button type="button" className="np-btn np-btn-primary" onClick={() => setInspectedAnnouncement(null)}>
            Close
          </button>
        }
      >
        {inspectedAnnouncement && (
          <div>
            <div style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <span className="np-fact-label">Subject Line:</span>
              <p style={{ fontWeight: 700, margin: '0.2rem 0' }}>{inspectedAnnouncement.subject}</p>
              <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                Target: {inspectedAnnouncement.recipientType} &middot; Sent By:{' '}
                {inspectedAnnouncement.sentBy?.name || 'Administrator'}
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--dp-typography-reading)',
                fontSize: '1rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}
            >
              {inspectedAnnouncement.message}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
