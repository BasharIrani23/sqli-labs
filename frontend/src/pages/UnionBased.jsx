import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { runUnionBased } from '../api'
import ModeToggle from '../components/ModeToggle'
import HitsDisplay from '../components/HitsDisplay'
import ResultsTable from '../components/ResultsTable'
import HintPanel from '../components/HintPanel'
import ExamplesPanel from '../components/ExamplesPanel'
import { CHALLENGE_DETAILS } from '../data/challengeData'

export default function UnionBased({ mode, setMode }) {
  const challenge = CHALLENGE_DETAILS['union-based']
  const [search, setSearch] = useState('bottle')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState('bottle')

  async function handleSubmit(e, overrideSearch) {
    if (e) e.preventDefault()
    const queryToRun = overrideSearch !== undefined ? overrideSearch : search
    setLoading(true)
    setLastSubmittedPayload(queryToRun)
    try {
      const data = await runUnionBased(mode, queryToRun)
      setResult(data)
    } catch (err) {
      setResult({
        mode,
        query: `SELECT id, name, price FROM products WHERE name LIKE '%${queryToRun}%'`,
        error: err.message,
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  function handleSelectExample(payload) {
    if (payload.search !== undefined) {
      setSearch(payload.search)
      handleSubmit(null, payload.search)
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

          {/* Search App Interface */}
          <div className="simulated-app-card">
            <div className="app-card-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="app-card-title">Storefront Search &bull; Product Catalog</span>
            </div>

            <form onSubmit={(e) => handleSubmit(e)} className="target-form">
              <div className="form-group">
                <label htmlFor="searchInput" className="form-label">
                  Product Name Search (<code>name LIKE '%...%'</code>)
                </label>
                <div className="input-with-actions">
                  <input
                    id="searchInput"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search term or UNION injection..."
                    className="form-input code-font"
                  />
                  {search && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => setSearch('')}
                      title="Clear input"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="field-hint">
                  {mode === 'vulnerable'
                    ? "String context: single quote breaks out of LIKE '%{search}%' clause."
                    : 'Parameterized: safely escaped with %s placeholder.'}
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
                      <span className="spinner"></span> Searching...
                    </>
                  ) : (
                    <>
                      <span>Search Catalog</span>
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>

                <div className="quick-fill-chips">
                  <span className="quick-fill-label">Quick test:</span>
                  <button type="button" onClick={() => { setSearch('bottle'); handleSubmit(null, 'bottle'); }}>
                    'bottle'
                  </button>
                  <button type="button" onClick={() => {
                    const pl = "' UNION SELECT id, secret_name, secret_value FROM admin_secrets-- -"
                    setSearch(pl)
                    handleSubmit(null, pl)
                  }}>
                    Dump Secrets
                  </button>
                </div>
              </div>
            </form>
          </div>

          <HintPanel hints={challenge.hints} />

          <ExamplesPanel
            examples={challenge.examples}
            onSelectExample={handleSelectExample}
            currentPayload={search}
          />
        </div>

        {/* Right Column: Hits & Results */}
        <div className="challenge-results-col">
          {result ? (
            <div className="results-wrapper">
              <HitsDisplay
                result={result}
                mode={mode}
                payloadText={lastSubmittedPayload}
                challengeType="union-based"
                baseTemplate={challenge.baseQueryTemplate}
              />

              <ResultsTable
                columns={result.columns}
                rows={result.rows}
                title="Search Query Results"
              />
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-state-icon">🔍</div>
              <h3>Search Awaiting Execution</h3>
              <p>
                Search for products or select an attack scenario from the
                <strong> Interactive Injection Playbook</strong> to test column counting,
                schema extraction, and confidential CTF flag retrieval.
              </p>
              <div className="empty-state-suggestions">
                <span className="suggestion-pill">1. Search standard "bottle"</span>
                <span className="suggestion-pill">2. Determine columns with "ORDER BY 3-- -"</span>
                <span className="suggestion-pill">3. Exfiltrate admin_secrets table</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
