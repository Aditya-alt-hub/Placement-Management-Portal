import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'AI/DS', 'Other']

export default function StudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    enrollmentNumber: '',
    course: '',
    branch: '',
    graduationYear: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    cgpa: '',
    backlogs: '0',
    skills: '',
    projectsRaw: '',
  })

  const [resumeFile, setResumeFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const resumeRef = useRef()
  const photoRef = useRef()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/students/get-profile')
      const p = res.data.student || res.data.profile || res.data
      if (p && (p.enrollmentNumber || p.course || p.branch || p._id)) {
        setProfile(p)
        const projectsStr = Array.isArray(p.projects)
          ? p.projects.map((proj) => (typeof proj === 'string' ? proj : proj.title || '')).filter(Boolean).join(', ')
          : ''

        setForm({
          enrollmentNumber: p.enrollmentNumber || '',
          course: p.course || '',
          branch: p.branch || '',
          graduationYear: p.graduationYear || '',
          tenthPercentage: p.tenthPercentage || '',
          twelfthPercentage: p.twelfthPercentage || '',
          cgpa: p.cgpa || '',
          backlogs: p.backlogs !== undefined ? String(p.backlogs) : '0',
          skills: Array.isArray(p.skills) ? p.skills.join(', ') : p.skills || '',
          projectsRaw: projectsStr,
        })
      } else {
        setEditing(true)
      }
    } catch (err) {
      // 404 means profile doesn't exist yet
      if (err.response?.status === 404) {
        setProfile(null)
        setEditing(true)
      } else {
        setError(err.response?.data?.message || 'Could not load student profile.')
      }
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
    setSubmitting(true)
    setError('')
    setSuccess('')

    const fd = new FormData()
    fd.append('enrollmentNumber', form.enrollmentNumber.trim())
    fd.append('course', form.course.trim())
    fd.append('branch', form.branch.trim())
    fd.append('graduationYear', form.graduationYear)
    fd.append('tenthPercentage', form.tenthPercentage)
    fd.append('twelfthPercentage', form.twelfthPercentage)
    fd.append('cgpa', form.cgpa)
    fd.append('backlogs', form.backlogs || '0')

    // In backend: skills is split by comma: req.body.skills.split(",")
    fd.append('skills', form.skills)

    // In backend: projects is parsed via JSON.parse(req.body.projects)
    const projectsArray = form.projectsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title) => ({
        title,
        description: 'Academic or capstone project submission.',
        technologies: [],
        github: '',
        deployedLink: '',
      }))

    fd.append('projects', JSON.stringify(projectsArray))

    if (resumeFile) {
      fd.append('resume', resumeFile)
    }
    if (photoFile) {
      fd.append('profilePhoto', photoFile)
    }

    try {
      if (profile) {
        await api.put('/students/update-profile', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setSuccess('Scholastic profile dossier updated successfully.')
      } else {
        await api.post('/students/create-profile', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setSuccess('Scholastic profile dossier created successfully.')
      }
      await fetchProfile()
      setEditing(false)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save academic profile.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="np-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Retrieving candidate dossier from university archives...</p>
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
            Scholastic Registry <span className="np-accent-mark">·</span> Candidate Dossier
          </span>
          <h1>Academic Credentials Dossier</h1>
          <p className="np-subtitle">
            Authenticated records utilized by automated qualification checkers and enterprise boards
          </p>
        </div>
        {profile && !editing && (
          <button type="button" className="np-btn np-btn-primary" onClick={() => setEditing(true)}>
            Edit Dossier Inscriptions
          </button>
        )}
      </div>

      {error && <div className="np-alert np-alert-error">{error}</div>}
      {success && <div className="np-alert np-alert-success">{success}</div>}

      {!editing && profile ? (
        /* Read-only Newsprint Dossier Spread */
        <div className="np-lead-spread">
          {/* Main Scholastic Record */}
          <article className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>Candidate Official Record</h2>
              <Badge status={profile.placementStatus || 'Not Placed'}>
                {profile.placementStatus || 'Not Placed'}
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="np-fact-label">Full Name:</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>{user?.name}</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>{user?.email}</span>
              </div>
              <div>
                <span className="np-fact-label">Enrollment Number:</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>{profile.enrollmentNumber || '—'}</p>
              </div>
              <div>
                <span className="np-fact-label">Course & Branch:</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>
                  {profile.course} &middot; {profile.branch}
                </p>
              </div>
              <div>
                <span className="np-fact-label">Graduation Year:</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>{profile.graduationYear}</p>
              </div>
            </div>

            <hr className="np-hairline-rule" />

            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Examination Indices
            </h3>
            <div className="np-facts-strip" style={{ margin: '0 0 1.5rem' }}>
              <div className="np-fact-item">
                <div className="np-fact-label">Cumulative GPA</div>
                <div className="np-fact-value">{profile.cgpa ?? '—'}</div>
                <div className="np-fact-sub">Scale of 10.0</div>
              </div>
              <div className="np-fact-item">
                <div className="np-fact-label">12th Standard</div>
                <div className="np-fact-value">{profile.twelfthPercentage ? `${profile.twelfthPercentage}%` : '—'}</div>
                <div className="np-fact-sub">Higher Secondary</div>
              </div>
              <div className="np-fact-item">
                <div className="np-fact-label">10th Standard</div>
                <div className="np-fact-value">{profile.tenthPercentage ? `${profile.tenthPercentage}%` : '—'}</div>
                <div className="np-fact-sub">Secondary Board</div>
              </div>
              <div className="np-fact-item">
                <div className="np-fact-label">Active Backlogs</div>
                <div className="np-fact-value" style={{ color: profile.backlogs > 0 ? 'var(--dp-color-accent)' : 'inherit' }}>
                  {profile.backlogs ?? 0}
                </div>
                <div className="np-fact-sub">Pending papers</div>
              </div>
            </div>

            {/* Skills Repertoire */}
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Skills & Technical Repertoire
            </h3>
            {profile.skills?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {profile.skills.map((skill, i) => (
                  <span key={i} className="np-badge">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)', marginBottom: '1.5rem' }}>
                No technical competencies recorded.
              </p>
            )}

            {/* Projects */}
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Capstone & Practical Projects
            </h3>
            {profile.projects?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {profile.projects.map((proj, idx) => (
                  <li
                    key={idx}
                    style={{
                      borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
                      paddingBottom: '0.6rem',
                    }}
                  >
                    <strong>{typeof proj === 'string' ? proj : proj.title || 'Untitled Project'}</strong>
                    {proj.description && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--dp-color-secondary)', margin: '0.2rem 0' }}>
                        {proj.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)' }}>
                No project portfolio inscribed yet.
              </p>
            )}
          </article>

          {/* Sidebar: Documents & Photos */}
          <aside>
            <div className="np-panel" style={{ backgroundColor: '#ffffff', textAlign: 'center' }}>
              <div className="np-panel-header">
                <h3>Candidate Portrait</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                {profile.profilePhoto?.url || typeof profile.profilePhoto === 'string' ? (
                  <img
                    src={profile.profilePhoto?.url || profile.profilePhoto}
                    alt="Candidate Portrait"
                    className="np-profile-photo"
                    style={{ width: '120px', height: '120px' }}
                  />
                ) : (
                  <div className="np-profile-photo-placeholder" style={{ width: '120px', height: '120px' }}>
                    {user?.name?.[0] || 'S'}
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', fontStyle: 'italic' }}>
                Formal grayscale portrait for credential authentication.
              </p>
            </div>

            <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
              <div className="np-panel-header">
                <h3>Curriculum Vitae</h3>
              </div>
              {profile.resume?.url ? (
                <div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    Curriculum Vitae deposited and indexed in AI retrieval system.
                  </p>
                  <a
                    href={profile.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="np-btn np-btn-sm"
                    style={{ display: 'block', textAlign: 'center' }}
                  >
                    Inspect Deposited PDF &rarr;
                  </a>
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                  No PDF resume deposited. Uploading a resume enables AI profile matching against active drives.
                </p>
              )}
            </div>
          </aside>
        </div>
      ) : (
        /* Edit Form Mode */
        <div className="np-panel" style={{ backgroundColor: '#ffffff', maxWidth: '820px', margin: '0 auto' }}>
          <div className="np-panel-header">
            <h2>{profile ? 'Modify Candidate Dossier' : 'Inscribe Initial Academic Dossier'}</h2>
            {profile && (
              <button type="button" className="np-btn np-btn-sm" onClick={() => setEditing(false)}>
                Cancel & Return
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="np-form-group">
                <label className="np-label" htmlFor="enrollmentNumber">
                  Enrollment Number <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <input
                  id="enrollmentNumber"
                  name="enrollmentNumber"
                  value={form.enrollmentNumber}
                  onChange={handleChange}
                  className="np-input"
                  required
                  placeholder="e.g. EN20220451"
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="course">
                  Degree / Course <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <input
                  id="course"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  className="np-input"
                  required
                  placeholder="e.g. B.Tech / M.Tech / MCA"
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="branch">
                  Academic Branch <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <select id="branch" name="branch" value={form.branch} onChange={handleChange} className="np-select" required>
                  <option value="">Select Branch</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="graduationYear">
                  Graduation Year <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  value={form.graduationYear}
                  onChange={handleChange}
                  className="np-input"
                  required
                  placeholder="e.g. 2025"
                  min="2010"
                  max="2035"
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="cgpa">
                  Cumulative CGPA (0 - 10) <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <input
                  id="cgpa"
                  name="cgpa"
                  type="number"
                  step="0.01"
                  value={form.cgpa}
                  onChange={handleChange}
                  className="np-input"
                  required
                  placeholder="e.g. 8.45"
                  min="0"
                  max="10"
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="backlogs">
                  Active Backlogs
                </label>
                <input
                  id="backlogs"
                  name="backlogs"
                  type="number"
                  value={form.backlogs}
                  onChange={handleChange}
                  className="np-input"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="twelfthPercentage">
                  12th Standard % <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <input
                  id="twelfthPercentage"
                  name="twelfthPercentage"
                  type="number"
                  step="0.01"
                  value={form.twelfthPercentage}
                  onChange={handleChange}
                  className="np-input"
                  required
                  placeholder="e.g. 84.5"
                  min="0"
                  max="100"
                />
              </div>

              <div className="np-form-group">
                <label className="np-label" htmlFor="tenthPercentage">
                  10th Standard % <span style={{ color: 'var(--dp-color-accent)' }}>*</span>
                </label>
                <input
                  id="tenthPercentage"
                  name="tenthPercentage"
                  type="number"
                  step="0.01"
                  value={form.tenthPercentage}
                  onChange={handleChange}
                  className="np-input"
                  required
                  placeholder="e.g. 88.0"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="skills">
                Technical Competencies (Comma Separated)
              </label>
              <input
                id="skills"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="np-input"
                placeholder="e.g. JavaScript, Python, React, PostgreSQL, Docker, Data Structures"
              />
            </div>

            <div className="np-form-group">
              <label className="np-label" htmlFor="projectsRaw">
                Projects Portfolio (Comma Separated Project Titles)
              </label>
              <input
                id="projectsRaw"
                name="projectsRaw"
                value={form.projectsRaw}
                onChange={handleChange}
                className="np-input"
                placeholder="e.g. Distributed Task Engine, AI Resume Matcher, Real-time Collaborative Board"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="np-label">
                  Deposit Curriculum Vitae (PDF Only)
                </label>
                <div
                  className="np-file-upload"
                  onClick={() => resumeRef.current?.click()}
                  style={{ border: '1px solid var(--dp-color-ink)' }}
                >
                  <input
                    ref={resumeRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                  {resumeFile ? `Selected: ${resumeFile.name}` : 'Click to select PDF document'}
                </div>
              </div>

              <div>
                <label className="np-label">
                  Candidate Portrait Photograph
                </label>
                <div
                  className="np-file-upload"
                  onClick={() => photoRef.current?.click()}
                  style={{ border: '1px solid var(--dp-color-ink)' }}
                >
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                  />
                  {photoFile ? `Selected: ${photoFile.name}` : 'Click to select photo file'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="np-btn np-btn-primary" disabled={submitting}>
                {submitting ? 'Deposing Record...' : profile ? 'Save Inscriptions' : 'Inscribe Profile'}
              </button>
              {profile && (
                <button type="button" className="np-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
