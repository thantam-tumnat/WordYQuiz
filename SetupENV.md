# 🔧 SetupENV — ตัวแปร env แต่ละตัว แก้ที่ไฟล์ไหน

ไฟล์นี้เป็น "แผนที่ของค่า config" ของ WordYQuiz — รวมไว้ที่เดียวว่า **ตัวแปร env แต่ละตัวคืออะไร ต้องไปแก้ที่ไฟล์ไหน และใช้ในกรณีไหน** (รันบนเครื่อง หรือ deploy ขึ้น cloud) จุดสำคัญคือ **โค้ดเป็นชุดเดียวกันทั้งสองกรณี — ที่ต่างกันคือ "ค่า" ในไฟล์ที่ลิสต์ไว้ด้านล่างนี้เท่านั้น ไม่ต้องแก้ source code** ถ้าต้องการขั้นตอน setup แบบทำตามทีละสเตป ให้ดู [`SETUP.md`](SETUP.md) ไฟล์นี้เน้น "ค่าไหนอยู่ตรงไหน" อย่างเดียว

> 🔒 ไฟล์ที่มีรหัสผ่านจริง (`API/config.yaml`, `web-v2/.env`) ถูก `.gitignore` ไว้ — ให้คัดลอกจากไฟล์ `*.example` แล้วใส่ค่าเอง ไม่ commit ขึ้น repo

---

## 📁 สรุปภาพรวม — แก้ที่ไฟล์ไหนบ้าง

| ไฟล์ที่แก้ | คัดลอกมาจาก | คุมค่าอะไร | ใช้ในกรณี |
|---|---|---|---|
| `API/config.yaml` | `API/config.example.yaml` | การเชื่อมต่อ DB ของ backend | 🅰️ Local |
| `web-v2/.env` | `web-v2/.env.example` | URL ของ backend ที่ frontend เรียก | 🅰️ Local |
| `docker-compose.yml` | (มีอยู่แล้ว) | รหัสผ่าน Postgres + env ของ container | 🅰️ Local (Docker) |
| env บน **Render** | อ้างอิง `render.yaml` | DB connection ของ backend บน cloud | 🅱️ Cloud |
| env บน **Vercel** | (ตั้งในแดชบอร์ด) | URL ของ backend ที่ frontend เรียก | 🅱️ Cloud |

---

## 🔌 Backend (Go) — ตัวแปร DB

โค้ดอ่านค่าจาก `config.yaml` **หรือ** environment variables (`API/main.go` → `initConfig`)
ชื่อ key ใน yaml ใช้จุด (`db.host`) ส่วนชื่อ env ใช้ขีดล่างตัวใหญ่ (`DB_HOST`) — เป็นค่าเดียวกัน

| env (cloud) | key ใน `config.yaml` (local) | ความหมาย | 🅰️ Local | 🅱️ Cloud (Supabase) |
|---|---|---|---|---|
| `DB_HOST` | `db.host` | ที่อยู่ DB | `localhost` | `...pooler.supabase.com` |
| `DB_PORT` | `db.port` | พอร์ต DB | `5432` | `6543` (pooler) |
| `DB_USERNAME` | `db.username` | ผู้ใช้ DB | `postgres` | `postgres.<ref>` |
| `DB_PASSWORD` | `db.password` | รหัสผ่าน DB | รหัสที่ตั้งใน compose | รหัส DB ของ Supabase |
| `DB_DATABASE` | `db.database` | ชื่อฐานข้อมูล | `setup` | `postgres` |
| `DB_SSLMODE` | `db.sslmode` | โหมด SSL | `disable` | `require` |
| `PORT` / `APP_PORT` | `app.port` | พอร์ตที่ backend listen | `8000` | Render กำหนดผ่าน `$PORT` อัตโนมัติ |

> 🅰️ **Local:** แก้ที่ `API/config.yaml` (copy จาก `config.example.yaml`)
> 🅱️ **Cloud:** ไม่มีไฟล์ config — กรอกเป็น env ในแดชบอร์ด Render (ค่าที่ `sync:false` ใน `render.yaml`)

---

## 🖥️ Frontend (web-v2 / React) — URL ของ backend

มีตัวแปรเดียว อ่านที่ `web-v2/src/api.js` → `import.meta.env.VITE_API_BASE`

| env | ความหมาย | 🅰️ Local | 🅱️ Cloud |
|---|---|---|---|
| `VITE_API_BASE` | base URL ของ backend | `http://localhost:8000` | `https://wordyquiz-api.onrender.com` |

> 🅰️ **Local:** แก้ที่ `web-v2/.env` (copy จาก `web-v2/.env.example`)
> 🅱️ **Cloud:** ตั้งเป็น Environment Variable ในแดชบอร์ด Vercel
> ⚠️ ค่านี้ถูกฝังตอน **build** — ถ้าแก้ทีหลังต้อง rebuild/redeploy ใหม่เสมอ

---

## 🐳 Docker Compose (เฉพาะ Local) — ค่าใน `docker-compose.yml`

ถ้ารัน DB (และ backend) ผ่าน `docker compose` ต้องให้ค่าตรงกัน 2 ฝั่ง:

| ที่อยู่ในไฟล์ | ต้องตรงกับ |
|---|---|
| `db.environment.POSTGRES_PASSWORD` | `DB_PASSWORD` ใน `API/config.yaml` |
| `db.environment.POSTGRES_DB` (`setup`) | `DB_DATABASE` ใน `API/config.yaml` |
| `api.environment.DB_*` (profile `full`) | ค่าของ service `db` ด้านบน |

> ภายใน compose network ค่า `DB_HOST` ของ service `api` คือ `db` (ชื่อ service) ไม่ใช่ `localhost`

---

## ⚠️ หมายเหตุ — Frontend v1.0 (static) ไม่อ่าน env

`script.js` (ทั้ง root และ `Webpage/`) **hardcode** URL ไว้ในโค้ด (`script.js:147` → `http://localhost:8088/...`)
ไม่มีกลไก env → ถ้าจะเปลี่ยน backend ต้องแก้ในโค้ดเอง และพอร์ตยังเป็น `8088` (ไม่ตรงกับ backend จริงที่ `8000`)
แนะนำให้ใช้ **v2.0 (React)** ที่อ่านค่าจาก env แทน
