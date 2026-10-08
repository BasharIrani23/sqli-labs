import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchChallenges, fetchHealth } from '../api'

const FALLBACK_CHALLENGES = [
  {
    id: 'error-based',
    number: '01',
    title: 'In-Band Error-Based',
    category: 'Reflection Channel',
    difficulty: 'Intermediate',
    target: 'products.id (numeric)',
    path: '/error-based',
    description: 'Product lookup by ID concatenates directly into a numeric SQL context. Unhandled MySQL errors reflect back to the client, allowing data exfiltration via XPath functions.',
    concepts: ['Numeric Context Injection', 'XPath Extraction (EXTRACTVALUE)', 'UPDATEXML Exploitation', 'Schema Enumeration'],
  },
  {
    id: 'union-based',
    number: '02',
    title: 'UNION-Based Injection',
    category: 'Result Set Extension',
    difficulty: 'Easy - Medium',
    target: 'products.name (LIKE search)',
    path: '/union-based',
    description: 'Product search concatenates user input into a LIKE clause. An attacker uses UNION SELECT to append secret rows from hidden tables like admin_secrets.',
    concepts: ['ORDER BY Column Discovery', 'Data Type Alignment', 'information_schema Traversal', 'CTF Flag Exfiltration'],
  },
  {
    id: 'blind-boolean',
    number: '03',
    title: 'Blind Boolean-Based',
    category: 'Binary Inference',
    difficulty: 'Medium - Hard',
    target: 'users credentials',
    path: '/blind-boolean',
    description: 'Login form masks raw DB errors and reveals only a true/false binary signal. Attackers infer database records bit-by-bit using tautologies and substring logic.',
    concepts: ['Authentication Bypass', 'Tautology (OR 1=1)', 'Inline Comment Truncation', 'Blind Character Probing'],
  },
  {
    id: 'blind-time',
    number: '04',
    title: 'Blind Time-Based',
    category: 'Latency Side-Channel',
    difficulty: 'Advanced',
    target: 'users.username',
    path: '/blind-time',
    description: 'Username availability check reveals no content difference or errors. Attackers extract data by forcing conditional database delays using SLEEP().',
    concepts: ['Time-Delay Injection', 'SLEEP() Function', 'Conditional Execution (IF)', 'Latency Meter Analysis'],
  },
]

export default function Home({ onOpenSchema }) {
  const [challenges, setChallenges] = useState(FALLBACK_CHALLENGES)
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetchChallenges()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge with rich visual metadata
          const merged = FALLBACK_CHALLENGES.map((fc, idx) => {
            const apiItem = data.find(d => d.id === fc.id) || data[idx]
            return { ...fc, ...apiItem }
          })
          setChallenges(merged)
        }
      })
      .catch(() => {})

    fetchHealth()
      .then(data => setHealth(data))
      .catch(() => {})
  }, [])

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-pill">Interactive Security Lab</span>
          <span className="eyebrow-school">Middle East University &bull; Faculty of IT</span>
        </div>

        <h1 className="hero-title">
          Master SQL Injection Attacks &amp; Defenses.
          <span className="hero-gradient-text"> Watch Queries Execute Live.</span>
        </h1>

        <p className="hero-subtitle">
          An interactive laboratory built to demonstrate the mechanics of SQL injection.
          Toggle live between <strong>Vulnerable</strong> (raw string concatenation) and
          <strong> Secure</strong> (parameterized prepared statements) modes to observe
          the exact structural changes in SQL queries and response behaviors.
        </p>

        {/* Quick Stats / Meta */}
        <div className="hero-meta-row">
          <div className="meta-card">
            <span className="meta-card-num">4</span>
            <span className="meta-card-label">Core SQLi Categories</span>
          </div>
          <div className="meta-card">
            <span className="meta-card-num">2x</span>
            <span className="meta-card-label">Dual-Mode Architecture</span>
          </div>
          <div className="meta-card">
            <span className="meta-card-num">24+</span>
            <span className="meta-card-label">Realistic Attack Scenarios</span>
          </div>
          <div className="meta-card">
            <span className="meta-card-num">{health?.database === 'connected' ? 'MariaDB' : 'Active'}</span>
            <span className="meta-card-label">Live Isolated Database</span>
          </div>
        </div>

        {/* Project Attribution Callout */}
        <div className="project-attribution-bar">
          <div className="attr-item">
            <span className="attr-label">Project Team:</span>
            <strong className="attr-names">Alaa Asharf &bull; Bassam Hamad &bull; Yanal Al-Ali</strong>
          </div>
          <div className="attr-item">
            <span className="attr-label">Supervisor:</span>
            <strong className="attr-names">Dr. Nadia Alfriehat</strong>
          </div>
        </div>
      </section>

      {/* Challenge Grid Section */}
      <section className="challenge-catalog-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Guided Attack Laboratories</h2>
            <p className="section-subtitle">Select a technique to open its interactive simulation, playbook, and live query visualizer.</p>
          </div>
          <button
            type="button"
            className="btn-inspect-schema-hero"
            onClick={onOpenSchema}
          >
            🗄 Explore Target Database Schema
          </button>
        </div>

        <div className="challenge-cards-grid">
          {challenges.map((c, index) => (
            <Link to={c.path} key={c.id} className="catalog-card">
              <div className="card-top-bar">
                <span className="card-number">LAB / {String(index + 1).padStart(2, '0')}</span>
                <span className="card-category-badge">{c.category || 'SQL Injection'}</span>
                <span className="card-difficulty-badge">{c.difficulty || 'Intermediate'}</span>
              </div>

              <h3 className="card-title">{c.title}</h3>
              <p className="card-description">{c.description}</p>

              <div className="card-target-box">
                <span className="target-label">Vulnerable Target:</span>
                <code>{c.target}</code>
              </div>

              {c.concepts && (
                <div className="card-concepts-list">
                  {c.concepts.map(concept => (
                    <span key={concept} className="concept-tag">{concept}</span>
                  ))}
                </div>
              )}

              <div className="card-footer-cta">
                <span className="cta-text">Open Lab Environment</span>
                <span className="cta-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Educational Architecture Explanation Section */}
      <section className="architecture-explainer-section">
        <div className="explainer-header">
          <h2>How Vulnerable vs. Secure Mode Works</h2>
          <p>Every challenge in SQLi-Labs demonstrates the exact difference between insecure coding patterns and industry-standard defensive parameterization.</p>
        </div>

        <div className="architecture-grid">
          <div className="arch-card arch-vulnerable">
            <div className="arch-card-header">
              <span className="arch-icon">⚠️</span>
              <div>
                <h3>Vulnerable Mode (The Mistake)</h3>
                <span className="arch-sub">Direct String Concatenation / f-strings</span>
              </div>
            </div>
            <pre className="arch-code">
              <code>{`# Vulnerable: Raw string interpolation
query = f"SELECT * FROM products WHERE id = {product_id}"
cursor.execute(query)`}</code>
            </pre>
            <p>
              The user-supplied string is directly merged into the SQL syntax stream before parsing.
              Special characters (<code>'</code>, <code>"</code>, <code>--</code>, <code>UNION</code>)
              reshape the database command tree, executing attacker-controlled logic.
            </p>
          </div>

          <div className="arch-card arch-secure">
            <div className="arch-card-header">
              <span className="arch-icon">🛡️</span>
              <div>
                <h3>Secure Mode (The Defense)</h3>
                <span className="arch-sub">Parameterized Prepared Statements (%s)</span>
              </div>
            </div>
            <pre className="arch-code">
              <code>{`# Secure: Parameterized prepared statement
query = "SELECT * FROM products WHERE id = %s"
cursor.execute(query, (product_id,))`}</code>
            </pre>
            <p>
              The SQL template and user data are transmitted in separate database protocol packets.
              The database compiler compiles the query first and treats user parameters strictly
              as literal values, completely neutralizing SQL injection.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="lab-safety-disclaimer">
        <div className="disclaimer-icon">⚠️</div>
        <div className="disclaimer-text">
          <strong>Educational Environment Notice:</strong> This software is strictly for academic and defensive educational
          use at Middle East University. It operates within a local isolated database environment. Never test these attack
          techniques against public networks, servers, or applications without explicit written authorization.
        </div>
      </footer>
    </div>
  )
}
