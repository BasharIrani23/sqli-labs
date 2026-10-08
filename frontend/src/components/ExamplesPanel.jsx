import React, { useState } from 'react'

/**
 * Interactive Examples Panel for SQLi Challenges.
 * Displays categorized payloads, realistic scenarios, technical explanations,
 * expected responses in both Vulnerable and Secure modes, and provides 1-click loading.
 */
export default function ExamplesPanel({
  examples = [],
  onSelectExample,
  currentPayload
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(examples[0]?.id || null)
  const [copiedId, setCopiedId] = useState(null)

  // Get distinct categories
  const categories = ['All', ...new Set(examples.map(ex => ex.category))]

  const filteredExamples = selectedCategory === 'All'
    ? examples
    : examples.filter(ex => ex.category === selectedCategory)

  function handleCopy(payloadObj, id, e) {
    e.stopPropagation()
    const textToCopy = Object.values(payloadObj).join(' / ')
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  function getDifficultyClass(diff) {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'diff-beginner'
      case 'intermediate': return 'diff-intermediate'
      case 'advanced': return 'diff-advanced'
      default: return 'diff-neutral'
    }
  }

  return (
    <div className="examples-panel-card">
      <div className="examples-header">
        <div className="examples-title-group">
          <svg className="examples-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <div>
            <h3>Interactive Injection Playbook</h3>
            <p className="examples-subtitle">Realistic attack scenarios, payloads, and defense verifications</p>
          </div>
        </div>
        <span className="examples-count-pill">{filteredExamples.length} examples</span>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filter-bar">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Examples List */}
      <div className="examples-list">
        {filteredExamples.map((ex) => {
          const isExpanded = expandedId === ex.id
          const payloadSummary = Object.entries(ex.payload)
            .map(([k, v]) => `${k}: "${v}"`)
            .join(' | ')

          return (
            <div
              key={ex.id}
              className={`example-item ${isExpanded ? 'is-expanded' : ''}`}
            >
              <div
                className="example-item-header"
                onClick={() => setExpandedId(isExpanded ? null : ex.id)}
              >
                <div className="example-item-title-col">
                  <div className="example-badges">
                    <span className={`diff-pill ${getDifficultyClass(ex.difficulty)}`}>
                      {ex.difficulty}
                    </span>
                    <span className="category-tag">{ex.category}</span>
                  </div>
                  <h4 className="example-title">{ex.title}</h4>
                </div>

                <div className="example-header-actions" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    className="load-payload-btn"
                    onClick={() => onSelectExample && onSelectExample(ex.payload)}
                    title="Load this payload into form"
                  >
                    <span>⚡ Load Payload</span>
                  </button>
                  <button
                    type="button"
                    className="copy-payload-btn"
                    onClick={(e) => handleCopy(ex.payload, ex.id, e)}
                    title="Copy payload text"
                  >
                    {copiedId === ex.id ? '✓' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    className="expand-chevron"
                    onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                    aria-label="Toggle details"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Collapsed Payload Preview */}
              <div className="example-quick-payload">
                <span className="payload-label">Payload:</span>
                <code className="payload-code-inline">{payloadSummary}</code>
              </div>

              {/* Expanded In-Depth Details */}
              {isExpanded && (
                <div className="example-expanded-content">
                  {/* Scenario */}
                  <div className="example-section">
                    <div className="section-label">Real-World Scenario:</div>
                    <p className="scenario-text">{ex.scenario}</p>
                  </div>

                  {/* Technical Explanation */}
                  <div className="example-section">
                    <div className="section-label">SQL Execution Mechanics:</div>
                    <p className="explanation-text">{ex.explanation}</p>
                  </div>

                  {/* Expected Outcomes Comparison */}
                  <div className="outcomes-grid">
                    <div className="outcome-box outcome-vulnerable">
                      <div className="outcome-header">
                        <span className="dot dot-vulnerable"></span>
                        <strong>In Vulnerable Mode:</strong>
                      </div>
                      <p>{ex.expectedVulnerable}</p>
                    </div>

                    <div className="outcome-box outcome-secure">
                      <div className="outcome-header">
                        <span className="dot dot-secure"></span>
                        <strong>In Secure Mode:</strong>
                      </div>
                      <p>{ex.expectedSecure}</p>
                    </div>
                  </div>

                  {/* Tag list */}
                  {ex.tags && (
                    <div className="example-tags">
                      {ex.tags.map(tag => (
                        <span key={tag} className="tag-chip">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
