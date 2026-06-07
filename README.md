# 🔥 WordYQuiz

เกมทดสอบ **คำศัพท์** (vocabulary quiz) — โจทย์คือคำศัพท์ ผู้เล่นเลือก *คำแปล* ที่ถูกจาก 4 ตัวเลือก
ตอบถูกต่อเนื่องจะ **"ติดไฟ" (streak)** ไฟยิ่งลุกยิ่งได้โบนัสคะแนนเพิ่ม ตอบผิดไฟดับทันที

โปรเจคนี้มี 2 เวอร์ชันหน้าเว็บ ที่ใช้ **backend Go Fiber ตัวเดียวกัน**:
- **v1.0** — HTML/CSS/JS ล้วน (โฟลเดอร์ราก + `Webpage/`)
- **v2.0** — เขียนใหม่ด้วย React เน้น UX/UI + อนิเมชัน (โฟลเดอร์ `web-v2/`)

---

## 📸 WordYQuiz 2.0

<p align="center">
  <img src="web-v2/docs/screenshots/01-start.png" width="32%" alt="หน้าเริ่มเกม" />
  <img src="web-v2/docs/screenshots/02-streak.png" width="32%" alt="ระบบ streak ติดไฟ" />
  <img src="web-v2/docs/screenshots/03-result.png" width="32%" alt="หน้าสรุปผล + leaderboard" />
</p>

<p align="center"><sub>หน้าเริ่ม · ตอบถูกต่อเนื่องไฟลุก (×5 เดือด!) · สรุปผล + กระดานคะแนน</sub></p>

---

## 🧱 Tech Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| **Frontend 2.0** | React 18 · Vite · framer-motion (อนิเมชัน) · CSS (glassmorphism) |
| **Frontend 1.0** | HTML5 · CSS3 · Vanilla JavaScript (`fetch`) |
| **Backend** | Go 1.20 · [Fiber](https://gofiber.io/) v2 · [GORM](https://gorm.io/) · [Viper](https://github.com/spf13/viper) (config) · [Zap](https://github.com/uber-go/zap) (logging) |
| **Database** | PostgreSQL |
| **สถาปัตยกรรม** | REST API แบ่งชั้น handler → service → repository |

---

## ✨ ฟีเจอร์เด่น (2.0)

- 🎯 โจทย์ = คำศัพท์ · 4 ตัวเลือก = คำแปลที่สุ่มมา (1 ถูก + 3 ลวง)
- 🔥 **ระบบ streak ติดไฟ** — เปลวไฟโต/เรืองแสงตามจำนวนตอบถูกติดกัน, อนุภาคไฟลอยพื้นหลัง, พื้นหลังเรืองแดง, โบนัสคะแนนเพิ่มทุก streak
- 💧 ตอบผิด = ไฟดับ streak กลับเป็นศูนย์
- 🎬 อนิเมชันลื่นทุกหน้าจอ + feedback ปุ่มตอบถูก/ผิด
- 🏆 หน้าสรุปผล: ความแม่นยำ + streak สูงสุด + บันทึกคะแนนลง DB + กระดานอันดับ

---

## 🔌 REST API

| Method | Endpoint | หน้าที่ |
|--------|----------|--------|
| `GET` | `/volcabs` | ดึงคลังคำศัพท์ทั้งหมด |
| `GET` | `/volcabs/:id` | ดึงคำศัพท์ตาม id |
| `POST` | `/volcabs` | เพิ่มคำศัพท์ |
| `GET` | `/score` | ดึงคะแนน (leaderboard) |
| `POST` | `/score` | บันทึกคะแนนใหม่ |

(ยังมี `PUT`/`DELETE` ของทั้งสอง resource)

---

## 🚀 เริ่มต้นใช้งาน

ต้องเปิด 3 ส่วนตามลำดับ: **Database → Backend → Frontend**

```bash
# 1) Database (PostgreSQL ผ่าน Docker) + ใส่ข้อมูลตัวอย่าง
docker run -d --name wordyquiz-db \
  -e POSTGRES_PASSWORD=yourpass -e POSTGRES_DB=setup \
  -p 5432:5432 postgres:16-alpine
docker exec -i wordyquiz-db psql -U postgres -d setup < db/seed.sql

# 2) Backend (Go Fiber)
cp API/config.example.yaml API/config.yaml   # แล้วใส่รหัส/พอร์ต DB ของคุณ
cd API && go run .                            # ขึ้นที่พอร์ตใน config (ดีฟอลต์ 8000)

# 3a) Frontend 2.0 (React)
cd web-v2
cp .env.example .env                          # ตั้ง VITE_API_BASE ให้ตรงพอร์ต backend
npm install && npm run dev                    # เปิด http://localhost:5173

# 3b) หรือ Frontend 1.0 (static)
python -m http.server 5500                    # เปิด http://localhost:5500/index.html
```

> 🔒 ไฟล์ `API/config.yaml` (มีรหัสผ่าน DB) และ `web-v2/.env` ถูก `.gitignore` ไว้
> ให้คัดลอกจากไฟล์ `*.example` แล้วใส่ค่าจริงเอง

---

## 📂 โครงสร้างโปรเจค

```
WordYQuiz/
├── API/                 # Go Fiber backend (handler / service / repository)
├── web-v2/              # ★ Frontend 2.0 (React + Vite)
│   ├── src/
│   │   ├── App.jsx          # state กลาง + สลับหน้าจอ
│   │   ├── api.js           # ชั้นคุย backend
│   │   ├── quiz.js          # ตรรกะสุ่มคำถาม + คิดคะแนน
│   │   └── components/      # StartScreen / QuizScreen / FireStreak / ...
│   └── docs/screenshots/    # รูปตัวอย่าง
├── db/seed.sql          # ข้อมูลคำศัพท์ตัวอย่าง (mockup)
├── index.html, script.js, Style.css   # Frontend 1.0
└── Webpage/             # Frontend 1.0 (อีกชุด)
```

> รายละเอียดการทำงานของ 2.0 อ่านเพิ่มที่ [`web-v2/README.md`](web-v2/README.md)
