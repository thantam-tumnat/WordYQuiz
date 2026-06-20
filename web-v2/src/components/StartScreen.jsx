import { motion } from 'framer-motion'

export default function StartScreen({ loading, error, count, total, onStart, onViewLeaderboard }) {
  return (
    <div className="card start-card">
      <motion.button
        className="btn-leaderboard-trigger"
        onClick={onViewLeaderboard}
        whileHover={{ scale: 1.1, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        title="ดูอันดับคะแนนสูงสุด"
      >
        🏆
      </motion.button>

      <motion.div
        className="logo-flame"
        initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        🔥
      </motion.div>

      <h1 className="title">
        Word<span className="title-accent">Y</span>Quiz
        {/*<span className="title-badge">2.0</span>*/}
      </h1>
      <p className="subtitle">ควิซคำศัพท์ Oxford 3000</p>

      {loading && <p className="hint pulse">กำลังโหลดคลังคำศัพท์…</p>}

      {error && (
        <div className="error-box">
          <strong>ต่อ backend ไม่ได้</strong>
          <span>{error}</span>
          <span className="hint">เช็คว่า Go API รันอยู่ และ VITE_API_BASE ถูกพอร์ต</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="rules">
            <div className="rule">
              <span className="rule-ico">📝</span>
              <span>
                โจทย์คือ <b>คำศัพท์</b> เลือก <b>คำแปล</b> ที่ถูกจาก 4 ตัวเลือก
              </span>
            </div>
            <div className="rule">
              <span className="rule-ico">⏱️</span>
              <span>
                จับเวลา <b>10 วินาที</b>ต่อข้อ — ยิ่งตอบเร็วยิ่งได้<b>คะแนนเยอะ</b>
              </span>
            </div>
            <div className="rule">
              <span className="rule-ico">🔥</span>
              <span>
                ตอบถูกติดกัน = <b>streak bonus</b> คะแนนพิเศษเพิ่มขึ้นเรื่อย ๆ
              </span>
            </div>
            <div className="rule">
              <span className="rule-ico">💧</span>
              <span>
                ตอบผิดหรือหมดเวลา = <b>ไฟดับ</b> streak กลับเป็นศูนย์
              </span>
            </div>
          </div>

          {/* โหมด Classic ถูกปิดชั่วคราว (เก็บโค้ด logic ไว้ครบใน App/quiz) — ตอนนี้เล่น Endless อย่างเดียว */}
          <div className="start-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <motion.button
              className="btn btn-primary"
              onClick={() => onStart(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              disabled={count === 0}
              style={{
                background: 'linear-gradient(135deg, #ff9f43 0%, #ff5252 100%)',
                color: '#fff',
                border: 'none'
              }}
            >
              เริ่มเล่น 🔥
            </motion.button>
          </div>
          <p className="hint">OXFORD 3000</p>
        </>
      )}
    </div>
  )
}
