# ⚙️ วิธี Setup WordYQuiz

โปรเจคนี้เปิด 3 ส่วนตามลำดับเสมอ: **Database → Backend (Go) → Frontend**
ต่างกันแค่ "Database" ว่าจะใช้ **PostgreSQL บนเครื่อง (Docker)** หรือ **Supabase (cloud)**
Backend อ่านค่า DB จาก `API/config.yaml` (หรือ environment variables) — ดูโค้ดที่ [`API/main.go`](API/main.go)

ต้องมีก่อน: **Go 1.20+**, **Node 18+** (สำหรับ web-v2), และ **Docker** (เฉพาะกรณีรันบนเครื่อง)

---

## 🅰️ กรณีที่ 1 — รันบนเครื่อง (Local + Docker Compose)

ใช้ [`docker-compose.yml`](docker-compose.yml) ที่รากโปรเจค — สั่งครั้งเดียวได้ทั้ง Postgres + auto-seed

### 1) Database
```bash
docker compose up -d
```
ครั้งแรก compose จะ:
- สร้าง Postgres (ฐานชื่อ `setup`, รหัสผ่าน `yourpass` — แก้ได้ในไฟล์ compose)
- **รัน [`db/seed.sql`](db/seed.sql) อัตโนมัติ** (mount เข้า `/docker-entrypoint-initdb.d/`) สร้างตาราง `volcabs` + `high_scores` พร้อมข้อมูลตัวอย่าง

> ⚠️ seed รันเฉพาะ "ครั้งแรกที่ volume ยังว่าง" — ถ้าแก้ `seed.sql` แล้วอยาก seed ใหม่ ให้ `docker compose down -v` (ลบ volume) แล้ว `up` ใหม่

คำสั่งที่ใช้บ่อย:
```bash
docker compose down      # หยุด แต่ข้อมูลยังอยู่
docker compose down -v   # หยุด + ลบข้อมูล (seed ใหม่รอบหน้า)
docker compose logs -f db
```

### 2) Backend
```bash
cp API/config.example.yaml API/config.yaml
```
แก้ [`API/config.yaml`](API/config.yaml) ให้เป็น:
```yaml
app:
  port: 8000
db:
  driver: "postgresql"
  host: "localhost"
  port: 5432
  username: "postgres"
  password: "yourpass"   # = POSTGRES_PASSWORD ด้านบน
  database: "setup"
  sslmode: "disable"     # 🔑 local = disable
```
รัน:
```bash
cd API && go run .       # ขึ้นที่ http://localhost:8000
```

> 💡 ไม่อยากลง Go บนเครื่อง? รัน backend ใน compose ได้เลย (ไม่ต้องมี `config.yaml`):
> ```bash
> docker compose --profile full up -d --build   # DB + Go backend ทั้งชุด
> ```
> โหมดนี้ backend อ่านค่า DB จาก env ในไฟล์ compose ให้อัตโนมัติ ข้ามขั้นที่ 2 ทั้งหมดได้

### 3) Frontend
```bash
# v2.0 (React)
cd web-v2
cp .env.example .env     # VITE_API_BASE=http://localhost:8000
npm install && npm run dev   # http://localhost:5173

# หรือ v1.0 (static)
python -m http.server 5500   # http://localhost:5500/index.html
```

---

## 🅱️ กรณีที่ 2 — ใช้ Supabase (Cloud PostgreSQL)

ไม่ต้องใช้ Docker — แทน Database ด้วยฐานบน Supabase

### 1) สร้างโปรเจค + เอาค่าเชื่อมต่อ
1. ไปที่ <https://supabase.com> → **New project** → ตั้ง **Database Password** (จดไว้)
2. **Project Settings → Database → Connection info** จะได้:

| ค่าใน config | ที่มาจาก Supabase |
|--------------|-------------------|
| `host`     | `db.<project-ref>.supabase.co` |
| `port`     | `5432` (direct) หรือ `6543` (pooler) |
| `username` | `postgres` |
| `password` | Database Password ที่ตั้งตอนสร้าง |
| `database` | `postgres`  ⚠️ **ไม่ใช่ `setup`** |
| `sslmode`  | `require`   🔑 Supabase บังคับ SSL |

### 2) ใส่ข้อมูลตัวอย่าง (seed)
GORM `AutoMigrate` สร้างตาราง `volcabs` ให้เอง แต่ `high_scores` ต้องสร้างเอง — ง่ายสุดคือรัน [`db/seed.sql`](db/seed.sql) ทั้งไฟล์ เลือกวิธีใดวิธีหนึ่ง:

**วิธี A — SQL Editor (ไม่ต้องลง psql):**
Supabase Dashboard → **SQL Editor** → **New query** → วางเนื้อหา `db/seed.sql` ทั้งหมด → **Run**

**วิธี B — psql ผ่าน connection string:**
```bash
psql "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require" -f db/seed.sql
```

### 3) Backend
```bash
cp API/config.example.yaml API/config.yaml
```
แก้ [`API/config.yaml`](API/config.yaml) ให้เป็น:
```yaml
app:
  port: 8000
db:
  driver: "postgresql"
  host: "db.<project-ref>.supabase.co"
  port: 5432
  username: "postgres"
  password: "<your-supabase-db-password>"
  database: "postgres"   # 🔑 Supabase ใช้ชื่อ postgres
  sslmode: "require"     # 🔑 Supabase บังคับ SSL
```
รัน:
```bash
cd API && go run .       # ขึ้นที่ http://localhost:8000 (เชื่อม DB บน cloud)
```

> 💡 ไม่อยากแก้ไฟล์ก็ส่งเป็น env แทนได้ (โค้ดรองรับใน `initConfig`):
> ```bash
> DB_HOST=db.<ref>.supabase.co DB_PORT=5432 DB_USERNAME=postgres \
> DB_PASSWORD=<pass> DB_DATABASE=postgres DB_SSLMODE=require \
> go run ./API
> ```

### 4) Frontend
เหมือนกรณีที่ 1 — Backend ยังอยู่ที่ `localhost:8000` เพราะฉะนั้น `VITE_API_BASE` ไม่เปลี่ยน
```bash
cd web-v2
cp .env.example .env
npm install && npm run dev   # http://localhost:5173
```

---

## 🔍 สรุปความต่าง 2 กรณี

| | 🅰️ Local (Docker) | 🅱️ Supabase |
|---|---|---|
| `db.host`     | `localhost` | `db.<ref>.supabase.co` |
| `db.database` | `setup` | `postgres` |
| `db.sslmode`  | `disable` | `require` |
| ต้องใช้ Docker | ✅ | ❌ |
| seed ข้อมูล   | `psql ... < db/seed.sql` | SQL Editor หรือ psql ผ่าน connection string |
| Backend / Frontend | เหมือนกันทั้งสองกรณี | เหมือนกันทั้งสองกรณี |

> 🔒 `API/config.yaml` (มีรหัสผ่าน DB) และ `web-v2/.env` ถูก `.gitignore` ไว้แล้ว — ไม่หลุดขึ้น repo
