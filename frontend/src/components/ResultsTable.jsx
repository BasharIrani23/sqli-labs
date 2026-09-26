export default function ResultsTable({ columns, rows }) {
  if (!columns || columns.length === 0) return null
  return (
    <table className="results-table">
      <thead>
        <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => <td key={j}>{String(cell)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
