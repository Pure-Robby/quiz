import { useState, useEffect } from 'react'

const normalize = (s) => String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ')

function checkAnswer(userAnswer, correctAnswer) {
  const a = normalize(userAnswer)
  const b = normalize(correctAnswer)
  if (a === b) return true
  return a === normalize(b.replace(/[:\-–—]/g, ' '))
}

export default function Quiz({ displayName, onFinish }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/quiz.json')
      .then((r) => r.json())
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [])

  const total = questions.length
  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))

  const handleSave = () => {
    setSubmitted(true)
    let score = 0
    const results = questions.map((q) => {
      const correct = checkAnswer(answers[q.id], q.answer)
      if (correct) score++
      return { id: q.id, clue: q.clue, answer: q.answer, userAnswer: answers[q.id] ?? '', correct }
    })
    onFinish(score, total, false, results)
  }

  const handleGiveUp = () => {
    setSubmitted(true)
    let score = 0
    const results = questions.map((q) => {
      const correct = checkAnswer(answers[q.id], q.answer)
      if (correct) score++
      return { id: q.id, clue: q.clue, answer: q.answer, userAnswer: answers[q.id] ?? '', correct }
    })
    onFinish(score, total, true, results)
  }

  if (loading) {
    return (
      <main style={{ padding: 24, textAlign: 'center' }}>
        <p>Loading quiz…</p>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main style={{ padding: 24, textAlign: 'center' }}>
        <p>No questions found. Run <code>npm run quiz:build</code> to generate quiz data.</p>
      </main>
    )
  }

  return (
    <main className="quiz" style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Cryptic Movie Quiz</h1>
        <p style={styles.sub}>Hi, {displayName}. {total} questions.</p>
      </header>

      <ol style={styles.list}>
        {questions.map((q) => (
          <li key={q.id} style={styles.item}>
            <label htmlFor={`q-${q.id}`} style={styles.clue}>
              {q.clue}
            </label>
            <input
              id={`q-${q.id}`}
              type="text"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              placeholder="Film title"
              disabled={submitted}
              style={styles.input}
            />
          </li>
        ))}
      </ol>

      <div style={styles.actions}>
        <button type="button" onClick={handleSave} disabled={submitted} style={styles.button}>
          Save
        </button>
        <button type="button" onClick={handleGiveUp} disabled={submitted} style={styles.buttonSecondary}>
          Give up
        </button>
      </div>
    </main>
  )
}

const styles = {
  main: { maxWidth: 560, margin: '0 auto', padding: 24 },
  header: { marginBottom: 24 },
  h1: { fontSize: '1.5rem', marginBottom: 4 },
  sub: { color: '#555', margin: 0 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { marginBottom: 20 },
  clue: { display: 'block', fontWeight: 500, marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 },
  actions: { display: 'flex', gap: 12, marginTop: 24 },
  button: { padding: '12px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 },
  buttonSecondary: { padding: '12px 24px', background: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: 6 },
}
