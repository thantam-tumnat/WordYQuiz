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
  isEndless,
  lives = 0,
  maxLives = 3,
  lifeEvery = 5,
}) {
  const timerPct = Math.max(0, (timeLeft / timeLimit) * 100)
  const shownTime = Math.max(0, Math.ceil(timeLeft)) // timeLeft เป็นทศนิยม แสดงเป็นวินาทีเต็ม
  const timerColor = shownTime > 5 ? 'ok' : shownTime >= 3 ? 'warn' : 'danger'
  const [picked, setPicked] = useState(null)
  const [locked, setLocked] = useState(false)
  const [gain, setGain] = useState(null) // คะแนนที่เพิ่งได้ (โชว์ลอยขึ้นที่ช้อยส์ถูก)

  // รีเซ็ตทุกครั้งที่เปลี่ยนข้อ
  useEffect(() => {
    setPicked(null)
    setLocked(false)
    setGain(null)
  }, [index])

  if (!question) return null

  // สีแรงขึ้นตามขนาดรางวัล: เร็ว/combo สูง = ร้อนกว่า
  const gainTier = (v) => (v >= 1000 ? 'fire' : v >= 600 ? 'good' : 'plain')

  const pick = (choice) => {
    if (locked) return
    setPicked(choice)
    setLocked(true)
    const isCorrect = choice === question.answer
    if (isCorrect) setGain(pointsFor(streak + 1, timeLeft, timeLimit))
    onAnswer(isCorrect)
    setTimeout(() => onNext(isCorrect), isCorrect ? 950 : 1300)
  }

  const stateOf = (choice) => {
    if (!locked) return 'idle'
    if (choice === question.answer) return 'correct'
    if (choice === picked) return 'wrong'
    return 'dim'
  }

  const progress = isEndless ? 0 : ((index + (locked ? 1 : 0)) / total) * 100

  return (
    <div className="quiz">
      {/* ---- top bar: progress + score ---- */}
      <div className="hud">
        <div className="hud-left">
          <span className="hud-label">ข้อ</span>
          <span className="hud-value">
            {index + 1}<span className="hud-sub">{isEndless ? ' / ♾️' : `/${total}`}</span>
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

      {/* ---- lives (โหมด Competitive) ---- */}
      {isEndless && (
        <div className="lives-bar">
          <div className="hearts">
            <AnimatePresence mode="popLayout" initial={false}>
              {Array.from({ length: lives }).map((_, i) => (
                <motion.span
                  key={i}
                  className="heart"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: [0, 1.35, 1], rotate: 0 }}
                  exit={{ scale: 0, rotate: 35, opacity: 0, x: [0, -5, 5, -3, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  ❤️
                </motion.span>
              ))}
            </AnimatePresence>
            {Array.from({ length: Math.max(0, maxLives - lives) }).map((_, i) => (
              <span key={`empty-${i}`} className="heart heart-empty">🤍</span>
            ))}
          </div>
          {lives >= maxLives ? (
            <span className="life-meter life-meter-max">ชีวิตเต็ม</span>
          ) : (
            <span className="life-meter" title="ตอบถูกติดกันเพื่อได้ชีวิตเพิ่ม">
              {Array.from({ length: lifeEvery }).map((_, n) => (
                <span key={n} className={`pip ${n < streak % lifeEvery ? 'pip-on' : ''}`} />
              ))}
              <span className="life-meter-ico">❤️</span>
            </span>
          )}
        </div>
      )}

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
            transition={{ duration: 0.2, ease: 'linear' }}
          />
        </div>
        <span className={`timer-num ${timerColor}`}>{shownTime}</span>
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
            <span className="bonus-tag">+{pointsFor(streak + 1, timeLeft, timeLimit)} ถ้าตอบถูก</span>
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
              <AnimatePresence>
                {st === 'correct' && gain != null && (
                  <motion.span
                    className={`gain-float gain-${gainTier(gain)}`}
                    initial={{ opacity: 0, y: 6, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -52, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut', times: [0, 0.15, 0.7, 1] }}
                  >
                    +{gain}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
