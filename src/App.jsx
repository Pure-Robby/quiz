import { useState } from 'react'
import Landing from './Landing'
import Quiz from './Quiz'
import Result from './Result'
import Leaderboard from './Leaderboard'

export default function App() {
  const [displayName, setDisplayName] = useState('')
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const handleStart = (name) => {
    setDisplayName(name.trim() || 'Anonymous')
    setStarted(true)
  }

  const handleFinish = (score, total, gaveUp, answers) => {
    const attemptId = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setResult({ score, total, gaveUp, answers, attemptId })
  }

  const handlePlayAgain = () => {
    setResult(null)
    setStarted(false)
  }

  const handleViewLeaderboard = () => {
    setShowLeaderboard(true)
    setStarted(false)
  }

  const handleBackFromLeaderboard = () => {
    setShowLeaderboard(false)
  }

  const handleLogout = () => {
    setStarted(false)
    setResult(null)
    setShowLeaderboard(false)
  }

  if (showLeaderboard) {
    return <Leaderboard onBack={handleBackFromLeaderboard} />
  }

  if (result !== null) {
    return (
      <Result
        displayName={displayName}
        score={result.score}
        total={result.total}
        gaveUp={result.gaveUp}
        attemptId={result.attemptId}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  if (started) {
    return (
      <Quiz
        displayName={displayName}
        onFinish={handleFinish}
        onViewLeaderboard={handleViewLeaderboard}
        onLogout={handleLogout}
      />
    )
  }

  return <Landing onStart={handleStart} onViewLeaderboard={handleViewLeaderboard} onLogout={handleLogout} />
}
