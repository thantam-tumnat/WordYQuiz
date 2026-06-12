// สร้างชุดคำถามจากคลังคำศัพท์
//   โจทย์   = word (คำศัพท์)
//   ช้อยส์ = definition (คำแปล) สุ่ม 4 ตัว โดย 1 ตัวเป็นคำตอบที่ถูก
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildQuestions(volcabs, count = 10) {
  const pool = volcabs.filter((v) => v.word && v.definition)
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length))

  return picked.map((correct) => {
    // ดึงคำแปลลวง (ไม่ซ้ำกับคำตอบที่ถูก) มา 3 ตัว
    // เลือก part of speech เดียวกันก่อน จะได้เดาจากชนิดคำไม่ได้ ถ้าไม่พอค่อยสุ่มทั่วไป
    const others = pool.filter(
      (v) => v.id !== correct.id && v.definition !== correct.definition
    )
    const samePos = others.filter(
      (v) => correct.partOfSpeech && v.partOfSpeech === correct.partOfSpeech
    )
    const rest = others.filter((v) => !samePos.includes(v))
    const distractors = [...shuffle(samePos), ...shuffle(rest)]
      .slice(0, 3)
      .map((v) => v.definition)

    const choices = shuffle([correct.definition, ...distractors])
    return {
      word: correct.word,
      partOfSpeech: correct.partOfSpeech,
      level: correct.level,
      answer: correct.definition,
      choices,
    }
  })
}

// ---- Kahoot-style scoring ----
// ยิ่งตอบเร็ว ยิ่งได้เยอะ + streak combo bonus
export const TIME_LIMIT = 10 // วินาทีต่อข้อ

export function pointsFor(streak, timeLeft) {
  const timeScore = Math.round(1000 * (timeLeft / TIME_LIMIT))
  const streakBonus = Math.min(Math.max(streak - 1, 0), 5) * 100
  return timeScore + streakBonus
}
