import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import ErrorBased from './pages/ErrorBased'
import UnionBased from './pages/UnionBased'
import BlindBoolean from './pages/BlindBoolean'
import BlindTime from './pages/BlindTime'

export default function App() {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <Link to="/" className="brand">SQLi-Labs</Link>
        <div className="nav-links">
          <Link to="/error-based">Error-Based</Link>
          <Link to="/union-based">UNION-Based</Link>
          <Link to="/blind-boolean">Blind Boolean</Link>
          <Link to="/blind-time">Blind Time</Link>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/error-based" element={<ErrorBased />} />
          <Route path="/union-based" element={<UnionBased />} />
          <Route path="/blind-boolean" element={<BlindBoolean />} />
          <Route path="/blind-time" element={<BlindTime />} />
        </Routes>
      </main>
    </div>
  )
}
