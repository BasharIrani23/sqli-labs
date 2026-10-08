import React, { useState, useEffect } from 'react'
import { fetchSchema, resetDatabase } from '../api'

/**
 * Schema Modal & Database Explorer.
 * Allows students to view live table schemas and reset seed records.
 */
export default function SchemaModal({ isOpen, onClose, onResetComplete }) {
  const [schemaData, setSchemaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadSchema()
    }
  }, [isOpen])

  async function loadSchema() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSchema()
      if (data.status === 'ok') {
        setSchemaData(data.tables)
      } else {
        setError(data.error || 'Failed to load database schema')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!window.confirm('Reset database to default schema and seed data? Any extra modifications will be restored.')) {
      return
    }
    setResetting(true)
    setMessage(null)
    setError(null)
    try {
      const res = await resetDatabase()
      if (res.status === 'ok') {
        setMessage('Database tables and seed records successfully restored!')
        await loadSchema()
        if (onResetComplete) onResetComplete()
      } else {
        setError(res.error || 'Database reset failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setResetting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <svg className="modal-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <div>
              <h3>Lab Database Explorer</h3>
              <p className="modal-subtitle">Inspect table structures and available targets</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {message && (
          <div className="modal-alert alert-success">
            <span>✓</span> {message}
          </div>
        )}

        {error && (
          <div className="modal-alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="modal-body">
          {loading && <div className="modal-loading">Loading database schema...</div>}

          {!loading && schemaData && (
            <div className="tables-grid">
              {schemaData.map((table) => {
                const isSecretTable = table.name === 'admin_secrets'
                return (
                  <div
                    key={table.name}
                    className={`table-schema-card ${isSecretTable ? 'card-secret-table' : ''}`}
                  >
                    <div className="table-card-top">
                      <div className="table-name-group">
                        <span className="table-icon-tiny">🗄</span>
                        <h4>{table.name}</h4>
                      </div>
                      <div className="table-meta-badges">
                        {isSecretTable && <span className="badge-target">CTF Target</span>}
                        <span className="badge-rows">{table.row_count} rows</span>
                      </div>
                    </div>

                    <div className="schema-columns-list">
                      {table.columns.map((col) => (
                        <div key={col.name} className="schema-col-item">
                          <div className="col-name-group">
                            {col.key === 'PRI' && <span className="key-icon" title="Primary Key">🔑</span>}
                            <span className="col-name">{col.name}</span>
                          </div>
                          <span className="col-type">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-reset-db"
            onClick={handleReset}
            disabled={resetting}
          >
            {resetting ? 'Resetting Database...' : '↺ Reset Database to Seeds'}
          </button>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
