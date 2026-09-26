import { useState } from 'react'
import { Routes, Route, NavLink, Link } from 'react-router-dom'
import Home from './pages/Home'
import ErrorBased from './pages/ErrorBased'
import UnionBased from './pages/UnionBased'
import BlindBoolean from './pages/BlindBoolean'
import BlindTime from './pages/BlindTime'

export default function App() {
  const [mode, setMode] = useState('vulnerable')
  return (
    <div className="app-shell">
      <nav className="navbar">
        <Link to="/" className="brand"><span className="brand-mark">SQL</span><span>SQLi-Labs</span></Link>
        <div className="nav-links">
          <NavLink end to="/">Overview</NavLink>
          <NavLink to="/error-based">Error-Based</NavLink>
          <NavLink to="/union-based">UNION-Based</NavLink>
          <NavLink to="/blind-boolean">Blind Boolean</NavLink>
          <NavLink to="/blind-time">Blind Time</NavLink>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/error-based" element={<ErrorBased mode={mode} setMode={setMode} />} />
          <Route path="/union-based" element={<UnionBased mode={mode} setMode={setMode} />} />
          <Route path="/blind-boolean" element={<BlindBoolean mode={mode} setMode={setMode} />} />
          <Route path="/blind-time" element={<BlindTime mode={mode} setMode={setMode} />} />
        </Routes>
      </main>
    </div>
  )
}
