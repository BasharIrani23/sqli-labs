import { useState } from 'react'
import { runBlindTime } from '../api'
import ModeToggle from '../components/ModeToggle'
import QueryVisualizer from '../components/QueryVisualizer'
import HintPanel from '../components/HintPanel'

export default function BlindTime() {
  const [mode, setMode] = useState('vulnerable')
  const [username, setUsername] = useState('alice')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await runBlindTime(mode, username)
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="challenge-page">
      <h1>Challenge 4: Blind Time-Based SQLi</h1>
      <p>A "check username" lookup. The response body never changes -- the
        only signal is how long the request takes. This is the hardest
        challenge: you have to reason about timing, not content.</p>

      <ModeToggle mode={mode} setMode={setMode} />

      <HintPanel hints={[
        "Submit a normal username first and note the baseline elapsed_ms.",
        "Try injecting a delay: alice' AND SLEEP(2)-- -",
        "If the response takes ~2000ms longer, the injection point is confirmed.",
        "This technique works even when the app shows zero content difference.",
      ]} />

      <form onSubmit={submit} className="challenge-form">
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Running...' : 'Submit'}</button>
      </form>

      {result && (
        <div className="result-block">
          <QueryVisualizer query={result.query} elapsedMs={result.elapsed_ms} />
          <div className="status-banner neutral">{result.message}</div>
        </div>
      )}
    </div>
  )
}
