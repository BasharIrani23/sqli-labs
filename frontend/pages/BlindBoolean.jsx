import { useState } from 'react'
import { runBlindBoolean } from '../api'
import ModeToggle from '../components/ModeToggle'
import QueryVisualizer from '../components/QueryVisualizer'
import HintPanel from '../components/HintPanel'

export default function BlindBoolean({ mode, setMode }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('wrongpassword')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await runBlindBoolean(mode, username, password)
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="challenge-page">
      <h1>Challenge 3: Blind Boolean-Based SQLi</h1>
      <p>A login form. You only ever see "Login successful" or "Login failed"
        -- no data, no DB errors. Can you get past authentication, or infer
        database contents, using only that boolean signal?</p>

      <ModeToggle mode={mode} setMode={(nextMode) => { setMode(nextMode); setResult(null) }} />

      <HintPanel hints={[
        "Try the real credentials first to see what success looks like.",
        "Try a classic bypass in the password field: ' OR '1'='1",
        "Try commenting out the password check: admin'-- - as the username.",
        "Compare the same payloads in Secure mode.",
      ]} />

      <form onSubmit={submit} className="challenge-form">
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Running...' : 'Submit'}</button>
      </form>

      {result && (
        <div className="result-block">
          <div className="result-heading"><strong>Submission result</strong><span>{result.elapsed_ms != null ? 'Response received' : 'Awaiting response'}</span></div>
          <QueryVisualizer query={result.query} elapsedMs={result.elapsed_ms} />
          {result.error ? <div className="error-banner" role="alert">{result.error}</div> : (
            <div className={result.success ? 'status-banner success' : 'status-banner fail'} role="status">{result.message || (result.success ? 'Login successful.' : 'Login failed.')}</div>
          )}
        </div>
      )}
    </div>
  )
}
