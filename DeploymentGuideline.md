# Guideline to  Deploy WordYQuiz on Internet

Architecture: **React (Vercel)** → **Go Fiber (Render)** → **Postgres (Supabase)**


       word-y-quiz.vercel.app → wordyquiz.onrender.com → Supabase Postgres
            (React/Vite)             (Go Fiber API)            (Database)
```

---

## เฟส 1 — Supabase (Database)

| ขั้นตอน | กดอะไร |
|---|---|
| 1. สร้าง project | supabase.com → **New project** → ตั้งชื่อ + **Database Password** (จดไว้!) → Region: **Southeast Asia (Singapore)** |
| 2. ใส่ข้อมูลตั้งต้น | **SQL Editor** → New query → วางไฟล์ `db/seed.sql` ทั้งไฟล์ → **Run** → เลือก **"Run and enable RLS"** |
| 3. เช็ก | **Table Editor** → ต้องเห็นตาราง `volcabs` (15 แถว) + `high_scores` |
| 4. เอาค่าต่อ DB | ปุ่ม **Connect** (บนสุด) → แท็บ **Direct** → ส่วน **Transaction pooler** (port 6543) |

**ค่าที่ได้จาก Connect → Transaction pooler**:
```
postgresql://postgres.uhzvfggnilehvfhxnxmf:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
              └──────── user ───────────┘            └──────────── host ─────────────────┘  └port┘ └db┘
```

> !!!! ใช้ **Transaction pooler (6543)** ไม่ใช่ direct (5432) — Render free tier ต่อแบบ pooler เสถียรกว่า + มี IPv4

---

## เฟส 2 — Render (Go Backend)

| ขั้นตอน | กดอะไร / ใส่อะไร |
|---|---|
| 1. สร้าง service | render.com → **New → Web Service** → เลือก repo `WordYQuiz` |
| 2. Language | **Docker** (ใช้ `API/Dockerfile`) *หรือ* Go native ก็ได้ (ใน dockerfile ของ API ใช้ go native*) |
| 3. Branch | `main` |
| 4. **Root Directory** | **`API`** ← ตั้ง root เป็น API (go.mod อยู่ใน API/) |
| 5. Region | Singapore (ใกล้ Supabase) |
| 6. Instance Type | **Free** |
| 7. Environment Variables | ใส่ 6 ตัว (ตารางล่าง) |
| 8. Deploy | **Create Web Service** |

### Environment Variables (6 ตัว) — เอาค่าจากเฟส 1

| Key | Value |
|---|---|
| `DB_HOST` | `aws-1-ap-southeast-1.pooler.supabase.com` |
| `DB_USERNAME` | `postgres.uhzvfggnilehvfhxnxmf` |
| `DB_PASSWORD` | *(Database Password ของ Supabase — ตัวที่ตั้ง/รีเซ็ต)* |
| `DB_PORT` | `6543` |
| `DB_DATABASE` | `postgres` |
| `DB_SSLMODE` | `require` |

> **DB_PASSWORD คือรหัส Supabase** ที่ตั้งตอนสร้าง project (ตั้งใหม่ได้เลย ใส่ค่าเดียวกันใน Render)

### Log ที่แปลว่าสำเร็จ
```
no config.yaml found — using environment variables   ← อ่าน env แทนไฟล์ (ถูก) ** ถ้า deploy local บน docker จะดึงจาก config.yaml แทน ตาม function init() ใน main.go
connected db as  postgres                            ← ต่อ Supabase ผ่าน 
Quiz service started at port 10000                   ← ฟัง $PORT ของ Render
==> Your service is live 
```

### ทดสอบ
เปิด `https://<ชื่อ service>.onrender.com/volcabs` → ต้องเห็น JSON 15 คำศัพท์

> Supabase Free Tier จะ sleep ถ้าไม่มีคนใช้ 15 นาที ถ้าเปิดใหม่ต้องรอ 30-50 วิ

---

## เฟส 3 — Vercel (React Frontend)

| ขั้นตอน | กดอะไร / ใส่อะไร |
|---|---|
| 1. สร้าง project | vercel.com → **Add New → Project** → เลือก repo `WordYQuiz` |
| 2. **Root Directory** | **`web-v2`** |
| 3. Framework | Vite (auto-detect) |
| 4. Build / Output | `npm run build` / `dist` (auto) |
| 5. Env Variable | `VITE_API_BASE` = `https://<service>.onrender.com` (URL จากเฟส 2) |
| 6. Deploy | **Deploy** |

---

## note
- **โค้ดชุดเดียว รันได้ทั้ง local และ cloud** — สลับด้วย "ค่า config" เท่านั้น ไม่ต้องแก้โค้ด
  - Local: อ่าน `API/config.yaml` (sslmode=disable, Docker Postgres port 5433)
  - Cloud: อ่าน **environment variables** (sslmode=require, $PORT จาก Render)
- **2 ถ้าเปลี่ยนวิธี deploy backend ให้แก้ env ของ frontned ด้วย
