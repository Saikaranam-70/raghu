// src/pages/ErrorPage.jsx
export default function ErrorPage({ error, pin, onRetry, onBack }) {
  const msg = error?.toLowerCase() || ''
  const isNotFound = msg.includes('not found') || msg.includes('404')
  const isNetwork  = msg.includes('network') || msg.includes('timeout') || msg.includes('backend')
  const isAuth     = msg.includes('api key') || msg.includes('401') || msg.includes('invalid api')

  const icon  = isNotFound ? '🔍' : isNetwork ? '📡' : isAuth ? '🔐' : '⚠️'
  const title = isNotFound ? 'Student Not Found'
    : isNetwork ? 'Connection Failed'
    : isAuth    ? 'Authentication Error'
    : 'Something Went Wrong'

  const hint = isNotFound
    ? `Roll number "${pin}" was not found in the spreadsheet. Please check and try again.`
    : isNetwork
    ? 'Could not reach the backend server. Make sure it is running on port 3000.'
    : isAuth
    ? 'API key mismatch between frontend and backend. Check your .env files.'
    : 'An unexpected error occurred. Please try again or contact support.'

  return (
    <div className="error-wrap">
      <div className="error-card">

        {/* Icon */}
        <div className="error-icon-wrap">{icon}</div>

        {/* Title */}
        <h2 className="error-title">{title}</h2>

        {/* Raw error */}
        <div className="error-msg">{error}</div>

        {/* Hint */}
        <p className="error-hint">{hint}</p>

        {/* Checklist */}
        {(isNetwork || isAuth) && (
          <div className="checklist">
            <div className="checklist-title">Quick Checklist</div>
            <ul>
              {isNetwork && <>
                <li>Run <code>npm run dev</code> inside <code>student_api_node/</code></li>
                <li>Backend should be on <code>http://localhost:3000</code></li>
                <li>Check for firewall or port conflicts</li>
              </>}
              {isAuth && <>
                <li>Copy <code>API_KEYS</code> value from backend <code>.env</code></li>
                <li>Paste it as <code>VITE_API_KEY</code> in frontend <code>.env</code></li>
                <li>Restart both servers after editing <code>.env</code></li>
              </>}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="btn-row">
          <button className="btn-ghost" onClick={onBack}>← Go Back</button>
          <button className="btn-solid" onClick={onRetry}>Try Again</button>
        </div>
      </div>
    </div>
  )
}
