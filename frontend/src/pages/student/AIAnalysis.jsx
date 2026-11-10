import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/ui/Badge'

export default function AIAnalysis() {
  const [analysis, setAnalysis] = useState(null)
  const [matches, setMatches] = useState([])
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [matchesError, setMatchesError] = useState('')
  const [customQuestion, setCustomQuestion] = useState('')

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setMatchesLoading(true)
    setMatchesError('')
    try {
      const res = await api.get('/ai/placement-matches')
      setMatches(res.data.matches || [])
    } catch (err) {
      setMatchesError(err?.response?.data?.message || 'Could not compile algorithmic placement matches.')
    } finally {
      setMatchesLoading(false)
    }
  }

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault()
    setAnalyzeLoading(true)
    setAnalyzeError('')
    setAnalysis(null)
    try {
      const res = await api.post('/ai/analyze', {
        question: customQuestion.trim(),
      })
      setAnalysis(res.data.data || res.data)
    } catch (err) {
      setAnalyzeError(
        err?.response?.data?.message ||
          'AI analysis failed. Please verify that your profile metrics and curriculum vitae are uploaded.'
      )
    } finally {
      setAnalyzeLoading(false)
    }
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
            Intelligence Memorandum <span className="np-accent-mark">·</span> Automated Career Audit
          </span>
          <h1>AI Career Audit & Alignment Desk</h1>
          <p className="np-subtitle">
            Algorithmic evaluation of candidate curriculum vitae, skill proficiencies, and placement drive alignment
          </p>
        </div>
        <div>
          <button type="button" className="np-btn np-btn-sm" onClick={fetchMatches}>
            Re-run Match Engine
          </button>
        </div>
      </div>

      {/* 3:1 Spread: Deep Profile Critique (Lead Column) and Alignment Matches (Side Column) */}
      <div className="np-lead-spread">
        {/* Left Column: AI Career Audit & Question Desk */}
        <div>
          <article className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h2>Algorithmic Candidacy Review</h2>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Submit an evaluation query to analyze your academic strengths, curriculum gaps, and interview readiness based on your deposited resume and recorded metrics.
            </p>

            <form onSubmit={handleAnalyze} style={{ marginBottom: '1.25rem' }}>
              <div className="np-form-group">
                <label className="np-label" htmlFor="customQuestion">
                  Specific Evaluation Focus (Optional)
                </label>
                <textarea
                  id="customQuestion"
                  className="np-textarea"
                  rows={2}
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="e.g. Evaluate my readiness for full-stack software engineering roles, or identify gaps in my database skills..."
                />
              </div>

              <button type="submit" className="np-btn np-btn-primary" disabled={analyzeLoading}>
                {analyzeLoading ? 'Synthesizing Critique...' : 'Request AI Candidacy Audit'}
              </button>
            </form>

            {analyzeError && <div className="np-alert np-alert-error">{analyzeError}</div>}

            {analyzeLoading && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', borderTop: 'var(--dp-border-hairline) solid var(--dp-color-rule)' }}>
                <p style={{ fontStyle: 'italic', fontSize: '1.05rem' }}>
                  Parsing indexed resume vectors and synthesizing editorial appraisal...
                </p>
              </div>
            )}

            {/* Analysis Output Section */}
            {analysis && !analyzeLoading && (
              <div style={{ borderTop: 'var(--dp-border-section) solid var(--dp-color-ink)', paddingTop: '1.25rem' }}>
                <span className="np-section-tag">Audit Findings & Verdict</span>
                <h3 className="np-story-headline-sm" style={{ marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                  Candidate Assessment Memorandum
                </h3>

                {/* Score meters if provided */}
                {analysis.scores && typeof analysis.scores === 'object' && (
                  <div className="np-facts-strip" style={{ margin: '1rem 0' }}>
                    {Object.entries(analysis.scores).map(([k, v]) => (
                      <div key={k} className="np-fact-item">
                        <div className="np-fact-label">{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                        <div className="np-fact-value">{typeof v === 'number' ? `${v}%` : String(v)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Narrative */}
                {analysis.answer ? (
                  <div
                    style={{
                      fontFamily: 'var(--dp-typography-reading)',
                      fontSize: '1.05rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      backgroundColor: 'transparent',
                      padding: '0.5rem 0',
                    }}
                  >
                    {analysis.answer}
                  </div>
                ) : (
                  <div style={{ fontStyle: 'italic', color: 'var(--dp-color-secondary)' }}>
                    Evaluation complete.
                  </div>
                )}
              </div>
            )}
          </article>
        </div>

        {/* Right Column: AI Placement Matches */}
        <aside>
          <div className="np-panel" style={{ backgroundColor: '#ffffff' }}>
            <div className="np-panel-header">
              <h3>Algorithmic Placement Matches</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>
              Synthesized by cross-referencing your resume vector embeddings with active drive job profiles.
            </p>

            {matchesError && <div className="np-alert np-alert-error">{matchesError}</div>}

            {matchesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Matching drive requirements...</p>
              </div>
            ) : matches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {matches.map((m, idx) => (
                  <div
                    key={m.driveId || idx}
                    style={{
                      borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
                      paddingBottom: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontFamily: 'var(--dp-typography-display)', fontSize: '1.05rem' }}>
                        {m.title}
                      </strong>
                      <Badge variant="filled">{m.jobType || 'Full Time'}</Badge>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', marginTop: '0.15rem' }}>
                      {m.company} &middot; {m.location || 'Multiple'}
                    </div>

                    {m.skillMatch?.level && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                        <span className="np-fact-label">Skill Alignment: </span>
                        <strong style={{ color: 'var(--dp-color-accent)' }}>{m.skillMatch.level}</strong>
                      </div>
                    )}

                    {m.skillMatch?.summary && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', margin: '0.35rem 0' }}>
                        {m.skillMatch.summary}
                      </p>
                    )}

                    {m.skillMatch?.matchingSkills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
                        {m.skillMatch.matchingSkills.slice(0, 4).map((sk, i) => (
                          <span key={i} className="np-badge" style={{ fontSize: '10px' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: '0.65rem' }}>
                      <Link to={`/student/drives/${m.driveId}`} className="np-btn np-btn-sm">
                        Inspect Drive Notice &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--dp-color-secondary)' }}>
                No automated matches available. Ensure your resume PDF is deposited and placement drives are open.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
