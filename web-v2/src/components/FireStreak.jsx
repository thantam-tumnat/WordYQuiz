import { AnimatePresence, motion } from 'framer-motion'

const LABELS = {
  0: '',
  1: 'จุดไฟ!',
  2: 'ลุกแล้ว',
  3: 'ติดไฟ! 🔥',
  4: 'ร้อนแรง!!',
  5: 'เดือด!!!',
  6: 'นรกแตก 🔥🔥',
}

export default function FireStreak({ streak, level }) {
  const active = streak > 0
  const scale = 1 + level * 0.16
  const label = LABELS[Math.min(level, 6)]

  return (
    <div className={`firestreak ${level >= 3 ? 'firestreak-blaze' : ''}`}>
      <motion.div
        className="flame"
        animate={{
          scale: active ? [scale, scale * 1.12, scale] : 0.85,
          opacity: active ? 1 : 0.35,
        }}
        transition={{
          duration: active ? 0.6 : 0.3,
          repeat: active ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{ filter: `saturate(${1 + level * 0.25})` }}
      >
        <span className="flame-emoji">{active ? '🔥' : '🕯️'}</span>
      </motion.div>

      <div className="streak-meta">
        <AnimatePresence mode="wait">
          <motion.div
            key={streak}
            className="streak-num"
            initial={{ scale: 1.6, y: -4, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          >
            ×{streak}
          </motion.div>
        </AnimatePresence>
        <span className="streak-label">{label || 'streak'}</span>
      </div>

      {/* glow ring เมื่อไฟแรง */}
      {level >= 3 && (
        <motion.div
          className="blaze-ring"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}
