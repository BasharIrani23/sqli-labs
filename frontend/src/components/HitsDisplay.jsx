import React, { useState } from 'react'
import { highlightSql } from '../utils/sqlHighlighter'

/**
 * Enhanced HitsDisplay component.
 * Provides rich visual feedback on SQL injection results, execution latency,
 * reflected errors, extracted secrets, syntax-highlighted SQL, and query diffing.
 */
export default function HitsDisplay({
  result,
  mode,
  payloadText,
  challengeType,
  baseTemplate,
}) {
  const [activeTab, setActiveTab] = useState('query')
  const [copiedQuery, setCopiedQuery] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  if (!result) return null

  const { query, elapsed_ms, error, message, success, rows, columns } = result
  const rowCount = rows ? rows.length : 0

  // Copy helpers
  function copyToClipboard(text, setCopied) {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Detect XPath error extraction: e.g. "XPATH syntax error: '~<data>'"
  let extractedSecret = null
  if (error && typeof error === 'string') {
    const xpathMatch = error.match(/XPATH syntax error:\s*['"]?~?([^'"]+)['"]?/i)
    if (xpathMatch) {
      extractedSecret = xpathMatch[1]
    }
  }

  // Analyze time-based delay (> 1200ms usually indicates successful SLEEP)
  const isTimeDelayed = elapsed_ms != null && elapsed_ms >= 1200
  const isTimeChallenge = challengeType === 'blind-time'

  // Analyze injection outcome state
  let hitStatus = {
    badge: 'Query Executed',
    theme: 'neutral',
    description: 'The database executed the query normally.'
  }

  if (mode === 'vulnerable') {
    if (extractedSecret) {
      hitStatus = {
        badge: 'In-Band Data Exfiltrated!',
        theme: 'exploit',
        description: 'XPath error reflection forced the database to leak confidential data inside the error message.'
      }
    } else if (error) {
      hitStatus = {
        badge: 'Database Error Reflected',
        theme: 'warning',
        description: 'Uncaught MySQL error returned to the client, disclosing server dialect and schema details.'
      }
    } else if (isTimeChallenge && isTimeDelayed) {
      hitStatus = {
        badge: 'Time-Based Delay Confirmed!',
        theme: 'exploit',
        description: `Server delayed response by ${(elapsed_ms / 1000).toFixed(2)}s via injected SLEEP() condition.`
      }
    } else if (challengeType === 'blind-boolean' && success) {
      hitStatus = {
        badge: 'Authentication Bypassed!',
        theme: 'exploit',
        description: 'Tautology or comment-out payload caused the boolean check to evaluate to TRUE.'
      }
    } else if (challengeType === 'union-based' && rows && rows.some(r => JSON.stringify(r).includes('FLAG{') || JSON.stringify(r).includes('sk_demo'))) {
      hitStatus = {
        badge: 'Hidden Secrets Extracted!',
        theme: 'exploit',
        description: 'UNION SELECT appended rows from confidential tables directly into the application result set.'
      }
    } else if (rowCount > 1 && challengeType === 'error-based') {
      hitStatus = {
        badge: 'Tautology Succeeded (Multi-Row Dump)',
        theme: 'exploit',
        description: 'WHERE clause evaluated to TRUE for all records, dumping the entire table.'
      }
    }
  } else {
    // Secure mode
    if (error) {
      hitStatus = {
        badge: 'Parameter Execution Error',
        theme: 'neutral',
        description: 'Safe parameter handling prevented injection, but an expected type validation occurred.'
      }
    } else {
      hitStatus = {
        badge: 'Attack Neutralized (Safe Parameterization)',
        theme: 'secure',
        description: 'Prepared statements treated user input purely as literal data. Injection neutralized.'
      }
    }
  }

  return (
    <div className={`hits-display theme-${hitStatus.theme}`}>
      {/* Top Header Bar */}
      <div className="hits-header">
        <div className="hits-title-group">
          <span className={`status-pill pill-${hitStatus.theme}`}>
            <span className="pill-dot"></span>
            {hitStatus.badge}
          </span>
          <span className={`mode-pill ${mode}`}>
            {mode === 'vulnerable' ? 'Vulnerable (Raw f-string)' : 'Secure (%s Prepared Statement)'}
          </span>
        </div>

        {/* Execution Metrics */}
        <div className="hits-metrics">
          {elapsed_ms != null && (
            <div className={`metric-badge ${isTimeDelayed ? 'metric-delayed' : ''}`} title="Server query latency">
              <span className="metric-label">Latency:</span>
              <strong className="metric-value">{elapsed_ms} ms</strong>
            </div>
          )}
          {rows !== undefined && (
            <div className="metric-badge" title="Number of records returned">
              <span className="metric-label">Rows:</span>
              <strong className="metric-value">{rowCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Latency Meter Bar (especially useful for blind-time) */}
      {elapsed_ms != null && (
        <div className="latency-bar-container">
          <div className="latency-bar-track">
            <div
              className={`latency-bar-fill ${isTimeDelayed ? 'fill-delayed' : 'fill-normal'}`}
              style={{ width: `${Math.min(100, Math.max(3, (elapsed_ms / 2500) * 100))}%` }}
            ></div>
          </div>
          <div className="latency-bar-legend">
            <span>0 ms</span>
            <span>Baseline (&lt;50 ms)</span>
            <span className={isTimeDelayed ? 'legend-delayed-active' : ''}>Target Delay (&gt;1500 ms)</span>
          </div>
        </div>
      )}

      {/* Exfiltrated Data Callout (If XPath or regex detected data) */}
      {extractedSecret && (
        <div className="extracted-secret-card">
          <div className="extracted-secret-header">
            <svg className="secret-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <strong>Leaked Data Captured in Error Reflection:</strong>
          </div>
          <div className="extracted-secret-value">
            <code>{extractedSecret}</code>
            <button
              type="button"
              className="copy-btn mini"
              onClick={() => copyToClipboard(extractedSecret, setCopiedJson)}
            >
              {copiedJson ? 'Copied!' : 'Copy Data'}
            </button>
          </div>
        </div>
      )}

      {/* Reflected Database Error Message */}
      {error && !extractedSecret && (
        <div className="reflected-error-card">
          <div className="error-title">Database Error Reflected to Client:</div>
          <div className="error-body"><code>{error}</code></div>
        </div>
      )}

      {/* Boolean Login Banner */}
      {challengeType === 'blind-boolean' && message && (
        <div className={`status-banner-large ${success ? 'banner-success' : 'banner-fail'}`}>
          <div className="banner-icon">
            {success ? '✓' : '✗'}
          </div>
          <div className="banner-content">
            <div className="banner-title">{message}</div>
            <div className="banner-subtext">
              {success
                ? 'Authentication successful. The query evaluated to TRUE for at least one record.'
                : 'Authentication failed. The query returned zero matching records.'}
            </div>
          </div>
        </div>
      )}

      {/* Time-Based Message Banner */}
      {challengeType === 'blind-time' && message && (
        <div className="status-banner-large banner-neutral">
          <div className="banner-icon">⏱</div>
          <div className="banner-content">
            <div className="banner-title">{message}</div>
            <div className="banner-subtext">
              {isTimeDelayed
                ? 'High latency detected! The server paused for ~2 seconds, confirming an injected delay condition.'
                : 'Standard fast response. No delay condition was triggered.'}
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Tabs */}
      <div className="visualizer-tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveTab('query')}
        >
          <span className="tab-indicator"></span>
          Live Query
        </button>
        {baseTemplate && (
          <button
            type="button"
            className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
          >
            Query Diff &amp; Inspection
          </button>
        )}
        <button
          type="button"
          className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          Raw JSON Response
        </button>

        <div className="tab-actions">
          <button
            type="button"
            className="copy-btn"
            onClick={() => copyToClipboard(query, setCopiedQuery)}
            title="Copy query text to clipboard"
          >
            {copiedQuery ? '✓ Copied' : 'Copy SQL'}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="visualizer-body">
        {activeTab === 'query' && (
          <div className="sql-code-panel">
            <pre className="sql-pre">
              <code>{highlightSql(query, payloadText)}</code>
            </pre>
          </div>
        )}

        {activeTab === 'diff' && baseTemplate && (
          <div className="diff-panel">
            <div className="diff-row">
              <span className="diff-label label-base">Intended Developer Query:</span>
              <pre className="diff-code"><code>{baseTemplate}</code></pre>
            </div>
            <div className="diff-row">
              <span className="diff-label label-actual">Actual Executed Query:</span>
              <pre className="diff-code diff-actual"><code>{highlightSql(query, payloadText)}</code></pre>
            </div>
            {payloadText && (
              <div className="diff-insight">
                <span className="insight-badge">Payload Injected:</span>
                <code>{payloadText}</code>
                <p className="insight-desc">
                  {mode === 'vulnerable'
                    ? 'In Vulnerable mode, the string above modified the SQL syntax and query execution tree directly.'
                    : 'In Secure mode, the string above was safely treated as an isolated literal parameter.'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="json-panel">
            <pre className="json-pre">
              <code>{JSON.stringify(result, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Educational Outcome Explainer */}
      <div className="hits-footer-note">
        <span className="note-title">Behavior Analysis:</span> {hitStatus.description}
      </div>
    </div>
  )
}
