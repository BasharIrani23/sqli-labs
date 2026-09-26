export default function ResultsTable({ columns, rows }) {
  if (!columns || columns.length === 0) return null
  return (
    <>
      <div className="results-heading">Returned rows <span>({rows?.length ?? 0})</span></div>
      <div className="table-wrap">
        <table className="results-table">
          <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {(rows || []).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{String(cell)}</td>)}</tr>)}
          </tbody>
        </table>
        {(!rows || rows.length === 0) && <div className="empty-results">No rows returned for this payload.</div>}
      </div>
    </>
  )
}
