import { motion } from 'framer-motion'

export default function StartScreen({ loading, error, count, total, onStart }) {
  return (
    <div className="card start-card">
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
              <span className="rule-ico">🔥</span>
              <span>
                ตอบถูกติดกัน = <b>ไฟแรงขึ้น</b> และได้โบนัสคะแนนเพิ่ม
              </span>
            </div>
            <div className="rule">
              <span className="rule-ico">💧</span>
              <span>
                ตอบผิด = <b>ไฟดับ</b> streak กลับเป็นศูนย์
              </span>
            </div>
          </div>

          <motion.button
            className="btn btn-primary"
            onClick={onStart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={count === 0}
          >
            เริ่มเล่น · {count} ข้อ
          </motion.button>
          <p className="hint">OXFORD 3000</p>
        </>
      )}
    </div>
  )
}
