import { useEffect, useState } from 'react'
import { getLeaderboard, clearAllResults, getCurrentUser, isLeaderboardOwner } from './supabase'

const LEADERBOARD_LIMIT = 50

export default function Leaderboard({ onBack }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getCurrentUser()
      setIsOwner(isLeaderboardOwner(user?.email))
      const { data, error: loadError } = await getLeaderboard(LEADERBOARD_LIMIT)
      if (cancelled) return
      if (loadError) {
        setError(loadError.message || 'Failed to load leaderboard')
      } else {
        setRows(data || [])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleClearAllResults = async () => {
    const confirmed = window.confirm('Clear ALL leaderboard results for everyone? This cannot be undone.')
    if (!confirmed) return
    setClearing(true)
    setError(null)
    setMessage(null)
    const { error: clearError, deletedCount } = await clearAllResults()
    if (clearError) {
      setError(clearError.message || 'Failed to clear all results')
      setClearing(false)
      return
    }
    setMessage(`Cleared ${deletedCount} result(s).`)
    const { data, error: loadError } = await getLeaderboard(LEADERBOARD_LIMIT)
    if (loadError) {
      setError(loadError.message || 'Failed to refresh leaderboard')
    } else {
      setRows(data || [])
    }
    setClearing(false)
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Leaderboard</h1>
      {loading && <p>Loading leaderboard...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.message}>{message}</p>}
      {!loading && !error && rows.length === 0 && <p style={styles.empty}>No scores yet.</p>}

      {!loading && rows.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th scope="col" style={styles.th}>#</th>
              <th scope="col" style={styles.th}>Name</th>
              <th scope="col" style={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={styles.tr}>
                <td style={styles.td}>{row.rank}</td>
                <td style={styles.td}>{row.display_name}</td>
                <td style={styles.td}>{row.score}/{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={styles.actions}>
        {isOwner && (
          <button type="button" onClick={handleClearAllResults} disabled={clearing} style={styles.buttonDanger}>
            {clearing ? 'Clearing...' : 'Clear all results'}
          </button>
        )}
        <button type="button" onClick={onBack} style={styles.button}>
          Back
        </button>
      </div>
    </main>
  )
}

const styles = {
  main: { maxWidth: 560, margin: '0 auto', padding: 24 },
  h1: { fontSize: '1.5rem', marginBottom: 12 },
  error: { color: '#c00', marginBottom: 12 },
  message: { color: '#1f6d1f', marginBottom: 12 },
  empty: { color: '#666', marginBottom: 12 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem', marginBottom: 16 },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #ddd', fontWeight: 600 },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '8px 12px' },
  actions: { display: 'flex', gap: 10, marginTop: 10 },
  buttonDanger: { padding: '12px 24px', background: '#8b0000', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 },
  button: { padding: '12px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 },
}
