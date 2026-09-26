import { useState } from 'react'

export default function HintPanel({ hints }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="hint-panel">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Hide hints' : 'Show hints'}
      </button>
      {open && (
        <ul>
          {hints.map((hint, index) => <li key={index}>{hint}</li>)}
        </ul>
      )}
    </div>
  )
}
