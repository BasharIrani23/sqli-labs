import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { runBlindTime } from '../api'
import ModeToggle from '../components/ModeToggle'
import HitsDisplay from '../components/HitsDisplay'
import HintPanel from '../components/HintPanel'
import ExamplesPanel from '../components/ExamplesPanel'
import { CHALLENGE_DETAILS } from '../data/challengeData'

export default function BlindTime({ mode, setMode }) {
  const challenge = CHALLENGE_DETAILS['blind-time']
  const [username, setUsername] = useState('alice')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSubmittedUsername, setLastSubmittedUsername] = useState('alice')

  async function handleSubmit(e, overrideU) {
    if (e) e.preventDefault()
    const uToRun = overrideU !== undefined ? overrideU : username
    setLoading(true)
    setLastSubmittedUsername(uToRun)
    try {
      const data = await runBlindTime(mode, uToRun)
      setResult(data)
    } catch (err) {
      setResult({
        mode,
        query: `SELECT id FROM users WHERE username='${uToRun}'`,
        error: err.message,
        success: null,
        message: 'Request processed'
      })
    } finally {
      setLoading(false)
    }
  }

  function handleSelectExample(payload) {
    if (payload.username !== undefined) {
      setUsername(payload.username)
      handleSubmit(null, payload.username)
    }
  }

  return (
    <div className="challenge-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Overview</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Challenge {challenge.number}: {challenge.title}</span>
      </nav>

      {/* Hero Header */}
      <div className="challenge-hero">
        <div className="hero-top-row">
          <span className="challenge-id-badge">LAB {challenge.number}</span>
          <span className="challenge-category-pill">{challenge.badge}</span>
          <span className="challenge-target-pill">Target: <code>{challenge.target}</code></span>
        </div>
        <h1 className="challenge-main-title">{challenge.title}</h1>
        <p className="challenge-lead-desc">{challenge.scenarioDescription}</p>
      </div>

      {/* Two-Column Grid */}
      <div className="challenge-grid-layout">
        {/* Left Column */}
        <div className="challenge-controls-col">
          <ModeToggle
            mode={mode}
            setMode={setMode}
            onModeChange={() => setResult(null)}
          />

          {/* Username Check Interface */}
          <div className="simulated-app-card">
            <div className="app-card-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="app-card-title">Registration Service &bull; Availability Check</span>
            </div>

            <form onSubmit={(e) => handleSubmit(e)} className="target-form">
              <div className="form-group">
                <label htmlFor="usernameLookupInput" className="form-label">
                  Username to Check (<code>username</code>)
                </label>
                <div className="input-with-actions">
                  <input
                    id="usernameLookupInput"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or time-delay injection..."
                    className="form-input code-font"
                  />
                  {username && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => setUsername('')}
                      title="Clear input"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="field-hint">
                  {mode === 'vulnerable'
                    ? "String context: single quote breaks out: SELECT id FROM users WHERE username='...'"
                    : 'Parameterized: safe placeholder %s (functions like SLEEP() are never evaluated).'}
                </span>
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit-payload"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Awaiting Response (Measuring Latency)...
                    </>
                  ) : (
                    <>
                      <span>Check Username</span>
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>

                <div className="quick-fill-chips">
                  <span className="quick-fill-label">Quick test:</span>
                  <button type="button" onClick={() => { setUsername('alice'); handleSubmit(null, 'alice'); }}>
                    alice (Fast)
                  </button>
                  <button type="button" onClick={() => {
                    const pl = "alice' AND SLEEP(2)-- -"
                    setUsername(pl)
                    handleSubmit(null, pl)
                  }}>
                    SLEEP(2) (Delay)
                  </button>
                </div>
              </div>
            </form>
          </div>

          <HintPanel hints={challenge.hints} />

          <ExamplesPanel
            examples={challenge.examples}
            onSelectExample={handleSelectExample}
            currentPayload={username}
          />
        </div>

        {/* Right Column: Hits & Latency Meter */}
        <div className="challenge-results-col">
          {result ? (
            <div className="results-wrapper">
              <HitsDisplay
                result={result}
                mode={mode}
                payloadText={lastSubmittedUsername}
                challengeType="blind-time"
                baseTemplate={challenge.baseQueryTemplate}
              />
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-state-icon">⏱</div>
              <h3>Timing Channel Awaiting Request</h3>
              <p>
                Submit a username above or test a delay payload from the
                <strong> Interactive Injection Playbook</strong>. Observe how
                unconditional and conditional <code>SLEEP()</code> statements create
                measurable latency differences on the timing meter.
              </p>
              <div className="empty-state-suggestions">
                <span className="suggestion-pill">1. Test normal "alice" (~2ms)</span>
                <span className="suggestion-pill">2. Inject 2-second sleep (~2000ms)</span>
                <span className="suggestion-pill">3. Infer DB name length with IF(...)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
