import { useMemo } from 'react'
import { motion } from 'framer-motion'

// อนุภาคไฟ/ขี้เถ้าลอยขึ้นพื้นหลัง — ยิ่ง level สูง ยิ่งเยอะ
export default function Embers({ level }) {
  const count = level >= 3 ? 8 + level * 2 : level * 2
  const embers = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count]
  )

  return (
    <div className="embers" aria-hidden>
      {embers.map((e) => (
        <motion.span
          key={e.id}
          className="ember"
          style={{ left: `${e.left}%`, width: e.size, height: e.size }}
          initial={{ y: '105vh', opacity: 0 }}
          animate={{ y: '-10vh', x: e.drift, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
