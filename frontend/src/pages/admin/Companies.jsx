import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterState, setFilterState] = useState('All')
  const [approvingId, setApprovingId] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/companies/admin/get-allCompanies')
      setCompanies(res.data.companies || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve corporate entities.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (companyId, companyName) => {
    setApprovingId(companyId)
    try {
      const res = await api.patch(`/companies/${companyId}/approve`)
      setNotice({
        type: 'success',
        title: 'Entity Accredited',
        message: res.data.message || `Enterprise "${companyName}" has been successfully accredited. Recruiter is now authorized to launch drives.`,
      })
      await fetchCompanies()
    } catch (err) {
      setNotice({
        type: 'error',
        title: 'Accreditation Error',
        message: err?.response?.data?.message || 'Failed to approve corporate entity.',
      })
    } finally {
      setApprovingId(null)
    }
  }

  const filteredCompanies = companies.filter((c) => {
    if (filterState === 'Pending') return !c.isApproved
    if (filterState === 'Approved') return c.isApproved
    return true
  })

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Querying university corporate accreditation register...</p>
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
            Administration Vetting Desk <span className="np-accent-mark">·</span> Corporate Relations
          </span>
          <h1>Corporate Enterprise Accreditations</h1>
          <p className="np-subtitle">
            Validate enterprise partners, review recruiter credentials, and sanction recruitment permissions
          </p>
        </div>
        <div>
          <button type="button" className="np-btn np-btn-sm" onClick={fetchCompanies}>
            Refresh Register
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
        <span className="np-label" style={{ margin: 0 }}>Filter Accreditation:</span>
        {[
          { key: 'All', label: `All Entities (${companies.length})` },
          { key: 'Pending', label: `Pending Review (${companies.filter((c) => !c.isApproved).length})` },
          { key: 'Approved', label: `Approved Partners (${companies.filter((c) => c.isApproved).length})` },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            className={`np-btn np-btn-sm ${filterState === f.key ? 'np-btn-primary' : ''}`}
            onClick={() => setFilterState(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Companies Table */}
      {filteredCompanies.length > 0 ? (
        <div className="np-table-container">
          <table className="np-table">
            <thead>
              <tr>
                <th>Enterprise Entity</th>
                <th>Designated Recruiter</th>
                <th>Sector & Hub</th>
                <th>Accreditation Status</th>
                <th style={{ textAlign: 'right' }}>Administrative Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((comp) => (
                <tr key={comp._id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.1rem' }}>
                      {comp.name}
                    </strong>
                    {comp.website && (
                      <div style={{ fontSize: '0.85rem' }}>
                        <a href={comp.website} target="_blank" rel="noreferrer">
                          {comp.website}
                        </a>
                      </div>
                    )}
                    {comp.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', margin: '0.25rem 0', maxWidth: '400px' }}>
                        {comp.description}
                      </p>
                    )}
                  </td>
                  <td>
                    <strong>{comp.recruiter?.name || 'Recruiter Officer'}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {comp.recruiter?.email}
                    </div>
                  </td>
                  <td>
                    <div>{comp.industry || 'General Industry'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {comp.location || 'Multiple Centers'}
                    </div>
                  </td>
                  <td>
                    <Badge status={comp.isApproved ? 'Approved' : 'Pending'}>
                      {comp.isApproved ? 'Approved Partner' : 'Awaiting Review'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!comp.isApproved ? (
                      <button
                        type="button"
                        className="np-btn np-btn-primary np-btn-sm"
                        disabled={approvingId === comp._id}
                        onClick={() => handleApprove(comp._id, comp.name)}
                      >
                        {approvingId === comp._id ? 'Validating...' : 'Sanction Approval'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', fontStyle: 'italic' }}>
                        Accredited
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="np-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--dp-color-secondary)' }}>
            No corporate entities recorded in this accreditation category.
          </p>
        </div>
      )}

      {/* Notice Modal */}
      <Modal
        isOpen={!!notice}
        onClose={() => setNotice(null)}
        title={notice?.title || 'Notice'}
        footer={
          <button type="button" className="np-btn np-btn-primary" onClick={() => setNotice(null)}>
            Acknowledge
          </button>
        }
      >
        <p style={{ fontSize: '1rem', lineHeight: 1.4 }}>{notice?.message}</p>
      </Modal>
    </div>
  )
}
