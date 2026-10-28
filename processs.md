# โครงเว็บและความคืบหน้า — Sti Pomodoro

## โครงเว็บตอนนี้

```text
sti-pomodoro/
├─ src/
│  ├─ App.jsx       หน้าจับเวลาและการทำงานของปุ่ม
│  ├─ App.css       หน้าตาและ responsive
│  ├─ index.css     CSS พื้นฐาน
│  ├─ main.jsx      จุดเริ่ม React
│  ├─ auth/         ฟอร์มสมาชิกและสถานะผู้ใช้
│  ├─ lib/          ตัวเชื่อม Supabase
│  └─ assets/       โลโก้และภาพพื้นหลัง
├─ supabase/migrations/  SQL สร้างตาราง profiles และสิทธิ์
├─ public/          ไฟล์ภาพ/ไอคอนที่เปิดตรงได้
└─ package.json     React, Vite และคำสั่งรันโปรเจกต์
```

## ทำแล้ว

- สร้างแอปด้วย **React + Vite** และ CSS
- ทำ Pomodoro: Work 25 นาที, Short Break 5 นาที, Long Break 15 นาที พร้อม Start/Pause/Reset และสลับช่วงเมื่อครบเวลา
- ทำ Stopwatch, แสดง Cycle 1/4, แจ้งข้อความเมื่อครบช่วง และตั้งระยะเวลาของแต่ละช่วงได้
- ปรับ UI เป็นชื่อ **Sti Pomodoro** ใส่โลโก้ ภาพพื้นหลัง และจัดหน้าให้รองรับมือถือ/แท็บเล็ต
- มีช่อง Tasks/Focus สำหรับพิมพ์สิ่งที่กำลังทำในหน้าปัจจุบัน
- เขียนฟอร์มสมัครสมาชิก เข้าสู่ระบบ ออกจากระบบ และแก้ชื่อที่แสดง พร้อมโค้ดเชื่อม Supabase Auth
- สร้างโปรเจกต์ Supabase ที่ Tokyo และรัน SQL สร้างตาราง `profiles` พร้อม RLS แล้ว
- ใส่ Project URL และ publishable key ใน `sti-pomodoro/.env.local` แล้ว หน้าเข้าสู่ระบบแสดงฟอร์มได้

## ยังไม่ได้ทำ

- ยังไม่ได้ยืนยันผลทดสอบการสมัครสมาชิก ยืนยันอีเมล เข้าสู่ระบบ แก้ชื่อ และออกจากระบบจริง
- ต้องตรวจค่า Auth > URL Configuration ให้ Redirect URL ตรงกับเว็บที่รัน เช่น `http://localhost:5173`
- ตารางเป้าหมายและสถิติใน [database.MD](./database.MD) ยังเป็นแผน
- บันทึกเป้าหมายและประวัติ Pomodoro, หน้าสถิติวันนี้/รายวัน/รายเดือน
- ตอนนี้ Tasks/Focus, ค่าตั้งเวลา และสถานะตัวจับเวลาอยู่ใน React state; รีเฟรชหน้าแล้วเริ่มใหม่

## วิธีทำงานเมื่อเพิ่มระบบสมาชิก

1. **Guest:** เปิดเว็บแล้วจับเวลาได้ทันที แต่ไม่มีข้อมูลย้อนหลัง
2. **Member:** เข้าสู่ระบบ ตั้งชื่อและเลือกเป้าหมาย → เริ่ม Work → เมื่อทำครบ ระบบบันทึกหนึ่งรอบ → ดูสถิติของตัวเองได้
3. รอบที่เริ่มตอนเป็น Guest จะไม่ถูกนำไปบันทึกย้อนหลังหลังสมัคร

## ขั้นต่อไป

1. ตั้งค่า Redirect URL แล้วทดสอบสมัคร ยืนยันอีเมล เข้าสู่ระบบ แก้ชื่อ และออกจากระบบ
2. ตรวจว่า Supabase Authentication > Users มีผู้ใช้ และตาราง `profiles` มีชื่อที่แสดง
3. ทำหน้าเป้าหมาย แล้วเชื่อมการจบรอบ Work กับฐานข้อมูลและสร้างหน้าสถิติ
4. ทดสอบสิทธิ์ข้อมูล การกด Pause/Reset และวันที่ข้ามเที่ยงคืน

รันเว็บจากโฟลเดอร์ `sti-pomodoro` ด้วย `npm install` แล้ว `npm run dev`

## การเชื่อม Supabase และเก็บคีย์

1. รันไฟล์ `sti-pomodoro/supabase/migrations/20261027000000_create_profiles.sql` ใน SQL Editor ของโปรเจกต์ Tokyo แล้ว
2. ไฟล์ `sti-pomodoro/.env.local` มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_PUBLISHABLE_KEY` แล้ว ต้องวางไว้ข้าง `package.json` ของเว็บ; `.env.example` เป็นแบบฟอร์มว่างที่ขึ้น GitHub ได้
3. `.gitignore` กันไฟล์ `.env.local` และไฟล์ env ส่วนตัวอื่นไม่ให้ขึ้น GitHub **ห้ามใส่ secret/service_role key ในเว็บหรือ commit ลง GitHub**
4. ใน Supabase Authentication > URL Configuration ตั้ง Redirect URL ให้ตรงกับเว็บ เช่น `http://localhost:5173` (ถ้าใช้ `127.0.0.1` ให้เพิ่ม URL นั้นด้วย)
5. หลังแก้ `.env.local` ให้รัน `npm run dev` ใหม่ แล้วทดสอบระบบสมาชิก