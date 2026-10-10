# Frontend — ครัวคลาวด์ (React + Vite)

หน้าเว็บของระบบสั่งอาหาร: ลูกค้าสั่งอาหาร/ติดตามสถานะ · หน้าจอครัว · จัดการเมนู
API ที่ใช้: [`../docs/API.md`](../docs/API.md)

## หน้าในระบบ

| URL | หน้า |
|---|---|
| `#/` | เมนู + ตะกร้า + สั่งอาหาร |
| `#/order/<orderId>` | ติดตามสถานะ (polling ทุก 4 วิ, popup + เสียงเมื่อ `READY`) |
| `#/my-orders` | ออเดอร์ที่สั่งจากเบราว์เซอร์นี้ |
| `#/kitchen` | หน้าจอครัว 3 คอลัมน์ (คิวใหม่ / กำลังทำ / พร้อมเสิร์ฟ) |
| `#/admin` | เพิ่ม/แก้/ลบเมนู, อัปโหลดรูป, เปิด-ปิดเมนูที่หมด |

ใช้ `HashRouter` (`/#/kitchen`) เพื่อให้เปิดลิงก์ตรงบน S3 static website ได้โดยไม่ต้องตั้ง rewrite

## รันบนเครื่อง

```bash
npm install
npm run dev        # http://localhost:5173
```

### โหมดจำลอง (Mock)

ถ้ายังไม่มี `.env` หรือ `VITE_API_URL` ว่าง → เว็บใช้ข้อมูลจำลองใน `localStorage` (มีแถบสีเหลืองด้านบน)

- เปิด 2 แท็บ: `#/` (ลูกค้า) กับ `#/kitchen` (ครัว) แล้วลองสั่ง → ข้อมูลแชร์กันข้ามแท็บ
- จำลอง SQS: ออเดอร์ `PENDING` จะกลายเป็น `QUEUED` + ได้เลขคิวเองหลัง ~2.5 วินาที
- ล้างข้อมูลจำลอง: DevTools → Application → Local Storage → ลบ key ที่ขึ้นต้นด้วย `mock.`

### ต่อกับ AWS จริง

```bash
cp .env.example .env
# แก้ .env:
# VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod
npm run dev
```

## Deploy ขึ้น S3

```bash
npm run build                                   # ได้โฟลเดอร์ dist/
aws s3 sync dist/ s3://<web-bucket>/ --delete   # อัปขึ้น bucket ที่ SAM สร้าง
```

เปิดที่ `http://<web-bucket>.s3-website-us-east-1.amazonaws.com`

> `VITE_API_URL` ถูกฝังตอน `npm run build` — เปลี่ยน URL แล้วต้อง build + sync ใหม่

## โครงสร้าง

```
src/
├── api/
│   ├── index.js      ← หน้าเว็บ import จากตรงนี้ (เลือก mock / http อัตโนมัติ)
│   ├── http.js       ← เรียก API Gateway จริง
│   └── mock.js       ← backend จำลอง (กฎเดียวกับ Lambda)
├── pages/            ← MenuPage, OrderTrackingPage, MyOrdersPage, KitchenPage, AdminPage
├── components/       ← Layout, StatusBadge, MenuImage, QtyStepper
├── context/          ← CartContext (ตะกร้า + ออเดอร์ของฉัน)
├── hooks/            ← usePolling, useLocalStorage
├── utils/            ← format (ราคา/เวลา), notify (เสียง + browser notification)
├── constants.js      ← สถานะและลำดับการเปลี่ยน (ต้องตรงกับ Lambda)
└── config.js         ← VITE_API_URL, ระยะ polling
```
