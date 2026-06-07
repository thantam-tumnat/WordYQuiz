-- ============================================================
-- WordYQuiz : mockup database (PostgreSQL)
-- โครงสร้างตรงกับที่ GORM ใช้ในโค้ด Go (API/repository/*.go)
--   - ตาราง volcabs    : GORM AutoMigrate สร้างให้อยู่แล้ว แต่ใส่ไว้กัน DB ว่าง
--   - ตาราง high_scores: GORM ไม่ได้ AutoMigrate จึงต้องสร้างเอง
--
-- วิธีใช้:  psql -U postgres -d setup -f db/seed.sql
-- ============================================================

-- ---------- ตารางคำศัพท์ (โจทย์ = word, ช้อยส์ = definition/คำแปล) ----------
CREATE TABLE IF NOT EXISTS volcabs (
    id          SERIAL PRIMARY KEY,
    word        TEXT,
    definition  TEXT
);

-- ---------- ตารางคะแนนสูงสุด ----------
CREATE TABLE IF NOT EXISTS high_scores (
    id           SERIAL PRIMARY KEY,
    player_name  TEXT,
    score        TEXT
);

-- ล้างข้อมูลเดิมก่อน seed ใหม่ (idempotent — รันซ้ำได้)
TRUNCATE TABLE volcabs RESTART IDENTITY;

-- ---------- mockup คำศัพท์: word (อังกฤษ) + definition (คำแปลไทย) ----------
-- frontend สุ่ม id 1-10 มาเป็นช้อยส์ จึงควรมีอย่างน้อย 10+ แถว
INSERT INTO volcabs (id, word, definition) VALUES
    (1,  'apple',     'แอปเปิล (ผลไม้)'),
    (2,  'banana',    'กล้วย'),
    (3,  'orange',    'ส้ม'),
    (4,  'grape',     'องุ่น'),
    (5,  'dog',       'สุนัข'),
    (6,  'cat',       'แมว'),
    (7,  'house',     'บ้าน'),
    (8,  'language',  'ภาษา'),
    (9,  'water',     'น้ำ'),
    (10, 'mountain',  'ภูเขา'),
    (11, 'river',     'แม่น้ำ'),
    (12, 'teacher',   'ครู'),
    (13, 'student',   'นักเรียน'),
    (14, 'book',      'หนังสือ'),
    (15, 'computer',  'คอมพิวเตอร์');

-- ปรับ sequence ให้ต่อจาก id ล่าสุด (กัน insert ใหม่ชน id เดิม)
SELECT setval(pg_get_serial_sequence('volcabs', 'id'), (SELECT MAX(id) FROM volcabs));

-- ---------- mockup คะแนนตัวอย่าง ----------
TRUNCATE TABLE high_scores RESTART IDENTITY;
INSERT INTO high_scores (player_name, score) VALUES
    ('Alice', '8'),
    ('Bob',   '5'),
    ('Carol', '10');
