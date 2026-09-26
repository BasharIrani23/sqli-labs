export default function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Query execution mode">
      <button
        className={mode === 'vulnerable' ? 'active vulnerable' : 'vulnerable'}
        aria-pressed={mode === 'vulnerable'}
        onClick={() => setMode('vulnerable')}
      >
        Vulnerable Mode
      </button>
      <button
        className={mode === 'secure' ? 'active secure' : 'secure'}
        aria-pressed={mode === 'secure'}
        onClick={() => setMode('secure')}
      >
        Secure Mode
      </button>
    </div>
  )
}
