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
      <section className="home-intro">
        <div className="eyebrow">A hands-on web security lab</div>
        <h1>Learn SQL injection.<br /><span>See the query change.</span></h1>
        <p className="subtitle">
          Explore four common SQL injection techniques in a contained learning environment.
          Compare vulnerable and parameterized queries, then inspect how each payload affects the result.
        </p>
        <div className="home-meta"><span className="meta-chip">4 guided challenges</span><span className="meta-chip">Vulnerable &amp; secure modes</span><span className="meta-chip">Live query visualizer</span></div>
      </section>
      <div className="section-heading"><div><h2>Choose a challenge</h2><p>Start with a technique and work through its hints.</p></div></div>
      <div className="challenge-grid">
        {CHALLENGES.map((c) => (
          <Link to={c.path} key={c.path} className="challenge-card">
            <div className="card-top"><span className="challenge-number">LAB / {String(CHALLENGES.indexOf(c) + 1).padStart(2, '0')}</span><span className="challenge-tag">{c.title.split(' ')[0]}</span></div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <span className="card-action">Open challenge <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
      <aside className="disclaimer"><strong>Educational environment.</strong> Use these exercises only within this lab and its provided database. Do not test payloads against systems you do not own or have permission to assess.</aside>
    </div>
  )
}
