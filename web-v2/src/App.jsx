import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getVolcabs } from './api'
import { buildQuestions, pointsFor, TIME_LIMIT, timeLimitFor } from './quiz'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import LeaderboardScreen from './components/LeaderboardScreen'
import Embers from './components/Embers'

const QUESTION_COUNT = 10
const START_LIVES = 1 // เริ่มเกมมีชีวิตเดียว (คงฟีล sudden death ช่วงต้น)
const MAX_LIVES = 3 // เพดานสะสม: ต่ำไว้ให้แต่ละชีวิตมีค่า + เฉียดตายบ่อย
const LIFE_EVERY = 5 // ตอบถูกติดครบเท่านี้ = ได้ชีวิตเพิ่ม

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
  const [lives, setLives] = useState(START_LIVES)
  const [answered, setAnswered] = useState(false) // ตอบข้อนี้แล้วหรือยัง — หยุด timer กันเสีย HP ตอนรอข้อใหม่

  // เวลาเต็มของข้อปัจจุบัน: Competitive บีบลงเรื่อย ๆ ตามจำนวนข้อ, Classic คงที่ 10 วิ
  const currentLimit = isEndless ? timeLimitFor(index) : TIME_LIMIT

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
    setQuestions(buildQuestions(volcabs, endless ? 100 : QUESTION_COUNT))
    setIndex(0)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setCorrectCount(0)
    setTimeLeft(TIME_LIMIT)
    setLives(START_LIVES)
    setAnswered(false)
    setStage('playing')
  }, [volcabs])

  const handleNext = useCallback((wasCorrect) => {
    // โหมด Competitive: ตอบผิด/หมดเวลา = เสีย 1 ชีวิต (ไม่ใช่ตายทันที)
    if (isEndless && wasCorrect === false) {
      if (lives <= 1) {
        setLives(0)
        setStage('result')
        return
      }
      setLives((lv) => lv - 1)
      // ยังมีชีวิตเหลือ → เล่นข้อถัดไปต่อ (ตกไปที่ setIndex ด้านล่าง)
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
  }, [questions.length, isEndless, volcabs, lives])

  // ---- countdown timer ----
  // รีเซ็ต timer + ปลดล็อก "ตอบแล้ว" ทุกครั้งที่เปลี่ยนข้อ (timer เริ่มเดินใหม่เมื่อข้อใหม่ขึ้น)
  useEffect(() => {
    if (stage !== 'playing') return
    setTimeLeft(currentLimit)
    setAnswered(false)
  }, [index, stage, currentLimit])

  // นับถอยหลังความละเอียด 0.1 วิ — หยุดทันทีเมื่อตอบแล้ว (กันเวลาหมดระหว่างรอข้อใหม่)
  useEffect(() => {
    if (stage !== 'playing' || answered) return
    const id = setInterval(() => {
      setTimeLeft((t) => (t <= 0 ? 0 : Math.round((t - 0.1) * 10) / 10))
    }, 100)
    return () => clearInterval(id)
  }, [stage, index, answered])

  // หมดเวลา → นับเป็นผิด + ข้ามข้อ (ข้ามถ้าตอบไปแล้ว เพื่อไม่ให้เสีย HP ทั้งที่ตอบถูก)
  useEffect(() => {
    if (stage !== 'playing' || answered) return
    if (timeLeft > 0) return
    setStreak(0)
    handleNext(false)
  }, [timeLeft, stage, answered, handleNext])

  const handleAnswer = useCallback(
    (isCorrect) => {
      setAnswered(true) // หยุด timer ทันทีที่ตอบ (ทั้งถูก/ผิด) กันหมดเวลาระหว่างรอข้อใหม่
      if (isCorrect) {
        const next = streak + 1
        setStreak(next)
        setBestStreak((b) => Math.max(b, next))
        setScore((sc) => sc + pointsFor(next, timeLeft, currentLimit))
        setCorrectCount((c) => c + 1)
        // ตอบถูกครบทุก 5 ติด = ได้ชีวิตเพิ่ม (เพดาน MAX_LIVES)
        if (isEndless && next % LIFE_EVERY === 0) {
          setLives((lv) => Math.min(MAX_LIVES, lv + 1))
        }
      } else {
        setStreak(0)
      }
    },
    [streak, timeLeft, currentLimit, isEndless]
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
                onViewLeaderboard={() => setStage('leaderboard')}
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
                timeLimit={currentLimit}
                onAnswer={handleAnswer}
                onNext={handleNext}
                isEndless={isEndless}
                lives={lives}
                maxLives={MAX_LIVES}
                lifeEvery={LIFE_EVERY}
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
                isEndless={isEndless}
              />
            </motion.div>
          )}

          {stage === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="stage"
            >
              <LeaderboardScreen
                onBack={() => setStage('start')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* <footer className="credit">WordYQuiz 2.0 · React + Go Fiber</footer> */}
    </div>
  )
}
