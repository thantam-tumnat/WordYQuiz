"""รวม oxford_words.tsv (word/pos/level) + thai_*.tsv (word/คำแปล) -> seed.sql"""
import glob
import os

BASE = os.path.dirname(os.path.abspath(__file__))

words = []  # (word, pos, level) เรียงตามต้นฉบับ
with open(os.path.join(BASE, "oxford_words.tsv"), encoding="utf-8") as f:
    for line in f:
        if line.strip():
            w, p, l = line.rstrip("\n").split("\t")
            words.append((w, p, l))

thai = {}
for path in sorted(glob.glob(os.path.join(BASE, "thai_*.tsv"))):
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                w, t = line.rstrip("\n").split("\t")
                thai[w] = t

missing = [w for w, _, _ in words if w not in thai]
extra = [w for w in thai if w not in {w for w, _, _ in words}]
if missing or extra:
    print(f"missing={len(missing)} extra={len(extra)}")
    for w in missing[:30]:
        print("MISSING:", w)
    for w in extra[:30]:
        print("EXTRA:", w)
    raise SystemExit(1)

def q(s):
    return s.replace("'", "''")

rows = []
for i, (w, p, l) in enumerate(words, start=1):
    rows.append(f"    ({i}, '{q(w)}', '{q(thai[w])}', '{q(p)}', '{l}')")
values = ",\n".join(rows)

sql = f"""-- ============================================================
-- WordYQuiz : seed database (PostgreSQL)
-- คำศัพท์จาก The Oxford 3000 (American English) + คำแปลไทย
-- generate ด้วย db/make_seed.py (อย่าแก้ INSERT ตรงๆ ให้แก้ thai_*.tsv แล้วรันใหม่)
--
-- วิธีใช้:  psql -U postgres -d setup -f db/seed.sql
-- ============================================================

-- ---------- ตารางคำศัพท์ (โจทย์ = word, ช้อยส์ = definition/คำแปล) ----------
CREATE TABLE IF NOT EXISTS volcabs (
    id              SERIAL PRIMARY KEY,
    word            TEXT,
    definition      TEXT,
    part_of_speech  TEXT,
    level           TEXT
);

-- กรณีตารางเก่ามีอยู่แล้ว (สร้างก่อนเพิ่มคอลัมน์)
ALTER TABLE volcabs ADD COLUMN IF NOT EXISTS part_of_speech TEXT;
ALTER TABLE volcabs ADD COLUMN IF NOT EXISTS level TEXT;

-- ---------- ตารางคะแนนสูงสุด ----------
CREATE TABLE IF NOT EXISTS high_scores (
    id           SERIAL PRIMARY KEY,
    player_name  TEXT,
    score        TEXT
);

-- ล้างข้อมูลเดิมก่อน seed ใหม่ (idempotent — รันซ้ำได้)
TRUNCATE TABLE volcabs RESTART IDENTITY;

INSERT INTO volcabs (id, word, definition, part_of_speech, level) VALUES
{values};

-- ปรับ sequence ให้ต่อจาก id ล่าสุด (กัน insert ใหม่ชน id เดิม)
SELECT setval(pg_get_serial_sequence('volcabs', 'id'), (SELECT MAX(id) FROM volcabs));
"""

out = os.path.join(BASE, "seed.sql")
with open(out, "w", encoding="utf-8") as f:
    f.write(sql)
print(f"OK: {len(rows)} rows -> {out}")
