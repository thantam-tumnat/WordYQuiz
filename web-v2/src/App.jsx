import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getVolcabs } from './api'
import { buildQuestions, pointsFor, TIME_LIMIT } from './quiz'
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
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [isEndless, setIsEndless] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(true)

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

  const start = useCallback((endless = false) => {
    setIsEndless(endless)
    setLastCorrect(true)
    setQuestions(buildQuestions(volcabs, endless ? 100 : QUESTION_COUNT))
    setIndex(0)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setCorrectCount(0)
    setTimeLeft(TIME_LIMIT)
    setStage('playing')
  }, [volcabs])

  const handleNext = useCallback(() => {
    if (isEndless && !lastCorrect) {
      setStage('result')
      return
    }
    setIndex((i) => {
      const next = i + 1
      if (isEndless) {
        if (next >= questions.length) {
          setQuestions((prev) => [...prev, ...buildQuestions(volcabs, 10)])
        }
        return next
      }
      if (next >= questions.length) {
        setStage('result')
        return i
      }
      return next
    })
  }, [questions.length, isEndless, lastCorrect, volcabs])

  // ---- countdown timer ----
  // รีเซ็ต timer ทุกครั้งที่เปลี่ยนข้อ
  useEffect(() => {
    if (stage !== 'playing') return
    setTimeLeft(TIME_LIMIT)
  }, [index, stage])

  // นับถอยหลังทุกวินาที
  useEffect(() => {
    if (stage !== 'playing') return
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [stage, timeLeft])

  // หมดเวลา → นับเป็นผิด + ข้ามข้อ
  useEffect(() => {
    if (stage !== 'playing') return
    if (timeLeft > 0) return
    setStreak(0)
    setLastCorrect(false)
    handleNext()
  }, [timeLeft, stage, handleNext])

  const handleAnswer = useCallback(
    (isCorrect) => {
      setLastCorrect(isCorrect)
      if (isCorrect) {
        const next = streak + 1
        setStreak(next)
        setBestStreak((b) => Math.max(b, next))
        setScore((sc) => sc + pointsFor(next, timeLeft))
        setCorrectCount((c) => c + 1)
      } else {
        setStreak(0)
      }
    },
    [streak, timeLeft]
  )


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
                timeLeft={timeLeft}
                timeLimit={TIME_LIMIT}
                onAnswer={handleAnswer}
                onNext={handleNext}
                isEndless={isEndless}
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
                total={isEndless ? index + 1 : questions.length}
                correctCount={correctCount}
                bestStreak={bestStreak}
                onRestart={() => setStage('start')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* <footer className="credit">WordYQuiz 2.0 · React + Go Fiber</footer> */}
    </div>
  )
}
