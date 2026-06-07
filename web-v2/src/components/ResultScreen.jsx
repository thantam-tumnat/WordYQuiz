import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getHighScores, postHighScore } from '../api'

export default function ResultScreen({ score, total, correctCount, bestStreak, onRestart }) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState([])
  const [err, setErr] = useState(null)

  const loadScores = () =>
    getHighScores()
      .then((rows) => {
        const sorted = [...rows].sort(
          (a, b) => (parseInt(b.score) || 0) - (parseInt(a.score) || 0)
        )
        setScores(sorted.slice(0, 8))
      })
      .catch((e) => setErr(e.message))

  useEffect(() => {
    loadScores()
  }, [])

  const submit = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await postHighScore(name.trim(), score)
      setSaved(true)
      await loadScores()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const accuracy = total ? Math.round((correctCount / total) * 100) : 0

  return (
    <div className="card result-card">
      <motion.div
        className="result-emoji"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '🎉' : '💪'}
      </motion.div>
      <h2 className="result-title">จบเกม!</h2>

      <motion.div
        className="final-score"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring' }}
      >
        {score}
        <span className="final-score-unit">คะแนน</span>
      </motion.div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-val">{correctCount}/{total}</span>
          <span className="stat-lab">ตอบถูก</span>
        </div>
        <div className="stat">
          <span className="stat-val">{accuracy}%</span>
          <span className="stat-lab">ความแม่น</span>
        </div>
        <div className="stat">
          <span className="stat-val">🔥 {bestStreak}</span>
          <span className="stat-lab">streak สูงสุด</span>
        </div>
      </div>

      {!saved ? (
        <div className="save-row">
          <input
            className="name-input"
            placeholder="ใส่ชื่อเพื่อบันทึกคะแนน"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <motion.button
            className="btn btn-fire"
            onClick={submit}
            disabled={!name.trim() || saving}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </motion.button>
        </div>
      ) : (
        <p className="saved-msg">บันทึกคะแนนแล้ว ✓</p>
      )}

      <div className="leaderboard">
        <h3 className="lb-title">🏅 อันดับคะแนนสูงสุด</h3>
        {err && <p className="hint">โหลดอันดับไม่ได้: {err}</p>}
        {scores.length === 0 && !err && <p className="hint">ยังไม่มีคะแนน</p>}
        <ol className="lb-list">
          {scores.map((s, i) => (
            <li key={s.id ?? i} className={`lb-item ${i === 0 ? 'lb-top' : ''}`}>
              <span className="lb-rank">{i + 1}</span>
              <span className="lb-name">{s.player_name}</span>
              <span className="lb-score">{s.score}</span>
            </li>
          ))}
        </ol>
      </div>

      <motion.button
        className="btn btn-primary"
        onClick={onRestart}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        เล่นอีกครั้ง
      </motion.button>
    </div>
  )
}
