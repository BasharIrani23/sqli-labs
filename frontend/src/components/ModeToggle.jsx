export default function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle">
      <button
        className={mode === 'vulnerable' ? 'active vulnerable' : 'vulnerable'}
        onClick={() => setMode('vulnerable')}
      >
        Vulnerable Mode
      </button>
      <button
        className={mode === 'secure' ? 'active secure' : 'secure'}
        onClick={() => setMode('secure')}
      >
        Secure Mode
      </button>
    </div>
  )
}
