import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { runErrorBased } from '../api'
import ModeToggle from '../components/ModeToggle'
import HitsDisplay from '../components/HitsDisplay'
import ResultsTable from '../components/ResultsTable'
import HintPanel from '../components/HintPanel'
import ExamplesPanel from '../components/ExamplesPanel'
import { CHALLENGE_DETAILS } from '../data/challengeData'

export default function ErrorBased({ mode, setMode }) {
  const challenge = CHALLENGE_DETAILS['error-based']
  const [productId, setProductId] = useState('1')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState('1')

  async function handleSubmit(e, overrideId) {
    if (e) e.preventDefault()
    const idToRun = overrideId !== undefined ? overrideId : productId
    setLoading(true)
    setLastSubmittedPayload(idToRun)
    try {
      const data = await runErrorBased(mode, idToRun)
      setResult(data)
    } catch (err) {
      setResult({
        mode,
        query: `SELECT id, name, price FROM products WHERE id = ${idToRun}`,
        error: err.message,
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  function handleSelectExample(payload) {
    if (payload.productId !== undefined) {
      setProductId(payload.productId)
      handleSubmit(null, payload.productId)
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

      {/* Challenge Hero Header */}
      <div className="challenge-hero">
        <div className="hero-top-row">
          <span className="challenge-id-badge">LAB {challenge.number}</span>
          <span className="challenge-category-pill">{challenge.badge}</span>
          <span className="challenge-target-pill">Target: <code>{challenge.target}</code></span>
        </div>
        <h1 className="challenge-main-title">{challenge.title}</h1>
        <p className="challenge-lead-desc">{challenge.scenarioDescription}</p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="challenge-grid-layout">
        {/* Left Column: Controls, Form & Examples */}
        <div className="challenge-controls-col">
          {/* Mode Switcher */}
          <ModeToggle
            mode={mode}
            setMode={setMode}
            onModeChange={() => setResult(null)}
          />

          {/* Target Application Interface */}
          <div className="simulated-app-card">
            <div className="app-card-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="app-card-title">Catalog Service &bull; Product Query</span>
            </div>

            <form onSubmit={(e) => handleSubmit(e)} className="target-form">
              <div className="form-group">
                <label htmlFor="productIdInput" className="form-label">
                  Product ID Parameter (<code>id</code>)
                </label>
                <div className="input-with-actions">
                  <input
                    id="productIdInput"
                    type="text"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter numeric ID or SQL payload..."
                    className="form-input code-font"
                  />
                  {productId && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => setProductId('')}
                      title="Clear input"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="field-hint">
                  {mode === 'vulnerable'
                    ? 'Numeric context: concatenated directly into SQL without quotes.'
                    : 'Parameterized: bound to %s as an integer parameter.'}
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
                      <span className="spinner"></span> Running Query...
                    </>
                  ) : (
                    <>
                      <span>Execute Query</span>
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>

                <div className="quick-fill-chips">
                  <span className="quick-fill-label">Quick test:</span>
                  <button type="button" onClick={() => { setProductId('1'); handleSubmit(null, '1'); }}>
                    1 (Valid)
                  </button>
                  <button type="button" onClick={() => { setProductId('1 OR 1=1'); handleSubmit(null, '1 OR 1=1'); }}>
                    1 OR 1=1
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Progressive Hint Walkthrough */}
          <HintPanel hints={challenge.hints} />

          {/* Injection Playbook / Examples */}
          <ExamplesPanel
            examples={challenge.examples}
            onSelectExample={handleSelectExample}
            currentPayload={productId}
          />
        </div>

        {/* Right Column: Hits Display, Live SQL Visualizer & Results */}
        <div className="challenge-results-col">
          {result ? (
            <div className="results-wrapper">
              <HitsDisplay
                result={result}
                mode={mode}
                payloadText={lastSubmittedPayload}
                challengeType="error-based"
                baseTemplate={challenge.baseQueryTemplate}
              />

              {result.rows && result.rows.length > 0 && (
                <ResultsTable
                  columns={result.columns}
                  rows={result.rows}
                  title="Products Table Result Set"
                />
              )}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-state-icon">⚡</div>
              <h3>Awaiting Query Execution</h3>
              <p>
                Submit the form on the left or select a pre-built payload from the
                <strong> Interactive Injection Playbook</strong> below to inspect the
                query execution, reflected errors, and result set.
              </p>
              <div className="empty-state-suggestions">
                <span className="suggestion-pill">1. Test normal numeric ID "1"</span>
                <span className="suggestion-pill">2. Trigger error with "1'"</span>
                <span className="suggestion-pill">3. Run XPath version exfiltration</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
