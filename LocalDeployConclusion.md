#คำสั่ง Docker แต่ละแบบ กรณีรัน local หรือบน VPS



สั่งเปิดทุก service (รวมถึงตัวที่ตั้ง profile ด้วย)ใน docker พร้อม build container ใหม่ (Code จะอัพเดตตามที่แก้)
docker compose --profile full(full คือชื่อ profile ที่ั่ตั้งใน compose) up(เปิด ถ้าปิดก็ down) -d(รันเบื้องหลัง) --build(บิวด์ใหม่ ตอนแก้โค้ดต้องบิวด์ใหม่ ได้ image ตัวใหม่)
docker compose --profile full up -d --build

สั่งเปิดทุก service (รวมถึงตัวที่ตั้ง profile ด้วย) ใน docker (ใช้ container เดิม code เดิม)
docker compose --profile full up -d

docker compose up -d          สร้าง + รัน (ใช้ image เดิม โค้ดไม่เปลี่ยน ปล.build อัตโนมัติถ้ายังไม่มี image)
docker compose up -d --build  build ใหม่ + รัน

docker compose stop           หยุด (container ยังอยู่)
docker compose start          เปิดใหม่ (จากที่ stop ไว้)
docker compose down           หยุด + ลบ container (Volume ที่เก็บข้อมูลของ DB ไม่หาย ข้อมูลไม่หาย)
docker compose down -v        หยุด + ลบ container + ลบข้อมูล DB

** docker-compose ไปเรียก dockerfile ใน แต่ละ service อีกที
** ข้อดีรัน DB บน Docker -> สะดวก ไม่ต้อง Query กด import seed.sql เองตั้งให้ import อัตโนมัติ / ลงได้หลายเวอชั่นแบบชนกัน / ลบง่ายแค่ กำสำะำ แนืะฟรืำพ

** ถ้ารัน local(go run) backend ยึด env ตาม config.yaml แต่ถ้า docker compose ยึด env ตาม docker-composeมัฟทส (main.go - initConfig())

** ดูขั้นตอน deploy ที่ [คู่มือ Deploy](DeployConclusion.md)