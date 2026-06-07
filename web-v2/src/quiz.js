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
    const distractors = shuffle(
      pool.filter((v) => v.id !== correct.id && v.definition !== correct.definition)
    )
      .slice(0, 3)
      .map((v) => v.definition)

    const choices = shuffle([correct.definition, ...distractors])
    return {
      word: correct.word,
      answer: correct.definition,
      choices,
    }
  })
}

// คะแนนต่อข้อ: ฐาน 100 + โบนัสตาม streak (ยิ่งติดไฟยิ่งได้เยอะ)
export function pointsFor(streak) {
  return 100 + Math.max(0, streak - 1) * 25
}
