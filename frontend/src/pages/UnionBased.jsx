import { useState } from 'react'
import { runUnionBased } from '../api'
import ModeToggle from '../components/ModeToggle'
import QueryVisualizer from '../components/QueryVisualizer'
import HintPanel from '../components/HintPanel'
import ResultsTable from '../components/ResultsTable'

export default function UnionBased() {
  const [mode, setMode] = useState('vulnerable')
  const [search, setSearch] = useState('bottle')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await runUnionBased(mode, search)
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="challenge-page">
      <h1>Challenge 2: UNION-Based SQLi</h1>
      <p>This is a product search box. The query selects 3 columns
        (id, name, price). There's a hidden table with a matching column
        count -- can you pull data out of it with a UNION SELECT?</p>

      <ModeToggle mode={mode} setMode={setMode} />

      <HintPanel hints={[
        "Start by searching a normal term, e.g. 'bottle'.",
        "Figure out the column count first: try ' UNION SELECT 1,2,3-- -",
        "Once columns line up, try pulling from a guessed table name, e.g. admin_secrets.",
        "Try: ' UNION SELECT id, secret_name, secret_value FROM admin_secrets-- -",
      ]} />

      <form onSubmit={submit} className="challenge-form">
        <label>
          Search products
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Running...' : 'Submit'}</button>
      </form>

      {result && (
        <div className="result-block">
          <QueryVisualizer query={result.query} elapsedMs={result.elapsed_ms} />
          {result.error && <div className="error-banner">DB Error: {result.error}</div>}
          <ResultsTable columns={result.columns} rows={result.rows} />
        </div>
      )}
    </div>
  )
}
