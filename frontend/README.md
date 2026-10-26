# Frontend — ครัวคลาวด์ (React + Vite)

หน้าเว็บของระบบสั่งอาหาร: ลูกค้าสั่งอาหาร/ติดตามสถานะ · หน้าจอครัว · จัดการเมนู
API ที่ใช้: [`../docs/API.md`](../docs/API.md)

## หน้าในระบบ

| URL | หน้า |
|---|---|
| `#/` | เมนู + ตะกร้า + สั่งอาหาร |
| `#/order/<orderId>` | ติดตามสถานะ (polling ทุก 4 วิ, popup + เสียงเมื่อ `READY` — พนักงานนำไปเสิร์ฟที่โต๊ะ) |
| `#/my-orders` | ออเดอร์ที่สั่งจากเบราว์เซอร์นี้ |
| `#/kitchen` | หน้าจอครัว 3 คอลัมน์ (คิวใหม่ / กำลังทำ / รอเสิร์ฟ) |
| `#/admin` | เพิ่ม/แก้/ลบเมนู, อัปโหลดรูป, เปิด-ปิดเมนูที่หมด |

ใช้ `HashRouter` (`/#/kitchen`) เพื่อให้เปิดลิงก์ตรงบน S3 static website ได้โดยไม่ต้องตั้ง rewrite

## หน้าตา (Design)

ธีม "ป้ายร้านเขียนมือ": แถบสีเขียวกระดานเมนู + ตัวเลขสีเหลืองป้าย บนพื้นสีขาว — ออกแบบด้วย [impeccable](https://impeccable.style)

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `DESIGN.md` | ระบบดีไซน์ทั้งหมด: สี (hex), ฟอนต์, ขนาด, มุมโค้ง, component, กฎห้าม/ควรทำ — **อ่านก่อนแก้ UI** |
| `PRODUCT.md` | ผู้ใช้ งาน และข้อจำกัดของระบบ (ร้านนั่งทานในร้าน พนักงานเสิร์ฟที่โต๊ะ) |
| `.impeccable/` | ข้อมูลสำหรับ impeccable (design tokens + direction ของหน้า) |
| `src/index.css` | token สีทั้งหมดอยู่ใน `:root` บนสุดของไฟล์ |

- ฟอนต์ self-host ผ่าน npm (ไม่ต้องโหลดจาก Google Fonts): **Anuphan** (หัวข้อ ปุ่ม ราคา ตัวเลข) + **IBM Plex Sans Thai Looped** (เนื้อหา)
- ไอคอนใช้ `lucide-react` อย่างเดียว ห้ามใช้ emoji แทนไอคอน
- เลขคิวแสดงด้วย `<QueuePlate>` (ตัวเลขเหลืองบนป้ายเขียว) ทุกหน้า
- ฟอร์มสั่งอาหารมีช่อง **เลขโต๊ะ** → ส่งไปเป็น `tableNumber` ใน `POST /orders` (ดู `../docs/API.md`)
- รองรับมือถือ (ตะกร้าเป็นแถบล่าง + bottom sheet), แท็บเล็ต (หน้าครัวสลับคอลัมน์เป็นแท็บ < 900px) และคอม

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
- ไม่ได้ใช้โหมดทดลองแล้ว: แถบ "โหมดทดลอง" บนหัวเว็บจะหายไปเองเมื่อมี `VITE_API_URL`

### ต่อกับ AWS จริง

```bash
cp .env.example .env
# แก้ .env:
# VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/dev
npm run dev
```

## Deploy ขึ้น AWS Amplify (แนะนำ)

โปรเจกต์นี้พร้อมสำหรับ Amplify Hosting แบบต่อ GitHub แล้ว:

- `../amplify.yml` — build spec (monorepo, `appRoot: frontend`) Amplify อ่านเองอัตโนมัติ
- `.nvmrc` — บังคับ Node 22 ตอน build (Vite 8 ต้องใช้ Node ≥ 20.19)
- ตั้ง Environment variable ใน Amplify: `VITE_API_URL` = `ApiBaseUrl` จาก `sam deploy`

ขั้นตอนตั้งค่าแบบละเอียด: [`../amplify-hosting/README.md`](../amplify-hosting/README.md)

> `VITE_API_URL` ถูกฝังตอน `npm run build` — เปลี่ยน URL แล้วต้องสั่ง build ใหม่ใน Amplify
> ถ้าไม่ได้ตั้งค่านี้ เว็บบน Amplify จะรันโหมด Mock (มีแถบสีเหลือง)

### ทางเลือก: Deploy ขึ้น S3 เอง

```bash
npm run build                                   # ได้โฟลเดอร์ dist/
aws s3 sync dist/ s3://<web-bucket>/ --delete
```

## โครงสร้าง

```
src/
├── api/
│   ├── index.js      ← หน้าเว็บ import จากตรงนี้ (เลือก mock / http อัตโนมัติ)
│   ├── http.js       ← เรียก API Gateway จริง
│   └── mock.js       ← backend จำลอง (กฎเดียวกับ Lambda)
├── pages/            ← MenuPage, OrderTrackingPage, MyOrdersPage, KitchenPage, AdminPage
├── components/       ← Layout, QueuePlate (ป้ายเลขคิว), StatusBadge, MenuImage, QtyStepper, ConfirmDialog
├── context/          ← CartContext (ตะกร้า + ออเดอร์ของฉัน + ชื่อ/เลขโต๊ะที่ใช้ล่าสุด)
├── hooks/            ← usePolling, useLocalStorage
├── utils/            ← format (ราคา/เวลา), notify (เสียง + browser notification)
├── constants.js      ← สถานะ ลำดับการเปลี่ยน (ต้องตรงกับ Lambda) และเกณฑ์เวลาเตือนในครัว
└── config.js         ← VITE_API_URL, ระยะ polling
```
