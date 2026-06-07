# WordYQuiz 2.0 (React)

หน้าเว็บเวอร์ชันใหม่ของ WordYQuiz เขียนด้วย **React + Vite + framer-motion**
ต่อกับ Go Fiber backend ตัวเดิม (`../API`)

## ฟีเจอร์
- โจทย์ = คำศัพท์ (word) · เลือกคำแปล (definition) ที่ถูกจาก 4 ตัวเลือกสุ่ม
- ระบบ **streak ติดไฟ** 🔥 ตอบถูกต่อเนื่องไฟยิ่งแรง + โบนัสคะแนนเพิ่ม / ตอบผิดไฟดับ
- อนิเมชันด้วย framer-motion, พื้นหลังอนุภาคไฟ (embers), กระดานคะแนนสูงสุด

## รัน
```bash
# 1) ต้องมี backend + DB รันอยู่ก่อน (ดู README หลักของโปรเจค)
# 2) ตั้ง URL ของ backend ใน .env (ค่ามาตรฐาน 8000, เครื่องเดโมใช้ 8088)
npm install
npm run dev        # เปิด http://localhost:5173
```

ตั้งพอร์ต backend ได้ที่ไฟล์ `.env` → `VITE_API_BASE`
