import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/interviews/my-interviews')
      setInterviews(res.data.interviews || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve scheduled interview calendar.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Accessing scheduled candidate evaluation panels...</p>
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
            Candidate Assessment <span className="np-accent-mark">·</span> Board Calendars
          </span>
          <h1>Scheduled Interview Boards</h1>
          <p className="np-subtitle">
            Formal evaluation sessions scheduled across Coding, Technical, HR, and Final Selection rounds
          </p>
        </div>
        <div>
          <button type="button" className="np-btn np-btn-sm" onClick={fetchInterviews}>
            Refresh Schedule
          </button>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {/* Interviews Table / Spreads */}
      {interviews.length > 0 ? (
        <div className="np-table-container">
          <table className="np-table">
            <thead>
              <tr>
                <th>Evaluation Round</th>
                <th>Placement Drive & Role</th>
                <th>Scheduled Date & Time</th>
                <th>Mode / Meeting Details</th>
                <th>Board Status</th>
                <th>Recorded Result</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((it) => (
                <tr key={it._id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.1rem' }}>
                      {it.round} Evaluation
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      Board Ref #{it._id.slice(-6).toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <strong>{it.application?.drive?.title || 'Placement Drive'}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {it.application?.drive?.company?.name || it.recruiter?.name || 'Recruiter Committee'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>
                      {new Date(it.interviewDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {new Date(it.interviewDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td>
                    <Badge variant={it.mode === 'Online' ? 'filled' : ''}>{it.mode}</Badge>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
                      {it.mode === 'Online' ? (
                        it.meetingLink ? (
                          <a
                            href={it.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontWeight: 700, color: 'var(--dp-color-ink)' }}
                          >
                            Enter Video Chamber &rarr;
                          </a>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)' }}>
                            Meeting link to be provided
                          </span>
                        )
                      ) : (
                        <span>{it.location || 'University Placement Complex'}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge status={it.status}>{it.status}</Badge>
                  </td>
                  <td>
                    <Badge status={it.result || 'Pending'}>{it.result || 'Pending'}</Badge>
                    {it.feedback && (
                      <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.25rem', color: 'var(--dp-color-secondary)' }}>
                        &ldquo;{it.feedback}&rdquo;
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="np-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--dp-color-secondary)', marginBottom: '1rem' }}>
            No scheduled interview boards on your candidate record.
          </p>
          <Link to="/student/applications" className="np-btn">
            Inspect Submitted Applications
          </Link>
        </div>
      )}
    </div>
  )
}
