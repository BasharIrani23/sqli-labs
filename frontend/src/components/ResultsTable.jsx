import React, { useState } from 'react'

/**
 * Enhanced ResultsTable with row counting, search filter,
 * and automatic detection/highlighting of exfiltrated CTF flags and secrets.
 */
export default function ResultsTable({ columns, rows, title = "Query Result Set" }) {
  const [filterText, setFilterText] = useState('')

  if (!columns || columns.length === 0) return null

  // Check if a cell contains sensitive exfiltrated assets
  function isSensitiveCell(cell) {
    if (!cell) return false
    const str = String(cell)
    return (
      str.includes('FLAG{') ||
      str.includes('sk_demo_') ||
      str.includes('Rotate demo') ||
      str.includes('admin_secrets')
    )
  }

  // Check if an entire row contains injected secrets
  function isSensitiveRow(row) {
    return row.some(cell => isSensitiveCell(cell))
  }

  // Filter rows if user types into filter box
  const filteredRows = (rows || []).filter(row => {
    if (!filterText) return true
    return row.some(cell => String(cell).toLowerCase().includes(filterText.toLowerCase()))
  })

  return (
    <div className="results-table-card">
      <div className="results-table-header">
        <div className="results-table-title">
          <svg className="table-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <strong>{title}</strong>
          <span className="row-counter-badge">
            {rows ? rows.length : 0} {rows && rows.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {rows && rows.length > 3 && (
          <div className="table-filter">
            <input
              type="text"
              placeholder="Filter results..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="table-filter-input"
            />
            {filterText && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => setFilterText('')}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th className="th-index">#</th>
              {columns.map((c) => (
                <th key={c}>
                  <div className="th-content">
                    <span>{c}</span>
                  </div>
                </th>
              ))}
              <th className="th-status">Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row, i) => {
                const sensitive = isSensitiveRow(row)
                return (
                  <tr key={i} className={sensitive ? 'row-sensitive' : ''}>
                    <td className="td-index">{i + 1}</td>
                    {row.map((cell, j) => {
                      const isCellSecret = isSensitiveCell(cell)
                      return (
                        <td key={j} className={isCellSecret ? 'cell-secret' : ''}>
                          {isCellSecret && <span className="flag-icon">🚩 </span>}
                          <span>{cell !== null && cell !== undefined ? String(cell) : <em className="null-val">NULL</em>}</span>
                        </td>
                      )
                    })}
                    <td className="td-status">
                      {sensitive ? (
                        <span className="tag-secret-asset">Exfiltrated Secret</span>
                      ) : (
                        <span className="tag-standard">Standard Row</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="empty-results-cell">
                  {filterText
                    ? `No rows matching "${filterText}".`
                    : 'Query returned 0 rows for this payload.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
