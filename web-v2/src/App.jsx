import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getVolcabs } from './api'
import { buildQuestions, pointsFor } from './quiz'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import Embers from './components/Embers'

const QUESTION_COUNT = 10

export default function App() {
  const [stage, setStage] = useState('start') // start | playing | result
  const [volcabs, setVolcabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ----- quiz runtime state -----
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    let alive = true
    getVolcabs()
      .then((data) => {
        if (!alive) return
        setVolcabs(data)
        setLoading(false)
      })
      .catch((e) => {
        if (!alive) return
        setError(e.message)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const start = useCallback(() => {
    setQuestions(buildQuestions(volcabs, QUESTION_COUNT))
    setIndex(0)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setCorrectCount(0)
    setStage('playing')
  }, [volcabs])

  const handleAnswer = useCallback(
    (isCorrect) => {
      if (isCorrect) {
        const next = streak + 1
        setStreak(next)
        setBestStreak((b) => Math.max(b, next))
        setScore((sc) => sc + pointsFor(next))
        setCorrectCount((c) => c + 1)
      } else {
        setStreak(0)
      }
    },
    [streak]
  )

  const handleNext = useCallback(() => {
    setIndex((i) => {
      const next = i + 1
      if (next >= questions.length) {
        setStage('result')
        return i
      }
      return next
    })
  }, [questions.length])

  const fireLevel = Math.min(streak, 6) // 0..6 ระดับความแรงของไฟ

  return (
    <div className={`app fire-${fireLevel >= 3 ? 'on' : 'off'}`}>
      <Embers level={fireLevel} />
      <div className="stage-wrap">
        <AnimatePresence mode="wait">
          {stage === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="stage"
            >
              <StartScreen
                loading={loading}
                error={error}
                count={Math.min(QUESTION_COUNT, volcabs.length)}
                total={volcabs.length}
                onStart={start}
              />
            </motion.div>
          )}

          {stage === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="stage"
            >
              <QuizScreen
                question={questions[index]}
                index={index}
                total={questions.length}
                score={score}
                streak={streak}
                fireLevel={fireLevel}
                onAnswer={handleAnswer}
                onNext={handleNext}
              />
            </motion.div>
          )}

          {stage === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="stage"
            >
              <ResultScreen
                score={score}
                total={questions.length}
                correctCount={correctCount}
                bestStreak={bestStreak}
                onRestart={() => setStage('start')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <footer className="credit">WordYQuiz 2.0 · React + Go Fiber</footer>
    </div>
  )
}
