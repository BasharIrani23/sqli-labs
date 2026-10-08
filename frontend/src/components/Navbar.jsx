import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { fetchHealth } from '../api'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ onOpenSchema }) {
  const { theme, toggleTheme } = useTheme()
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

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <svg className="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span className="theme-toggle-text">Light</span>
              </>
            ) : (
              <>
                <svg className="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span className="theme-toggle-text">Dark</span>
              </>
            )}
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
