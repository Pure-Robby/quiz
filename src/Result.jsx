import { useState, useEffect } from 'react'
import { getCurrentUser, submitAttempt, getLeaderboard, findRankInLeaderboard } from './supabase'

const LEADERBOARD_LIMIT = 50

export default function Result({ displayName, score, total, gaveUp, onPlayAgain }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [rank, setRank] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      const user = await getCurrentUser()
      const userId = user?.id ?? null
      const answersJson = null
      const res = await submitAttempt({
        userId,
        displayName,
        score,
        total,
        gaveUp,
        answersJson,
      })
      if (cancelled) return
      if (res.error) {
        setError(res.error.message || 'Failed to save score')
        const { data } = await getLeaderboard(LEADERBOARD_LIMIT)
        setLeaderboard(data || [])
        return
      }
      setSubmitted(true)
      const { data: list } = await getLeaderboard(LEADERBOARD_LIMIT)
      setLeaderboard(list || [])
      const inserted = res.data
      if (inserted) {
        const r = findRankInLeaderboard(list || [], {
          score,
          displayName,
          created_at: inserted.created_at,
        })
        setRank(r)
      }
    }
    run()
    return () => { cancelled = true }
  }, [displayName, score, total, gaveUp])

  return (
    <main className="result" style={styles.main}>
      <h1 style={styles.h1}>Results</h1>
      <p style={styles.score}>
        {displayName}, you got <strong>{score}/{total}</strong>
        {gaveUp && ' (gave up)'}.
      </p>
      {error && <p style={styles.error} role="alert">{error}</p>}
      {rank !== null && submitted && (
        <p style={styles.rank}>You ranked <strong>#{rank}</strong> of {leaderboard.length} shown.</p>
      )}

      <section aria-labelledby="leaderboard-heading" style={styles.section}>
        <h2 id="leaderboard-heading" style={styles.h2}>Leaderboard</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th scope="col" style={styles.th}>#</th>
              <th scope="col" style={styles.th}>Name</th>
              <th scope="col" style={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr key={row.id} style={styles.tr}>
                <td style={styles.td}>{row.rank}</td>
                <td style={styles.td}>{row.display_name}</td>
                <td style={styles.td}>{row.score}/{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaderboard.length === 0 && !error && <p style={styles.empty}>No scores yet.</p>}
      </section>

      <button type="button" onClick={onPlayAgain} style={styles.button}>
        Play again
      </button>
    </main>
  )
}

const styles = {
  main: { maxWidth: 560, margin: '0 auto', padding: 24 },
  h1: { fontSize: '1.5rem', marginBottom: 8 },
  score: { marginBottom: 8 },
  rank: { marginBottom: 24 },
  error: { color: '#c00', marginBottom: 16 },
  section: { marginBottom: 24 },
  h2: { fontSize: '1.125rem', marginBottom: 12 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #ddd', fontWeight: 600 },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '8px 12px' },
  empty: { color: '#666', marginTop: 12 },
  button: { padding: '12px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 },
}
