import React from 'react'

/**
 * Modernized ModeToggle component.
 * Allows live switching between Vulnerable (raw concatenation)
 * and Secure (parameterized prepared statements) modes.
 */
export default function ModeToggle({ mode, setMode, onModeChange }) {
  function handleSelect(newMode) {
    setMode(newMode)
    if (onModeChange) onModeChange(newMode)
  }

  return (
    <div className="mode-toggle-card">
      <div className="mode-toggle-header">
        <span className="mode-toggle-label">Execution Architecture:</span>
        <span className="mode-toggle-helper">
          {mode === 'vulnerable'
            ? 'Vulnerable: Input is directly interpolated into raw SQL text.'
            : 'Secure: Input is safely bound to parameterized placeholders (%s).'}
        </span>
      </div>

      <div className="mode-toggle-group" role="group" aria-label="Query execution mode">
        <button
          type="button"
          className={`mode-btn vulnerable ${mode === 'vulnerable' ? 'active' : ''}`}
          onClick={() => handleSelect('vulnerable')}
          aria-pressed={mode === 'vulnerable'}
        >
          <span className="mode-icon">⚠️</span>
          <div className="mode-btn-text">
            <strong>Vulnerable Mode</strong>
            <small>Raw String Concatenation</small>
          </div>
        </button>

        <button
          type="button"
          className={`mode-btn secure ${mode === 'secure' ? 'active' : ''}`}
          onClick={() => handleSelect('secure')}
          aria-pressed={mode === 'secure'}
        >
          <span className="mode-icon">🛡️</span>
          <div className="mode-btn-text">
            <strong>Secure Mode</strong>
            <small>Parameterized Prepared Statements</small>
          </div>
        </button>
      </div>
    </div>
  )
}
