import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { fetchHealth } from '../api'

export default function Navbar({ onOpenSchema }) {
  const [dbStatus, setDbStatus] = useState({ online: false, version: null })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  async function checkHealth() {
    try {
      const data = await fetchHealth()
      if (data && data.status === 'ok' && data.database === 'connected') {
        setDbStatus({ online: true, version: data.database_version })
      } else {
        setDbStatus({ online: false, version: null })
      }
    } catch {
      setDbStatus({ online: false, version: null })
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand */}
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-badge">
            <span className="brand-code">SQLi</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">SQLi-Labs</span>
            <span className="brand-sub">Security Learning Environment</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink
            end
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Overview
          </NavLink>
          <NavLink
            to="/error-based"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-num">01</span> Error-Based
          </NavLink>
          <NavLink
            to="/union-based"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-num">02</span> UNION-Based
          </NavLink>
          <NavLink
            to="/blind-boolean"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-num">03</span> Blind Boolean
          </NavLink>
          <NavLink
            to="/blind-time"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-num">04</span> Blind Time
          </NavLink>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Database Health Pill */}
          <div
            className={`health-pill ${dbStatus.online ? 'health-online' : 'health-offline'}`}
            title={dbStatus.online ? `Database Connected: ${dbStatus.version || 'MySQL'}` : 'Database Disconnected'}
          >
            <span className="health-dot"></span>
            <span className="health-label">
              {dbStatus.online ? 'DB Connected' : 'DB Offline'}
            </span>
          </div>

          {/* Database Schema Button */}
          <button
            type="button"
            className="btn-schema-toggle"
            onClick={onOpenSchema}
            title="Inspect Database Tables & Reset"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <span>DB Schema</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  )
}
