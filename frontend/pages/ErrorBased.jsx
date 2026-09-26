import { useState } from 'react'
import { runErrorBased } from '../api'
import ModeToggle from '../components/ModeToggle'
import QueryVisualizer from '../components/QueryVisualizer'
import HintPanel from '../components/HintPanel'
import ResultsTable from '../components/ResultsTable'

export default function ErrorBased({ mode, setMode }) {
  const [productId, setProductId] = useState('1')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await runErrorBased(mode, productId)
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="challenge-page">
      <h1>Challenge 1: In-Band Error-Based SQLi</h1>
      <p>The product ID is inserted into a numeric SQL context. In Vulnerable
        mode, malformed input can trigger a MySQL error that is reflected
        back to you -- that reflection is what makes this "in-band."</p>

      <ModeToggle mode={mode} setMode={(nextMode) => { setMode(nextMode); setResult(null) }} />

      <HintPanel hints={[
        "Try a normal numeric ID first, e.g. 1, 2, 3.",
        "Try breaking the query: 1 OR 1=1",
        "Try forcing a descriptive DB error with a function like extractvalue(1, concat(0x7e, (SELECT version()))).",
        "Compare what happens in Secure mode with the exact same payload.",
      ]} />

      <form onSubmit={submit} className="challenge-form">
        <label>
          Product ID
          <input value={productId} onChange={(e) => setProductId(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Running...' : 'Submit'}</button>
      </form>

      {result && (
        <div className="result-block">
          <div className="result-heading"><strong>Submission result</strong><span>{result.elapsed_ms != null ? 'Response received' : 'Awaiting response'}</span></div>
          <QueryVisualizer query={result.query} elapsedMs={result.elapsed_ms} />
          {result.error && <div className="error-banner">DB Error: {result.error}</div>}
          <ResultsTable columns={result.columns} rows={result.rows} />
        </div>
      )}
    </div>
  )
}
