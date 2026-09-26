import { useState } from 'react'

export default function HintPanel({ hints }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="hint-panel">
      <button onClick={() => setOpen(!open)}>
        {open ? 'Hide Hints ▲' : 'Show Hints ▼'}
      </button>
      {open && (
        <ul>
          {hints.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
    </div>
  )
}
