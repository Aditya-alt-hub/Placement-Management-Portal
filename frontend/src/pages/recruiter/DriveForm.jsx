import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'AI/DS', 'Other']
const JOB_TYPES = ['Full Time', 'Internship', 'Internship + Full Time']
const STATUS_OPTIONS = ['Upcoming', 'Open', 'Closed', 'Completed']

const defaultForm = {
  title: '',
  description: '',
  jobType: 'Full Time',
  salary: '',
  location: '',
  applicationDeadline: '',
  driveDate: '',
  status: 'Open',
  eligibility: {
    minCgpa: '',
    minTenthPercentage: '',
    minTwelfthPercentage: '',
    allowedBranches: [],
    graduationYear: '',
    backlogsAllowed: false,
  },
}

export default function DriveForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      api.get(`/drives/${id}`)
        .then((res) => {
          const d = res.data.drive || res.data
          setForm({
            title: d.title || '',
            description: d.description || '',
            jobType: d.jobType || 'Full Time',
            salary: d.salary !== undefined ? String(d.salary) : '',
            location: d.location || '',
            applicationDeadline: d.applicationDeadline ? d.applicationDeadline.slice(0, 10) : '',
            driveDate: d.driveDate ? d.driveDate.slice(0, 10) : '',
            status: d.status || 'Open',
            eligibility: {
              minCgpa: d.eligibility?.minCgpa !== undefined ? String(d.eligibility.minCgpa) : '',
              minTenthPercentage: d.eligibility?.minTenthPercentage !== undefined ? String(d.eligibility.minTenthPercentage) : '',
              minTwelfthPercentage: d.eligibility?.minTwelfthPercentage !== undefined ? String(d.eligibility.minTwelfthPercentage) : '',
              allowedBranches: d.eligibility?.allowedBranches || [],
              graduationYear: d.eligibility?.graduationYear !== undefined ? String(d.eligibility.graduationYear) : '',
              backlogsAllowed: !!d.eligibility?.backlogsAllowed,
            },
          })
        })
        .catch((err) => {
          setError(err?.response?.data?.message || 'Failed to retrieve placement drive record.')
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleEligibilityChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [name]: type === 'checkbox' ? checked : value,
      },
    }))
    setError('')
  }

  const handleBranchToggle = (branch) => {
    setForm((prev) => {
      const current = prev.eligibility.allowedBranches || []
      const next = current.includes(branch)
        ? current.filter((b) => b !== branch)
        : [...current, branch]
      return {
        ...prev,
        eligibility: {
          ...prev.eligibility,
          allowedBranches: next,
        },
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Drive designation title is required.')
      return
    }

    setSubmitting(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      jobType: form.jobType,
      salary: form.salary ? Number(form.salary) : undefined,
      location: form.location.trim(),
      applicationDeadline: form.applicationDeadline || undefined,
      driveDate: form.driveDate || undefined,
      status: form.status,
      eligibility: {
        minCgpa: form.eligibility.minCgpa !== '' ? Number(form.eligibility.minCgpa) : undefined,
        minTenthPercentage: form.eligibility.minTenthPercentage !== '' ? Number(form.eligibility.minTenthPercentage) : undefined,
        minTwelfthPercentage: form.eligibility.minTwelfthPercentage !== '' ? Number(form.eligibility.minTwelfthPercentage) : undefined,
        allowedBranches: form.eligibility.allowedBranches,
        graduationYear: form.eligibility.graduationYear !== '' ? Number(form.eligibility.graduationYear) : undefined,
        backlogsAllowed: Boolean(form.eligibility.backlogsAllowed),
      },
    }

    try {
      if (isEdit) {
        await api.put(`/drives/${id}`, payload)
      } else {
        await api.post('/drives', payload)
      }
      navigate('/recruiter/drives')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to persist placement drive specifications.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Loading drive specification template...</p>
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
            Drive Architect <span className="np-accent-mark">·</span> {isEdit ? 'Revision' : 'Drafting'}
          </span>
          <h1>{isEdit ? 'Revise Placement Drive' : 'Draft New Placement Drive'}</h1>
          <p className="np-subtitle">
            Configure job specifications, annual terms, and qualification screening rules
          </p>
        </div>
        <div>
          <Link to="/recruiter/drives" className="np-btn np-btn-sm">
            &larr; Return to Drives
          </Link>
        </div>
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}

      <div className="np-panel" style={{ backgroundColor: '#ffffff', maxWidth: '860px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Section: Core Role Details */}
          <h2 style={{ fontSize: '1.25rem', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-ink)', paddingBottom: '0.4rem' }}>
            I. Role Specifications & Terms
          </h2>

          <div className="np-form-group">
            <label className="np-label" htmlFor="title">
              Drive Designation / Job Title <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Associate Software Engineer, Data Scientist, Systems Analyst"
              className="np-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="jobType">
                Employment Model <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
              </label>
              <select id="jobType" name="jobType" value={form.jobType} onChange={handleChange} className="np-select" required>
                {JOB_TYPES.map((jt) => (
                  <option key={jt} value={jt}>
                    {jt}
                  </option>
                ))}
              </select>
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="salary">
                Annual Compensation (INR)
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. 1400000"
                className="np-input"
                min="0"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="location">
                Job Location / Operating Center
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, Hyderabad, Remote"
                className="np-input"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="status">
                Drive Publication Status
              </label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className="np-select">
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="applicationDeadline">
                Application Deadline
              </label>
              <input
                id="applicationDeadline"
                name="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={handleChange}
                className="np-input"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="driveDate">
                Scheduled Drive Evaluation Date
              </label>
              <input
                id="driveDate"
                name="driveDate"
                type="date"
                value={form.driveDate}
                onChange={handleChange}
                className="np-input"
              />
            </div>
          </div>

          <div className="np-form-group">
            <label className="np-label" htmlFor="description">
              Role Narrative & Responsibility Overview
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Outline role responsibilities, team structure, technical requirements, and progression paths..."
              className="np-textarea"
            />
          </div>

          {/* Section: Strict Eligibility Rubric */}
          <h2 style={{ fontSize: '1.25rem', textTransform: 'uppercase', margin: '2rem 0 1rem', borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-ink)', paddingBottom: '0.4rem' }}>
            II. Candidate Eligibility Rubric (Automated Screening)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="np-form-group">
              <label className="np-label" htmlFor="minCgpa">
                Minimum CGPA (0 - 10)
              </label>
              <input
                id="minCgpa"
                name="minCgpa"
                type="number"
                step="0.01"
                value={form.eligibility.minCgpa}
                onChange={handleEligibilityChange}
                placeholder="e.g. 7.5"
                className="np-input"
                min="0"
                max="10"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="minTwelfthPercentage">
                Min 12th Standard %
              </label>
              <input
                id="minTwelfthPercentage"
                name="minTwelfthPercentage"
                type="number"
                step="0.01"
                value={form.eligibility.minTwelfthPercentage}
                onChange={handleEligibilityChange}
                placeholder="e.g. 70"
                className="np-input"
                min="0"
                max="100"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="minTenthPercentage">
                Min 10th Standard %
              </label>
              <input
                id="minTenthPercentage"
                name="minTenthPercentage"
                type="number"
                step="0.01"
                value={form.eligibility.minTenthPercentage}
                onChange={handleEligibilityChange}
                placeholder="e.g. 70"
                className="np-input"
                min="0"
                max="100"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="graduationYear">
                Target Graduation Year
              </label>
              <input
                id="graduationYear"
                name="graduationYear"
                type="number"
                value={form.eligibility.graduationYear}
                onChange={handleEligibilityChange}
                placeholder="e.g. 2025"
                className="np-input"
              />
            </div>
          </div>

          <div className="np-form-group">
            <label className="np-label">Permitted Academic Disciplines</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              Select branches permitted to apply. Leaving all unselected allows all disciplines.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {BRANCHES.map((b) => {
                const isSelected = form.eligibility.allowedBranches?.includes(b)
                return (
                  <button
                    key={b}
                    type="button"
                    className={`np-btn np-btn-sm ${isSelected ? 'np-btn-primary' : ''}`}
                    onClick={() => handleBranchToggle(b)}
                  >
                    {isSelected ? `✓ ${b}` : b}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="np-form-group" style={{ marginTop: '1.25rem' }}>
            <label className="np-checkbox-label">
              <input
                type="checkbox"
                name="backlogsAllowed"
                checked={form.eligibility.backlogsAllowed}
                onChange={handleEligibilityChange}
              />
              <span>Permit Candidates with Active Backlogs to Submit Candidature</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingTop: '1.25rem' }}>
            <button type="submit" className="np-btn np-btn-primary" disabled={submitting}>
              {submitting ? 'Inscribing Specification...' : isEdit ? 'Update Placement Drive' : 'Publish Placement Drive'}
            </button>
            <button type="button" className="np-btn" onClick={() => navigate('/recruiter/drives')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
