import { useState, useEffect } from 'react'
import { getCurrentUser, signInWithGoogle, signOut, isAllowedEmail, getDisplayNameFromUser } from './supabase'

export default function Landing({ onStart }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [domainError, setDomainError] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getCurrentUser().then((u) => {
      if (cancelled) return
      if (u && !isAllowedEmail(u.email)) {
        signOut().then(() => setUser(null))
        setDomainError(true)
      } else {
        setUser(u)
        setDomainError(false)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const handleSignIn = async () => {
    setAuthError(null)
    const res = await signInWithGoogle()
    if (res.error) setAuthError(res.error.message || 'Sign-in failed')
  }

  const handleStart = () => {
    onStart(user ? getDisplayNameFromUser(user) : 'Anonymous')
  }

  if (loading) {
    return (
      <main style={styles.main}>
        <p>Loading…</p>
      </main>
    )
  }

  if (domainError) {
    return (
      <main className="landing" style={styles.main}>
        <h1 style={styles.h1}>Cryptic Movie Quiz</h1>
        <p style={styles.error} role="alert">
          Only @puresurvey.co.za accounts can sign in. Please use your work email.
        </p>
        <button type="button" onClick={handleSignIn} style={styles.button}>
          Try again with another account
        </button>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="landing" style={styles.main}>
        <h1 style={styles.h1}>Cryptic Movie Quiz</h1>
        <p style={styles.p}>Answer the clues with film titles. Sign in with your puresurvey.co.za Google account to play.</p>
        {authError && <p style={styles.error} role="alert">{authError}</p>}
        <button type="button" onClick={handleSignIn} style={styles.button}>
          Sign in with Google
        </button>
      </main>
    )
  }

  return (
    <main className="landing" style={styles.main}>
      <h1 style={styles.h1}>Cryptic Movie Quiz</h1>
      <p style={styles.p}>Hi, {getDisplayNameFromUser(user)}. Answer the clues with film titles. Save when done or give up to see the answers.</p>
      <div style={styles.actions}>
        <button type="button" onClick={handleStart} style={styles.button}>
          Start quiz
        </button>
        <button type="button" onClick={() => signOut().then(() => setUser(null))} style={styles.buttonSecondary}>
          Sign out
        </button>
      </div>
    </main>
  )
}

const styles = {
  main: {
    maxWidth: 420,
    margin: '0 auto',
    padding: 24,
    textAlign: 'center',
  },
  h1: {
    fontSize: '1.75rem',
    marginBottom: 8,
  },
  p: {
    color: '#555',
    marginBottom: 24,
  },
  error: {
    color: '#c00',
    marginBottom: 16,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    padding: '12px 20px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
  },
  buttonSecondary: {
    padding: '12px 20px',
    background: 'transparent',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: 6,
  },
}
