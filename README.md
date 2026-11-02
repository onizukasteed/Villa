# เลือกบ้านเขาใหญ่ (villa-vote)

หน้าเว็บนำเสนอพูลวิลล่า + โหวตได้หลายหลัง

## เพิ่มบ้านใหม่
แก้ `villas.json` แล้วเพิ่ม object ใน `villas` (ก๊อปหลังเดิมมาแก้) จากนั้น commit + push
Vercel จะ deploy ใหม่ให้อัตโนมัติ โหวตเดิมไม่หาย

ช่องสำคัญ:
- `id` ห้ามซ้ำ ใช้ตัวอังกฤษ ตัวเลข ขีด (ห้ามเปลี่ยนหลังมีคนโหวตแล้ว ไม่งั้นโหวตหลังนั้นจะหาย)
- `price` ราคารวมคืนที่ไป, `basePeople` จำนวนคนที่รวมในราคา, `extraPerPerson` ค่าเสริมต่อคน
- `status` ใส่ "ว่าง" เพื่อขึ้นจุดสีเขียว ข้อความอื่นจะขึ้นจุดสีเหลือง

## เริ่มทริปใหม่ / ล้างโหวต
เปลี่ยน `trip.id` ใน `villas.json` เป็นค่าใหม่ จะได้กระดานโหวตใหม่ทันที

## Deploy
1. push โฟลเดอร์นี้ขึ้น GitHub
2. Vercel > Add New Project > import repo > Deploy (ไม่ต้องตั้ง build)
3. ในโปรเจกต์ Vercel > Storage > Create Database > Upstash for Redis (แผนฟรี) > Connect กับโปรเจกต์นี้
4. Deployments > Redeploy ล่าสุด 1 ครั้ง ให้ env ของ Redis มีผล
