// ตัวเชื่อมกับ Go Fiber backend (โปรเจคเดิม)
// ไม่มี fallback โดยตั้งใจ (fail-fast): ถ้าไม่มี VITE_API_BASE ให้ throw ทันที
//   - dev: เตือนว่ายังไม่ได้ตั้งค่า — คัดลอกจาก .env.example แล้วตั้ง .env ก่อน
//   - prod (Vercel): เตือนว่าลืมตั้ง Environment Variable
const BASE = import.meta.env.VITE_API_BASE

if (!BASE) {
  throw new Error('VITE_API_BASE is not set. คัดลอกจาก .env.example แล้วตั้งค่าก่อนรัน (บน Vercel ให้ตั้งใน Environment Variables)')
}

export async function getVolcabs() {
  const res = await fetch(`${BASE}/volcabs`)
  if (!res.ok) throw new Error(`GET /volcabs failed: ${res.status}`)
  const data = await res.json()
  // กันค่าว่าง/word ที่มี \n ติดมาจาก CSV เดิม
  return (data || [])
    .map((v) => ({
      id: v.id,
      word: (v.word || '').trim(),
      definition: (v.definition || '').trim(),
      partOfSpeech: (v.part_of_speech || '').trim(),
      level: (v.level || '').trim(),
    }))
    .filter((v) => v.word && v.definition)
}

export async function getHighScores() {
  const res = await fetch(`${BASE}/score`)
  if (!res.ok) throw new Error(`GET /score failed: ${res.status}`)
  return (await res.json()) || []
}

export async function postHighScore(playerName, score) {
  const res = await fetch(`${BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_name: playerName, score: String(score) }),
  })
  if (!res.ok) throw new Error(`POST /score failed: ${res.status}`)
  return res.json()
}
