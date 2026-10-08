import React, { useState } from 'react'

/**
 * Enhanced Progressive HintPanel.
 * Allows step-by-step hint revelation or full expansion for guided learning.
 * Clean, compact styling with a calm slate accent.
 */
export default function HintPanel({ hints = [] }) {
  const [open, setOpen] = useState(false)
  const [revealedCount, setRevealedCount] = useState(1)

  if (!hints || hints.length === 0) return null

  function revealNext() {
    setRevealedCount(prev => Math.min(hints.length, prev + 1))
  }

  function revealAll() {
    setRevealedCount(hints.length)
  }

  return (
    <div className={`hint-panel-card ${open ? 'panel-open' : ''}`}>
      <button
        type="button"
        className="hint-toggle-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="hint-header-left">
          <span className="hint-bulb-icon">💡</span>
          <div>
            <strong>Guided Lab Hints &amp; Walkthrough</strong>
            <span className="hint-counter">
              {open
                ? `Showing ${revealedCount} of ${hints.length} hints`
                : `${hints.length} hints available for this challenge`}
            </span>
          </div>
        </div>
        <span className="hint-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="hint-content-body">
          <ol className="hint-steps-list">
            {hints.slice(0, revealedCount).map((hint, idx) => (
              <li key={idx} className="hint-step-item">
                <div className="hint-step-badge">Step {idx + 1}</div>
                <div className="hint-step-text">{hint}</div>
              </li>
            ))}
          </ol>

          {revealedCount < hints.length && (
            <div className="hint-actions">
              <button
                type="button"
                className="btn-reveal-next"
                onClick={revealNext}
              >
                Reveal Next Hint ({revealedCount + 1}/{hints.length})
              </button>
              <button
                type="button"
                className="btn-reveal-all"
                onClick={revealAll}
              >
                Reveal All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
