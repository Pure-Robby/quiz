import { useState } from 'react'
import Landing from './Landing'
import Quiz from './Quiz'
import Result from './Result'

export default function App() {
  const [displayName, setDisplayName] = useState('')
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState(null)

  const handleStart = (name) => {
    setDisplayName(name.trim() || 'Anonymous')
    setStarted(true)
  }

  const handleFinish = (score, total, gaveUp, answers) => {
    setResult({ score, total, gaveUp, answers })
  }

  const handlePlayAgain = () => {
    setResult(null)
    setStarted(false)
  }

  if (result !== null) {
    return (
      <Result
        displayName={displayName}
        score={result.score}
        total={result.total}
        gaveUp={result.gaveUp}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  if (started) {
    return (
      <Quiz
        displayName={displayName}
        onFinish={handleFinish}
      />
    )
  }

  return <Landing onStart={handleStart} />
}
