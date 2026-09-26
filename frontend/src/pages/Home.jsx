import { Link } from 'react-router-dom'

const CHALLENGES = [
  { path: '/error-based', title: 'In-Band Error-Based', desc: 'Product lookup by ID reflects raw DB errors.' },
  { path: '/union-based', title: 'UNION-Based', desc: 'Product search vulnerable to UNION SELECT extraction.' },
  { path: '/blind-boolean', title: 'Blind Boolean-Based', desc: 'Login check leaks only a true/false signal.' },
  { path: '/blind-time', title: 'Blind Time-Based', desc: 'Username lookup leaks only response timing.' },
]

export default function Home() {
  return (
    <div className="home">
      <h1>SQLi-Labs</h1>
      <p className="subtitle">
        An interactive platform for teaching SQL Injection attacks and defenses.
        Pick a challenge, toggle between Vulnerable and Secure mode, and watch
        the Live Query Visualizer show you exactly what SQL runs.
      </p>
      <div className="challenge-grid">
        {CHALLENGES.map((c) => (
          <Link to={c.path} key={c.path} className="challenge-card">
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
