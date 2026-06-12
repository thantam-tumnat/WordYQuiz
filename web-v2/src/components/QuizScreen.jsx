import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import FireStreak from './FireStreak'
import { pointsFor } from '../quiz'

export default function QuizScreen({
  question,
  index,
  total,
  score,
  streak,
  fireLevel,
  timeLeft,
  timeLimit,
  onAnswer,
  onNext,
}) {
  const timerPct = (timeLeft / timeLimit) * 100
  const timerColor = timeLeft > 5 ? 'ok' : timeLeft >= 3 ? 'warn' : 'danger'
  const [picked, setPicked] = useState(null)
  const [locked, setLocked] = useState(false)

  // รีเซ็ตทุกครั้งที่เปลี่ยนข้อ
  useEffect(() => {
    setPicked(null)
    setLocked(false)
  }, [index])

  if (!question) return null

  const pick = (choice) => {
    if (locked) return
    setPicked(choice)
    setLocked(true)
    const isCorrect = choice === question.answer
    onAnswer(isCorrect)
    setTimeout(onNext, isCorrect ? 950 : 1300)
  }

  const stateOf = (choice) => {
    if (!locked) return 'idle'
    if (choice === question.answer) return 'correct'
    if (choice === picked) return 'wrong'
    return 'dim'
  }

  const progress = ((index + (locked ? 1 : 0)) / total) * 100

  return (
    <div className="quiz">
      {/* ---- top bar: progress + score ---- */}
      <div className="hud">
        <div className="hud-left">
          <span className="hud-label">ข้อ</span>
          <span className="hud-value">
            {index + 1}<span className="hud-sub">/{total}</span>
          </span>
        </div>
        <FireStreak streak={streak} level={fireLevel} />
        <div className="hud-right">
          <span className="hud-label">คะแนน</span>
          <motion.span
            key={score}
            className="hud-value score"
            initial={{ scale: 1.4, color: '#ffd479' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.35 }}
          >
            {score}
          </motion.span>
        </div>
      </div>

      <div className="progress">
        <motion.div
          className="progress-fill"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* ---- countdown timer ---- */}
      <div className="timer">
        <div className="timer-bar">
          <motion.div
            className={`timer-fill ${timerColor}`}
            animate={{ width: `${timerPct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <span className={`timer-num ${timerColor}`}>{timeLeft}</span>
      </div>

      {/* ---- question word ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.word}
          className="question"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.3 }}
        >
          <span className="question-eyebrow">คำศัพท์นี้แปลว่าอะไร?</span>
          <h2 className="question-word">
            {question.word}
            {question.partOfSpeech && (
              <span className="question-pos">({question.partOfSpeech})</span>
            )}
          </h2>
          {streak >= 1 && (
            <span className="bonus-tag">+{pointsFor(streak + 1, timeLeft)} ถ้าตอบถูก</span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ---- choices ---- */}
      <div className="choices">
        {question.choices.map((choice, i) => {
          const st = stateOf(choice)
          return (
            <motion.button
              key={choice + i}
              className={`choice choice-${st}`}
              onClick={() => pick(choice)}
              disabled={locked}
              initial={{ opacity: 0, y: 16 }}
              animate={
                st === 'wrong'
                  ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
                  : { opacity: 1, y: 0 }
              }
              transition={{ delay: locked ? 0 : i * 0.06, duration: 0.3 }}
              whileHover={!locked ? { scale: 1.02 } : {}}
              whileTap={!locked ? { scale: 0.98 } : {}}
            >
              <span className="choice-key">{String.fromCharCode(65 + i)}</span>
              <span className="choice-text">{choice}</span>
              {st === 'correct' && <span className="choice-mark">✓</span>}
              {st === 'wrong' && <span className="choice-mark">✕</span>}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
