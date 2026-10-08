import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { runBlindBoolean } from '../api'
import ModeToggle from '../components/ModeToggle'
import HitsDisplay from '../components/HitsDisplay'
import HintPanel from '../components/HintPanel'
import ExamplesPanel from '../components/ExamplesPanel'
import { CHALLENGE_DETAILS } from '../data/challengeData'

export default function BlindBoolean({ mode, setMode }) {
  const challenge = CHALLENGE_DETAILS['blind-boolean']
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('wrongpassword')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSubmittedUsername, setLastSubmittedUsername] = useState('admin')

  async function handleSubmit(e, overrideU, overrideP) {
    if (e) e.preventDefault()
    const uToRun = overrideU !== undefined ? overrideU : username
    const pToRun = overrideP !== undefined ? overrideP : password
    setLoading(true)
    setLastSubmittedUsername(uToRun)
    try {
      const data = await runBlindBoolean(mode, uToRun, pToRun)
      setResult(data)
    } catch (err) {
      setResult({
        mode,
        query: `SELECT id FROM users WHERE username='${uToRun}' AND password='${pToRun}'`,
        error: err.message,
        success: false,
        message: 'Login failed'
      })
    } finally {
      setLoading(false)
    }
  }

  function handleSelectExample(payload) {
    if (payload.username !== undefined && payload.password !== undefined) {
      setUsername(payload.username)
      setPassword(payload.password)
      handleSubmit(null, payload.username, payload.password)
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

          {/* Login Form Interface */}
          <div className="simulated-app-card">
            <div className="app-card-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="app-card-title">Authentication Portal &bull; Login Service</span>
            </div>

            <form onSubmit={(e) => handleSubmit(e)} className="target-form">
              <div className="form-group">
                <label htmlFor="usernameInput" className="form-label">
                  Username (<code>username</code>)
                </label>
                <input
                  id="usernameInput"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or injection..."
                  className="form-input code-font"
                />
              </div>

              <div className="form-group">
                <label htmlFor="passwordInput" className="form-label">
                  Password (<code>password</code>)
                </label>
                <input
                  id="passwordInput"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password or injection..."
                  className="form-input code-font"
                />
                <span className="field-hint">
                  {mode === 'vulnerable'
                    ? "Both fields interpolate into: SELECT id FROM users WHERE username='...' AND password='...'"
                    : 'Parameterized: safe placeholders %s for both credentials.'}
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
                      <span className="spinner"></span> Authenticating...
                    </>
                  ) : (
                    <>
                      <span>Submit Login</span>
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>

                <div className="quick-fill-chips">
                  <span className="quick-fill-label">Quick test:</span>
                  <button type="button" onClick={() => {
                    setUsername("admin'-- -")
                    setPassword('anything')
                    handleSubmit(null, "admin'-- -", 'anything')
                  }}>
                    admin'-- -
                  </button>
                  <button type="button" onClick={() => {
                    setUsername('admin')
                    setPassword("' OR '1'='1")
                    handleSubmit(null, 'admin', "' OR '1'='1")
                  }}>
                    ' OR '1'='1
                  </button>
                </div>
              </div>
            </form>
          </div>

          <HintPanel hints={challenge.hints} />

          <ExamplesPanel
            examples={challenge.examples}
            onSelectExample={handleSelectExample}
            currentPayload={`${username} / ${password}`}
          />
        </div>

        {/* Right Column: Hits & Visualizer */}
        <div className="challenge-results-col">
          {result ? (
            <div className="results-wrapper">
              <HitsDisplay
                result={result}
                mode={mode}
                payloadText={lastSubmittedUsername}
                challengeType="blind-boolean"
                baseTemplate={challenge.baseQueryTemplate}
              />
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-state-icon">🔐</div>
              <h3>Authentication Check Awaiting Input</h3>
              <p>
                Attempt authentication above or select a scenario from the
                <strong> Interactive Injection Playbook</strong> to test password bypass,
                commenting-out clauses, and character-by-character substring inference.
              </p>
              <div className="empty-state-suggestions">
                <span className="suggestion-pill">1. Test legitimate "admin / S3cretAdm1n!"</span>
                <span className="suggestion-pill">2. Bypass password with "' OR '1'='1"</span>
                <span className="suggestion-pill">3. Probe password length with boolean query</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
