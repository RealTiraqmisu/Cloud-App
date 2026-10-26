# API Contract (Frontend ↔ Lambda)

หน้าเว็บ React เรียก API ตามสัญญานี้ Lambda ทุกตัวต้องรับ/ส่งข้อมูลตามรูปแบบนี้ ถ้าจะเปลี่ยน ต้องแก้ทั้งสองฝั่ง

- Base URL: `https://<api-id>.execute-api.us-east-1.amazonaws.com/dev` (ใส่ใน `frontend/.env` เป็น `VITE_API_URL`)
- ทุก request/response เป็น JSON (`Content-Type: application/json`)
- ทุก response ต้องมี CORS header:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Headers: Content-Type
  Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
  ```
- Error: status 4xx/5xx พร้อม body `{ "error": "ข้อความอธิบาย" }`
- เวลาใช้ ISO 8601 UTC เช่น `"2026-09-24T10:15:00Z"`
- ราคาเป็นตัวเลข (บาท) เช่น `60` หรือ `55.5` (ใน Python แปลง `Decimal` → `float`/`int` ก่อน `json.dumps`)

---

## Data Models

### MenuItem
```json
{
  "menuId": "m-7f3a",
  "name": "ข้าวกะเพราหมูสับ",
  "description": "ไข่ดาวเพิ่ม 10 บาท",
  "price": 60,
  "category": "อาหารจานเดียว",
  "imageKey": "menu/m-7f3a.jpg",
  "imageUrl": "https://<bucket>.s3.amazonaws.com/menu/m-7f3a.jpg",
  "available": true
}
```
- `imageUrl` Lambda สร้างจาก `imageKey` ตอนส่งกลับ (ไม่ต้องเก็บใน DB) — เป็น `null` ได้ถ้าไม่มีรูป

### Order
```json
{
  "orderId": "o-20260924-8c1d",
  "queueNumber": 12,
  "customerName": "สมชาย",
  "tableNumber": "5",
  "contact": "somchai@example.com",
  "note": "ไม่เผ็ด",
  "items": [
    { "menuId": "m-7f3a", "name": "ข้าวกะเพราหมูสับ", "price": 60, "qty": 2 }
  ],
  "total": 120,
  "status": "QUEUED",
  "statusHistory": [
    { "status": "PENDING", "at": "2026-09-24T10:15:00Z" },
    { "status": "QUEUED",  "at": "2026-09-24T10:15:02Z" }
  ],
  "createdAt": "2026-09-24T10:15:00Z",
  "updatedAt": "2026-09-24T10:15:02Z"
}
```
- `queueNumber` เป็น `null` จนกว่า `kitchenConsumer` จะออกเลขคิว
- `name`, `price` ใน `items` คัดลอกมาจาก Menu ตอนสร้าง Order (ราคาเปลี่ยนภายหลังไม่กระทบ Order เก่า)

### Status

| status | ความหมาย | เปลี่ยนไปได้ |
|---|---|---|
| `PENDING` | สร้างแล้ว รอเข้าคิว | `QUEUED`, `CANCELLED` |
| `QUEUED` | อยู่ในคิวครัว | `PREPARING`, `CANCELLED` |
| `PREPARING` | กำลังทำ | `READY` |
| `READY` | อาหารพร้อม (ส่ง SNS) | `COMPLETED` |
| `COMPLETED` | รับอาหารแล้ว | — |
| `CANCELLED` | ยกเลิก | — |

เปลี่ยนสถานะผิดลำดับ → `409 { "error": "Cannot change status from X to Y" }`

---

## Endpoints

### `GET /menu`
เมนูทั้งหมด (หน้าลูกค้ากรอง `available` เอง)

Response `200`
```json
{ "items": [ MenuItem, ... ] }
```

### `POST /menu`
Body
```json
{ "name": "...", "description": "...", "price": 60, "category": "...", "imageKey": "menu/abc.jpg", "available": true }
```
- required: `name`, `price` · `imageKey` เป็น `null` ได้

Response `201` → `{ "item": MenuItem }`

### `PUT /menu/{menuId}`
Body เหมือน `POST /menu` (ส่งมาครบทุก field)

Response `200` → `{ "item": MenuItem }` · ไม่พบ → `404`

### `DELETE /menu/{menuId}`
Response `200` → `{ "ok": true }`

### `POST /menu/upload-url`
ขอ presigned URL สำหรับอัปโหลดรูปขึ้น S3

Body
```json
{ "fileName": "kaprao.jpg", "contentType": "image/jpeg" }
```
Response `200`
```json
{
  "uploadUrl": "https://<bucket>.s3.amazonaws.com/menu/....jpg?X-Amz-...",
  "imageKey": "menu/9b2e-kaprao.jpg",
  "imageUrl": "https://<bucket>.s3.amazonaws.com/menu/9b2e-kaprao.jpg"
}
```
หน้าเว็บจะ `PUT` ไฟล์ไปที่ `uploadUrl` โดยตรง (header `Content-Type` ตรงกับที่ขอ) แล้วเอา `imageKey` ไปใส่ใน `POST/PUT /menu`
→ S3 bucket ต้องตั้ง CORS อนุญาต `PUT` จากทุก origin

### `POST /orders`
Body
```json
{
  "customerName": "สมชาย",
  "tableNumber": "5",
  "contact": "somchai@example.com",
  "note": "ไม่เผ็ด",
  "items": [ { "menuId": "m-7f3a", "qty": 2 } ]
}
```
- required: `customerName`, `items` (อย่างน้อย 1, `qty` ≥ 1)
- `tableNumber` (string, ไม่บังคับฝั่ง API แต่หน้าเว็บบังคับกรอก) — เลขโต๊ะสำหรับให้พนักงานเสิร์ฟ เก็บลง Order และส่งกลับใน response ทุกตัว (หน้าครัวใช้แสดง "โต๊ะ 5")
- Lambda ต้องดึงชื่อ/ราคาจาก Menu เอง (ห้ามเชื่อราคาจาก client) และปฏิเสธเมนูที่ `available: false` → `400`
- บันทึกสถานะ `PENDING` แล้วส่ง `{ "orderId": "..." }` เข้า SQS

Response `201` → `{ "order": Order }`

### `GET /orders/{orderId}`
หน้าลูกค้าเรียกทุก ~4 วินาที (polling)

Response `200` → `{ "order": Order } ` · ไม่พบ → `404`

### `GET /orders?status=QUEUED,PREPARING,READY`
หน้าครัวเรียกทุก ~4 วินาที · `status` คั่นด้วย comma (query ผ่าน GSI `status-createdAt-index` ทีละสถานะแล้วรวม)

Response `200` → `{ "orders": [ Order, ... ] }` เรียงตาม `createdAt` เก่า → ใหม่

### `PATCH /orders/{orderId}/status`
Body
```json
{ "status": "PREPARING" }
```
- ตรวจลำดับตามตาราง Status (DynamoDB `ConditionExpression`)
- ถ้าเปลี่ยนเป็น `READY` → publish SNS topic `order-events`

Response `200` → `{ "order": Order }` · ผิดลำดับ → `409` · ไม่พบ → `404`
