export default function QueryVisualizer({ query, elapsedMs }) {
  if (!query) return null
  return (
    <div className="query-visualizer">
      <div className="query-visualizer-header">
        <span>Live Query</span>
        {elapsedMs != null && <span className="elapsed">{elapsedMs} ms</span>}
      </div>
      <pre><code>{query}</code></pre>
    </div>
  )
}
