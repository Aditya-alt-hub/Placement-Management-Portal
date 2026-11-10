import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard')
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    // Fetch available drives or sample listings if not logged in
    api.get('/drives/available-drives')
      .then((res) => {
        setDrives(res.data.drives || [])
      })
      .catch(() => {
        setDrives([])
      })
      .finally(() => setLoading(false))
  }, [])

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="page-wrapper">
      {/* Top Edition Bar */}
      <div className="np-top-strip">
        <span>The Official Campus Placement Journal</span>
        <span>{todayStr} <span className="np-accent-mark">·</span> Late City Edition</span>
        <span>Institutional Distribution</span>
      </div>

      <div className="newsprint-sheet">
        {/* Masthead */}
        <header className="np-masthead">
          <h1 className="np-masthead-title">The Placement Chronicle</h1>
          <div className="np-masthead-meta">
            <span>Special Placement Edition</span>
            <span>Accredited Academic Exchange</span>
            <span>Founded in Academic Integrity</span>
          </div>
        </header>

        {/* 3:1 Lead Spread Beneath Masthead */}
        <section className="np-lead-spread" style={{ marginTop: '1.5rem' }}>
          {/* Main Lead Story (3 parts) */}
          <article>
            <span className="np-section-tag">
              Lead Editorial <span className="np-accent-mark">■</span> Vol. XLVIII
            </span>
            <h2 className="np-story-headline">
              Campus Talent Meets Industrial Enterprise in Unified Placement Ledger
            </h2>
            <span className="np-byline">
              By Office of Corporate Relations &middot; Special to The Chronicle
            </span>

            <p className="np-story-lead">
              The university placement ecosystem transitions into an authoritative, single-sheet ledger designed to harmonize student credentials, corporate selection mandates, and verifiable career milestones. Engineered with exact qualification thresholds, the placement management network eliminates friction between ambitious candidates and tier-one recruiters.
            </p>

            <p>
              Students maintain authenticated scholastic dossiers including cumulative grade indices, verified backlogs, specialized technical repertoires, and indexed curriculum vitae. Corporate recruiters publish sanctioned recruitment drives with explicit eligibility rubrics, scheduling coding rounds, technical interviews, and issuance of formal letters of engagement with real-time institutional oversight.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="np-btn np-btn-primary">
                Open Student Dossier
              </Link>
              <Link to="/login" className="np-btn">
                Recruiter Portal Access
              </Link>
            </div>
          </article>

          {/* Narrow Action & Summary Column (1 part) */}
          <aside>
            <div style={{ borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <span className="np-section-tag">Dispatch Summary</span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Procedural Guidance</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--dp-color-secondary)', lineHeight: 1.35 }}>
                Three distinct roles govern operations: candidates verify credentials, recruiters stage multi-tiered evaluations, and administration validates corporate standing.
              </p>
            </div>

            <div style={{ paddingBottom: '0.85rem' }}>
              <span className="np-section-tag">Session Portal</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/login" className="np-btn np-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Registered User Sign In
                </Link>
                <Link to="/register" className="np-btn np-btn-sm np-btn-accent" style={{ width: '100%', justifyContent: 'center' }}>
                  Create New Account
                </Link>
              </div>
            </div>
          </aside>
        </section>

        {/* Compact Factual Strip */}
        <section className="np-facts-strip">
          <div className="np-fact-item">
            <div className="np-fact-label">Active Drives</div>
            <div className="np-fact-value">{drives.length > 0 ? drives.length : '12+'}</div>
            <div className="np-fact-sub">Open for applications</div>
          </div>
          <div className="np-fact-item">
            <div className="np-fact-label">Median Package</div>
            <div className="np-fact-value">₹14.2 L</div>
            <div className="np-fact-sub">Annual compensation</div>
          </div>
          <div className="np-fact-item">
            <div className="np-fact-label">Recruiting Firms</div>
            <div className="np-fact-value">85+</div>
            <div className="np-fact-sub">Vetted enterprise partners</div>
          </div>
          <div className="np-fact-item">
            <div className="np-fact-label">Selection Rate</div>
            <div className="np-fact-value">94.8%</div>
            <div className="np-fact-sub">Across accredited batches</div>
          </div>
        </section>

        {/* Supporting Spread: Operational Roles beside Open Listings */}
        <section className="np-equal-spread">
          {/* Column 1: Procedural Architecture */}
          <div>
            <span className="np-section-tag">System Protocols</span>
            <h3 className="np-story-headline-sm">Three Pillars of the Placement Charter</h3>

            <div style={{ marginTop: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                I. The Student Dossier
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--dp-color-secondary)' }}>
                Scholars compile detailed academic metrics, coursework, and curriculum vitae. Built-in eligibility intelligence automatically screens candidates against employer thresholds before applications are processed.
              </p>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                II. Corporate Selection Boards
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--dp-color-secondary)' }}>
                Recruiters organize sequential evaluation stages: Coding, Technical, HR, and Final interviews. Offer letters are generated and signed with definitive response deadlines.
              </p>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                III. Institutional Oversight
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--dp-color-secondary)' }}>
                Administration maintains authority over company accreditations, broadcast dispatches to entire student cohorts, and deep-cohort analytics across branches and graduating batches.
              </p>
            </div>
          </div>

          {/* Column 2: Available Opportunities Notice */}
          <div>
            <span className="np-section-tag">Gazette Bulletins</span>
            <h3 className="np-story-headline-sm">Active Placement Notices</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--dp-color-secondary)', marginBottom: '1rem' }}>
              Current recruitment drives accepting formal candidatures. Log in to submit credentials.
            </p>

            {drives.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {drives.slice(0, 4).map((d) => (
                  <div
                    key={d._id}
                    style={{
                      borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
                      paddingBottom: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem' }}>
                        {d.title}
                      </strong>
                      <span className="np-badge np-badge-accent">{d.jobType || 'Full Time'}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', marginTop: '0.15rem' }}>
                      {d.company?.name || 'Partner Company'} &middot; {d.location || 'Pan India'} &middot;{' '}
                      {d.salary ? `₹${Number(d.salary).toLocaleString('en-IN')} p.a.` : 'Competitive'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', border: 'var(--dp-border-hairline) solid var(--dp-color-rule)' }}>
                <p style={{ fontStyle: 'italic', margin: 0, fontSize: '0.95rem' }}>
                  Open recruitment drives will be published as corporate listings are vetted and approved by administration.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section Divider */}
        <hr className="np-section-rule" />

        {/* Questions beside Closing Invitation Spread */}
        <section className="np-lead-spread">
          {/* FAQ Disclosures */}
          <div>
            <span className="np-section-tag">Inquiries & Clarifications</span>
            <h3 className="np-story-headline-sm" style={{ marginBottom: '1rem' }}>
              Frequently Clarified Regulations
            </h3>

            <details className="np-disclosure">
              <summary>How does the automated eligibility engine verify candidate criteria?</summary>
              <div className="np-disclosure-content">
                Upon application submission, the portal cross-examines the candidate's CGPA, 10th and 12th standard percentages, active backlogs, graduation year, and academic branch against the recruiter's published requirements. If criteria are unmet, clear rationale is inscribed into the candidate record.
              </div>
            </details>

            <details className="np-disclosure">
              <summary>Can a student accept multiple corporate appointment letters?</summary>
              <div className="np-disclosure-content">
                In concordance with the University Placement Charter, accepting an offer automatically marks the candidate as "Placed" in the institutional ledger and locks further offer acceptances, preserving equity for fellow students.
              </div>
            </details>

            <details className="np-disclosure">
              <summary>What role do artificial intelligence models play in candidate preparation?</summary>
              <div className="np-disclosure-content">
                The embedded AI Career Analysis evaluates the student's curriculum vitae against current market skill profiles, calculating preparation readiness indices and highlighting areas requiring scholastic enhancement.
              </div>
            </details>
          </div>

          {/* Closing Invitation */}
          <aside style={{ backgroundColor: 'transparent' }}>
            <span className="np-section-tag">Official Notice</span>
            <h4 style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Commence Evaluation
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--dp-color-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
              Candidates and corporate talent teams are invited to initiate their credentials for the ongoing academic placement cycle.
            </p>
            <Link to="/register" className="np-btn np-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Begin Registration
            </Link>
          </aside>
        </section>

        {/* Directory Footer */}
        <footer className="np-footer">
          <div className="np-footer-grid">
            <div>
              <h4 style={{ fontFamily: 'var(--dp-typography-display)', textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                The Placement Chronicle
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--dp-color-secondary)', maxWidth: '420px', lineHeight: 1.4 }}>
                A centralized, verifiable recruitment platform built for universities, students, and enterprise recruitment bodies.
              </p>
            </div>
            <div>
              <h5 style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Navigation Directory
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Candidate Registration</Link></li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Governance
              </h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)' }}>
                University Placement Cell &middot; Academic Administration Secretariat
              </p>
            </div>
          </div>
          <div className="np-footer-bottom">
            <span>&copy; {new Date().getFullYear()} Campus Placement Portal. All rights reserved.</span>
            <span>Standard Typography: Source Serif 4 & EB Garamond</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
