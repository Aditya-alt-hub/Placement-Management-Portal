import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const ROUND_SEQUENCE = ['Coding', 'Technical', 'HR', 'Final']

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Schedule Interview Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    round: 'Technical',
    interviewDate: '',
    mode: 'Online',
    meetingLink: '',
    location: '',
  })

  // Update Result Modal
  const [resultModalInterview, setResultModalInterview] = useState(null)
  const [updatingResult, setUpdatingResult] = useState(false)
  const [resultForm, setResultForm] = useState({
    result: 'Passed',
    feedback: '',
  })

  // Notice Modal
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [intRes, appsRes] = await Promise.all([
        api.get('/interviews/recruiter'),
        api.get('/applications/recruiter'),
      ])
      setInterviews(intRes.data.interviews || [])
      setApplications(appsRes.data.applications || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve interview boards.')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!scheduleForm.applicationId || !scheduleForm.interviewDate) {
      setNotice({ type: 'error', title: 'Missing Inscription', message: 'Please select candidate and interview date/time.' })
      return
    }

    if (scheduleForm.mode === 'Online' && !scheduleForm.meetingLink) {
      setNotice({ type: 'error', title: 'Meeting Link Required', message: 'Online interviews require an active meeting chamber link.' })
      return
    }

    if (scheduleForm.mode === 'Offline' && !scheduleForm.location) {
      setNotice({ type: 'error', title: 'Location Required', message: 'Offline interviews require a designated campus venue location.' })
      return
    }

    setScheduling(true)
    try {
      const res = await api.post('/interviews', scheduleForm)
      setNotice({
        type: 'success',
        title: 'Interview Board Scheduled',
        message: res.data.message || 'Interview board scheduled and candidate dispatched an automated summons.',
      })
      setScheduleModalOpen(false)
      setScheduleForm({
        applicationId: '',
        round: 'Technical',
        interviewDate: '',
        mode: 'Online',
        meetingLink: '',
        location: '',
      })
      await fetchData()
    } catch (err) {
      setNotice({
        type: 'error',
        title: 'Scheduling Disallowed',
        message: err?.response?.data?.message || 'Could not schedule interview board.',
      })
    } finally {
      setScheduling(false)
    }
  }

  const handleResultSubmit = async (e) => {
    e.preventDefault()
    if (!resultModalInterview) return
    setUpdatingResult(true)
    try {
      const res = await api.patch(`/interviews/${resultModalInterview._id}/result`, {
        result: resultForm.result, // "Passed" or "Failed"
        feedback: resultForm.feedback.trim(),
      })
      setNotice({
        type: 'success',
        title: 'Result Inscribed into Ledger',
        message:
          res.data.message ||
          `Evaluation result recorded. ${res.data.nextRound ? `Advanced to ${res.data.nextRound} round.` : ''}`,
      })
      setResultModalInterview(null)
      await fetchData()
    } catch (err) {
      setNotice({
        type: 'error',
        title: 'Result Update Error',
        message: err?.response?.data?.message || 'Failed to update interview evaluation result.',
      })
    } finally {
      setUpdatingResult(false)
    }
  }

  // Applications eligible for scheduling (status: Shortlisted)
  const eligibleApps = applications.filter((a) => a.status === 'Shortlisted')

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Compiling corporate interview board calendars...</p>
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
            Evaluation Rosters <span className="np-accent-mark">·</span> Corporate Interview Panels
          </span>
          <h1>Interview Boards Calendar</h1>
          <p className="np-subtitle">
            Schedule sequential rounds (Coding, Technical, HR, Final) and record board evaluations
          </p>
        </div>
        <div>
          <button
            type="button"
            className="np-btn np-btn-primary"
            onClick={() => setScheduleModalOpen(true)}
            disabled={eligibleApps.length === 0}
            title={eligibleApps.length === 0 ? 'Shortlist a candidate first to schedule an interview' : ''}
          >
            Schedule Interview Board &rarr;
          </button>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      {eligibleApps.length === 0 && (
        <div className="np-alert" style={{ borderLeft: '4px solid var(--dp-color-rule)', backgroundColor: '#fff' }}>
          <strong>Notice:</strong> No candidates are currently in &ldquo;Shortlisted&rdquo; status awaiting an interview schedule.{' '}
          Advance candidates from the candidate pipeline to enable scheduling.
        </div>
      )}

      {/* Interviews Table */}
      {interviews.length > 0 ? (
        <div className="np-table-container">
          <table className="np-table">
            <thead>
              <tr>
                <th>Candidate Scholar</th>
                <th>Placement Drive</th>
                <th>Round</th>
                <th>Date & Time</th>
                <th>Mode / Venue</th>
                <th>Board Status</th>
                <th>Recorded Verdict</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((it) => (
                <tr key={it._id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem' }}>
                      {it.student?.user?.name || 'Candidate'}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                      {it.student?.course} ({it.student?.branch}) &middot; CGPA: {it.student?.cgpa}
                    </div>
                  </td>
                  <td>
                    <strong>{it.application?.drive?.title || 'Drive'}</strong>
                  </td>
                  <td>
                    <Badge variant="filled">{it.round}</Badge>
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
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      {it.mode === 'Online' ? (
                        it.meetingLink ? (
                          <a href={it.meetingLink} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                            Join Chamber &rarr;
                          </a>
                        ) : (
                          'Link Pending'
                        )
                      ) : (
                        it.location || 'On Campus'
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge status={it.status}>{it.status}</Badge>
                  </td>
                  <td>
                    <Badge status={it.result || 'Pending'}>{it.result || 'Pending'}</Badge>
                    {it.feedback && (
                      <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.2rem', color: 'var(--dp-color-secondary)' }}>
                        &ldquo;{it.feedback}&rdquo;
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {it.status === 'Scheduled' && (
                      <button
                        type="button"
                        className="np-btn np-btn-sm np-btn-primary"
                        onClick={() => {
                          setResultModalInterview(it)
                          setResultForm({ result: 'Passed', feedback: '' })
                        }}
                      >
                        Inscribe Verdict
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="np-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--dp-color-secondary)', marginBottom: '1rem' }}>
            No interview boards scheduled yet.
          </p>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Convene Evaluation Board"
      >
        <form onSubmit={handleScheduleSubmit}>
          <div className="np-form-group">
            <label className="np-label" htmlFor="applicationId">
              Select Candidate & Placement Drive <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
            </label>
            <select
              id="applicationId"
              className="np-select"
              value={scheduleForm.applicationId}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, applicationId: e.target.value }))}
              required
            >
              <option value="">Choose Shortlisted Candidate</option>
              {eligibleApps.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.student?.user?.name} &mdash; {a.drive?.title} ({a.student?.branch})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="round">
                Evaluation Round <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <select
                id="round"
                className="np-select"
                value={scheduleForm.round}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, round: e.target.value }))}
                required
              >
                {ROUND_SEQUENCE.map((r) => (
                  <option key={r} value={r}>
                    {r} Round
                  </option>
                ))}
              </select>
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="interviewDate">
                Date & Time <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="interviewDate"
                type="datetime-local"
                className="np-input"
                value={scheduleForm.interviewDate}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, interviewDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="np-form-group">
            <label className="np-label" htmlFor="mode">
              Interview Chamber Mode <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
            </label>
            <select
              id="mode"
              className="np-select"
              value={scheduleForm.mode}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, mode: e.target.value }))}
              required
            >
              <option value="Online">Online (Video Meeting Link)</option>
              <option value="Offline">Offline (Campus Room / Venue)</option>
            </select>
          </div>

          {scheduleForm.mode === 'Online' ? (
            <div className="np-form-group">
              <label className="np-label" htmlFor="meetingLink">
                Online Video Room Link <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="meetingLink"
                type="url"
                className="np-input"
                placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom Link"
                value={scheduleForm.meetingLink}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
                required
              />
            </div>
          ) : (
            <div className="np-form-group">
              <label className="np-label" htmlFor="location">
                Campus Venue & Chamber <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <input
                id="location"
                type="text"
                className="np-input"
                placeholder="e.g. Placement Cell Conference Room 3B"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="np-btn" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="np-btn np-btn-primary" disabled={scheduling}>
              {scheduling ? 'Convening Board...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Verdict Modal */}
      <Modal
        isOpen={!!resultModalInterview}
        onClose={() => setResultModalInterview(null)}
        title="Record Board Evaluation Verdict"
      >
        <form onSubmit={handleResultSubmit}>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Inscribe the outcome for{' '}
            <strong>{resultModalInterview?.student?.user?.name}</strong> in the{' '}
            <strong>{resultModalInterview?.round} Round</strong>.
          </p>

          <div className="np-form-group">
            <label className="np-label" htmlFor="result">
              Evaluation Verdict <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
            </label>
            <select
              id="result"
              className="np-select"
              value={resultForm.result}
              onChange={(e) => setResultForm((prev) => ({ ...prev, result: e.target.value }))}
              required
            >
              <option value="Passed">Passed (Advance to Next Stage / Final Selection)</option>
              <option value="Failed">Failed (Conclude Candidacy)</option>
            </select>
          </div>

          <div className="np-form-group">
            <label className="np-label" htmlFor="feedback">
              Evaluation Board Remarks & Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              className="np-textarea"
              rows={3}
              value={resultForm.feedback}
              onChange={(e) => setResultForm((prev) => ({ ...prev, feedback: e.target.value }))}
              placeholder="Record technical competence, communication remarks, and board assessment notes..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="np-btn" onClick={() => setResultModalInterview(null)}>
              Cancel
            </button>
            <button type="submit" className="np-btn np-btn-primary" disabled={updatingResult}>
              {updatingResult ? 'Writing Inscription...' : 'Submit Evaluation Verdict'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Notice Modal */}
      <Modal
        isOpen={!!notice}
        onClose={() => setNotice(null)}
        title={notice?.title || 'Dispatch Notice'}
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
