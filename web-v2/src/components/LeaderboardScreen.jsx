import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getHighScores } from '../api'

export default function LeaderboardScreen({ onBack }) {
  // โหมด Classic ปิดอยู่ → leaderboard เหลือ Endless อย่างเดียว
  const [viewMode] = useState('endless')
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [visibleCount, setVisibleCount] = useState(8)

  const loadScores = (modeToLoad) => {
    setLoading(true)
    setErr(null)
    getHighScores(modeToLoad)
      .then((rows) => {
        const sorted = [...rows].sort(
          (a, b) => (parseInt(b.score) || 0) - (parseInt(a.score) || 0)
        )
        setScores(sorted.slice(0, 25))
        setVisibleCount(8)
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadScores(viewMode)
  }, [viewMode])

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      if (visibleCount < scores.length) {
        setVisibleCount((prev) => Math.min(prev + 8, 25))
      }
    }
  }

  return (
    <div className="card result-card">
      <div className="result-emoji">🏆</div>
      <h2 className="result-title">WordYQuiz Hall of Fame</h2>
      <p className="subtitle" style={{ marginBottom: '18px' }}>จัดอันดับคะแนนสูงสุด</p>

      <div className="leaderboard" style={{ margin: '8px 0 24px' }}>
        {/* tab Classic ถูกซ่อน (โหมด Classic ปิดอยู่) เหลือ leaderboard เดียว */}

        {loading && <p className="hint pulse" style={{ textAlign: 'center' }}>กำลังดึงข้อมูลคะแนน…</p>}
        {err && <p className="hint" style={{ textAlign: 'center', color: 'var(--bad)' }}>โหลดอันดับไม่ได้: {err}</p>}
        {!loading && !err && scores.length === 0 && (
          <p className="hint" style={{ textAlign: 'center' }}>ยังไม่มีคะแนนในโหมดนี้</p>
        )}

        {!loading && !err && scores.length > 0 && (
          <ol className="lb-list" onScroll={handleScroll}>
            {scores.slice(0, visibleCount).map((s, i) => (
              <li key={s.id ?? i} className={`lb-item ${i === 0 ? 'lb-top' : ''}`}>
                <span className="lb-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className="lb-name">{s.player_name}</span>
                <span className="lb-score">{s.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <motion.button
        className="btn"
        onClick={onBack}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          background: 'transparent',
          border: '1.5px solid var(--glass-brd)',
          color: 'var(--muted)',
          marginTop: '12px'
        }}
      >
        กลับหน้าหลัก
      </motion.button>
    </div>
  )
}
