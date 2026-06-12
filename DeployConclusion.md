# 🚀 คู่มือ Deploy WordYQuiz (กันลืม)

สถาปัตยกรรม: **React (Vercel)** → **Go Fiber (Render)** → **Postgres (Supabase)**

ลำดับห้ามสลับ เพราะ Render ต้องใช้ค่าจาก Supabase และ Vercel ต้องใช้ URL ของ Render

```
[ผู้เล่น] → word-y-quiz.vercel.app → wordyquiz.onrender.com → Supabase Postgres
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

**ค่าที่ได้จาก Connect → Transaction pooler** (กล่องล่างแยกให้ครบ):
```
postgresql://postgres.uhzvfggnilehvfhxnxmf:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
              └──────── user ───────────┘            └──────────── host ─────────────────┘  └port┘ └db┘
```

> ⚠️ ใช้ **Transaction pooler (6543)** ไม่ใช่ direct (5432) — Render free tier ต่อแบบ pooler เสถียรกว่า + มี IPv4

---

## เฟส 2 — Render (Go Backend)

| ขั้นตอน | กดอะไร / ใส่อะไร |
|---|---|
| 1. สร้าง service | render.com → **New → Web Service** → เลือก repo `WordYQuiz` |
| 2. Language | **Docker** (ใช้ `API/Dockerfile`) *หรือ* Go native ก็ได้ |
| 3. Branch | `main` |
| 4. **Root Directory** | **`API`** ← สำคัญมาก! go.mod อยู่ใน API/ ไม่ใช่ root (ลืม = build fail) |
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

> 🔑 **DB_PASSWORD คือรหัส Supabase** ที่ตั้งตอนสร้าง project — **ไม่ใช่** `08012002` (อันนั้นของ Postgres ใน Docker เครื่องเรา คนละตัว)
> จำไม่ได้ → Supabase → **Project Settings → Database → Reset database password** → ตั้งใหม่ → เอามากรอก Render → **Save Changes** (Render redeploy เอง)

### Log ที่แปลว่าสำเร็จ
```
no config.yaml found — using environment variables   ← อ่าน env แทนไฟล์ (ถูก)
connected db as  postgres                            ← ต่อ Supabase ผ่าน ✅
Quiz service started at port 10000                   ← ฟัง $PORT ของ Render
==> Your service is live 🎉
```

### Error เจอบ่อย
| Log | แก้ |
|---|---|
| `password authentication failed (28P01)` | DB_PASSWORD ผิด → reset ที่ Supabase ให้ตรงกัน |
| `no go.mod found` / build fail | Root Directory ไม่ได้ตั้งเป็น `API` |
| `SSL is not enabled` | DB_SSLMODE ต้องเป็น `require` |

### ทดสอบ
เปิด `https://<ชื่อ service>.onrender.com/volcabs` → ต้องเห็น JSON 15 คำศัพท์

> 💤 Free tier sleep หลังไม่มีคนใช้ 15 นาที → คำขอแรกหลังตื่นช้า ~30-50 วิ (ปกติ)

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

### เปลี่ยนชื่อลิงก์
**Settings → Domains → Add** → พิมพ์ `<ชื่อ>.vercel.app` (ถ้าว่าง) — ปัจจุบัน: `word-y-quiz.vercel.app`

---

## ✅ เช็กตอนจบ (end-to-end)
1. เปิดเว็บ Vercel → เล่นได้ + คำถามโหลดมา = ต่อ Render สำเร็จ
2. ตอบจบเกม → บันทึกคะแนน + leaderboard ขึ้น = ต่อ Supabase สำเร็จ

---

## 📝 หมายเหตุสำคัญ (concept)
- **โค้ดชุดเดียว รันได้ทั้ง local และ cloud** — สลับด้วย "ค่า config" เท่านั้น ไม่ต้องแก้โค้ด
  - Local: อ่าน `API/config.yaml` (sslmode=disable, Docker Postgres port 5433)
  - Cloud: อ่าน **environment variables** (sslmode=require, $PORT จาก Render)
- **2 รหัสที่ห้ามสับสน**
  | | รหัส | อยู่ที่ |
  |---|---|---|
  | Local (Docker) | `08012002` | `API/config.yaml` ในเครื่อง (gitignore ไว้) |
  | Supabase (cloud) | *(ตั้งบนเว็บ)* | server Supabase เท่านั้น |
- **CORS**: backend ตั้ง `Access-Control-Allow-Origin: *` (เปิดหมด) → Vercel เรียก Render ได้เลย ถ้าอยากล็อกเฉพาะเว็บเรา แก้ origin ที่ `API/main.go`
