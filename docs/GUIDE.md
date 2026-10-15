# Food Order System บน AWS Learner Lab — คู่มือและบันทึกการทำงาน

ระบบรับและจัดการคำสั่งซื้ออาหาร: สร้าง Order → ส่งเข้าคิวครัว → ติดตาม/อัปเดตสถานะ → แจ้งเตือนเมื่ออาหารพร้อม

---

## 1. การตัดสินใจที่เลือกแล้ว

| หัวข้อ | เลือก | เหตุผล |
|---|---|---|
| ภาษา Lambda | **Python 3.12** | `boto3` มีใน Lambda อยู่แล้ว, โค้ดสั้น อ่านง่าย |
| Frontend | **React (Vite)** | แยก component ได้ (หน้าลูกค้า / ครัว / แอดมิน) |
| Deploy | **AWS SAM** ผ่าน terminal ของ Learner Lab | ทดสอบแล้วใช้ได้ (ดูหัวข้อ 4), deploy ซ้ำได้ด้วยคำสั่งเดียว |
| แจ้งเตือนบนเว็บ | **SNS → Lambda + หน้าเว็บ Polling** | ทำง่าย ใช้ได้แน่นอนใน Learner Lab; WebSocket เป็นส่วนเสริมถ้ามีเวลา |
| `notifyCustomer` | **บันทึก log อย่างเดียว** (ไม่ส่งอีเมล) | ลูกค้ารู้จาก popup บนเว็บ (polling) อยู่แล้ว; SNS ไว้โชว์และต่อยอดได้ |
| Region | **us-east-1** | Learner Lab ใช้ได้แค่ us-east-1 / us-west-2 |

**แบ่งงาน:** ฝั่ง Cloud (SAM, Lambda, AWS) = เจ้าของโปรเจกต์ · ฝั่งหน้าเว็บ React = Claude

---

## 2. Architecture

```
 [ลูกค้า / ครัว / แอดมิน]  ← React build แล้วโฮสต์บน S3 bucket เว็บ (Static Website)
            │ HTTPS
            ▼
    Amazon API Gateway (REST API)
            │
            ▼
      AWS Lambda (ทุกตัวใช้ LabRole)
     ┌──────┼──────────────┬─────────────────┐
     ▼      ▼              ▼                 ▼
 DynamoDB  SQS          S3 bucket รูปเมนู  SNS Topic
 (Orders,  order-queue   presigned URL    "order-events"
  Menu)     │   └─► DLQ                      │
            ▼                                ▼
     Lambda: kitchenConsumer          Lambda: notifyCustomer
     (สถานะ → QUEUED + เลขคิว)         (บันทึก log ลง CloudWatch)

 CloudWatch: Logs ทุก Lambda, Metrics, Alarms, Dashboard
```

### Flow ของ Order

| ขั้น | เกิดอะไรขึ้น | Service |
|---|---|---|
| 1. สร้าง Order | `POST /orders` → ตรวจราคาจาก Menu → บันทึกสถานะ `PENDING` | API GW, Lambda, DynamoDB |
| 2. ส่งเข้าคิว | ส่ง `{orderId}` เข้า SQS | SQS |
| 3. ครัวรับคิว | SQS trigger `kitchenConsumer` → `QUEUED` + ออกเลขคิว (ล้มเหลว 3 ครั้ง → DLQ) | SQS, Lambda, DynamoDB |
| 4. ครัวทำอาหาร | หน้าจอครัวดึงรายการ `QUEUED`/`PREPARING` แล้วกดเปลี่ยนสถานะ | API GW, Lambda, DynamoDB |
| 5. อาหารพร้อม | สถานะ `READY` → publish SNS → Lambda `notifyCustomer` บันทึก log | SNS, Lambda, CloudWatch |
| 6. ติดตามสถานะ | หน้าเว็บลูกค้า `GET /orders/{id}` ทุก 3–5 วินาที → เจอ `READY` แสดง popup | API GW, Lambda |

**สถานะ:** `PENDING → QUEUED → PREPARING → READY → COMPLETED` (ยกเลิก `CANCELLED` ได้เฉพาะตอน `PENDING`/`QUEUED`, ตรวจด้วย DynamoDB `ConditionExpression`)

### API Endpoints

| Method | Path | Lambda | ผู้ใช้ |
|---|---|---|---|
| GET | `/menu` | `listMenu` | ลูกค้า |
| POST / PUT / DELETE | `/menu`, `/menu/{id}` | `manageMenu` | แอดมิน |
| POST | `/menu/upload-url` | `getUploadUrl` (S3 presigned URL) | แอดมิน |
| POST | `/orders` | `createOrder` | ลูกค้า |
| GET | `/orders/{id}` | `getOrder` | ลูกค้า |
| GET | `/orders?status=QUEUED` | `listOrders` | ครัว |
| PATCH | `/orders/{id}/status` | `updateOrderStatus` | ครัว |
| — | SQS trigger | `kitchenConsumer` | ระบบ |
| — | SNS trigger | `notifyCustomer` | ระบบ |

### DynamoDB

- **`Menu`** — PK `menuId` · `name`, `price`, `category`, `imageKey`, `available`
- **`Orders`** — PK `orderId` · `items[]`, `total`, `status`, `queueNumber`, `customerName`, `contact`, `createdAt`, `updatedAt`, `statusHistory[]`
  - GSI `status-createdAt-index` สำหรับหน้าครัว (ไม่ต้อง Scan)
- **`Counters`** — atomic counter สำหรับเลขคิวรายวัน

### S3 (แยก 2 bucket)

| Bucket | เก็บอะไร | ตั้งค่า |
|---|---|---|
| **bucket เว็บ** | ไฟล์จาก `frontend/dist/` (HTML / JS / CSS) | เปิด Static Website Hosting + อ่านได้สาธารณะ |
| **bucket รูปเมนู** | รูปเมนูที่แอดมินอัป (`menu/<menuId>.jpg`) | CORS อนุญาต `PUT` (อัปผ่าน presigned URL) + อ่านรูปได้สาธารณะ |

---

## 3. ข้อจำกัดของ Learner Lab ที่ต้องจำ

| ข้อจำกัด | วิธีรับมือ |
|---|---|
| **สร้าง IAM Role ไม่ได้** | ทุก Lambda ต้องใส่ `Role:` เป็น LabRole เอง, **ห้ามใช้ `Policies:`** |
| ใช้ได้แค่ us-east-1 / us-west-2 | deploy ที่ `us-east-1` เสมอ |
| Lambda รันพร้อมกันได้สูงสุด **10** | ตั้ง `ScalingConfig.MaximumConcurrency: 2` ที่ SQS trigger |
| Session หมดทุก ~4 ชม. | กด **Start Lab** ใหม่ — resource ยังอยู่ครบ แต่ credentials เปลี่ยน |
| Budget จำกัด | ใช้แต่ serverless (จ่ายตามใช้), อย่าเปิด EC2/RDS |
| SMS ถูกจำกัด / SES ส่งได้แค่อีเมลที่ยืนยันแล้ว | ไม่ส่งแจ้งเตือนภายนอก ลูกค้าดูจากหน้าเว็บ |

---

## 4. ทดสอบ SAM ใน Learner Lab (ผ่านแล้ว ✅)

ผลที่ได้: `{"message": "SAM deploy works in Learner Lab", "region": "us-east-1"}`

ไฟล์อยู่ที่ `sam-test/`

### 4.1 ขั้นตอน

1. เข้า Learner Lab → กด **Start Lab** → รอไฟเขียว
2. เปิด terminal ของ Learner Lab (หรือ CloudShell ใน Console, region **us-east-1**)
3. นำไฟล์ `sam-test/template.yaml` และ `sam-test/src/app.py` ไปไว้ที่ `~/sam-test/` (แนะนำ `git clone` หรืออัปโหลด — ดูหัวข้อ 5)
4. แก้ Role ให้เป็น ARN จริง (กันปัญหา `${...}` หายตอน paste):
   ```bash
   cd ~/sam-test
   ACC=$(aws sts get-caller-identity --query Account --output text)
   sed -i "s|^      Role: .*|      Role: arn:aws:iam::${ACC}:role/LabRole|" template.yaml
   grep -n "Role:" template.yaml      # ต้องเห็นเลข Account ID ครบ
   ```
5. Build + Deploy:
   ```bash
   sam build
   sam deploy --stack-name sam-test --resolve-s3 --region us-east-1 --no-confirm-changeset
   ```
6. ทดสอบด้วย URL จาก Outputs (`HelloApiUrl`):
   ```bash
   curl https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod/hello
   ```
7. ลบทิ้งเมื่อไม่ใช้ (ไม่บังคับ):
   ```bash
   sam delete --stack-name sam-test --region us-east-1 --no-prompts
   ```

### 4.2 Template ที่ใช้ได้

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: python3.12
    Timeout: 10
    MemorySize: 128
    # ห้ามใส่ Role ตรงนี้ — SAM ไม่รองรับ

Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: sam-test-hello
      Role: !Sub arn:aws:iam::${AWS::AccountId}:role/LabRole   # ใส่ทุก function
      CodeUri: src/
      Handler: app.handler
      Events:
        HelloApi:
          Type: Api
          Properties:
            Path: /hello
            Method: get

Outputs:
  HelloApiUrl:
    Value:
      Fn::Sub: "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello"
```

### 4.3 ปัญหาที่เจอและวิธีแก้

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| `'Role' is not a supported property of 'Function'` (ตอน `sam build`) | ใส่ `Role` ไว้ใน `Globals` | ย้าย `Role:` ไปไว้ในแต่ละ function |
| `while scanning a tag ... !Subhttps://` | ช่องว่างระหว่าง `!Sub` กับ `https` หายตอน paste | `sed -i 's/!Subhttps/!Sub\x20https/' template.yaml` หรือใช้รูปแบบ `Fn::Sub: "..."` |
| `Failed to create changeset ... AWS::EarlyValidation::PropertyValidation` | บรรทัด `Role:` ถูกตัดเหลือ `arn:aws:iam::` (paste ทำ `${...}` หาย) | ใช้คำสั่ง `sed` ในข้อ 4.1 ขั้นที่ 4 ใส่ ARN จริง |
| คำสั่ง `aws ...` ค้างนาน | Session lab หมด / คำสั่งยังไม่ถูกรัน (prompt `❯` รอ Enter) | Ctrl+C → เช็ค timer → Start Lab ใหม่ → รันทีละบรรทัด |
| `aws cloudformation wait stack-delete-complete` ค้าง | waiter poll ทุก 30 วิ นานสุด 1 ชม. | Ctrl+C แล้ว `sam deploy` ต่อได้เลย (stack สถานะ `REVIEW_IN_PROGRESS` deploy ทับได้) |

**ตรวจไฟล์หาอักขระเพี้ยน:** `cat -A template.yaml` (ปลายบรรทัดมี `$` เป็นเรื่องปกติ)

**ดูรายละเอียด error ของ changeset:**
```bash
CS=$(aws cloudformation list-change-sets --stack-name <stack> --region us-east-1 \
      --query 'Summaries[0].ChangeSetId' --output text)
aws cloudformation describe-change-set --change-set-name "$CS" --region us-east-1 \
  --query '{Status:Status,Reason:StatusReason}'
```

---

## 5. บทเรียนสำคัญ

1. **ห้าม paste โค้ด/template ยาว ๆ ลง terminal** — ช่องว่างและ `${...}` หายได้ ให้ใช้ `git clone` / `git pull` จาก GitHub หรืออัปโหลด zip แทน
2. ทุก Lambda ต้องมี `Role:` = LabRole และห้ามมี `Policies:`
3. คำสั่งค้าง → เช็ค session lab ก่อนเสมอ
4. รันคำสั่งทีละบรรทัดเมื่อ debug

---

## 6. ลำดับการพัฒนา

- [x] ทดสอบ SAM ใน Learner Lab
- [ ] ตัดสินใจวิธีส่งโค้ดเข้า terminal (GitHub แนะนำ / zip)
- [ ] **Phase 1:** Infra — DynamoDB, SQS + DLQ, SNS, S3 2 bucket (เว็บ + รูปเมนู) ด้วย SAM
- [ ] **Phase 2:** Menu CRUD + อัปโหลดรูปผ่าน presigned URL
- [ ] **Phase 3:** `createOrder` → SQS → `kitchenConsumer`
- [ ] **Phase 4:** `updateOrderStatus` + state validation + SNS → `notifyCustomer`
- [x] **Phase 5a:** Frontend React (ลูกค้า / ครัว / แอดมิน) ด้วย mock data — ดู `frontend/README.md`, สัญญา API ใน `docs/API.md`
- [ ] **Phase 5b:** ต่อ frontend กับ API จริง (`VITE_API_URL`) → build → deploy ขึ้น S3 bucket เว็บ
- [ ] **Phase 6:** CloudWatch Alarms (DLQ > 0, Lambda Errors, API 5XX) + Dashboard
- [ ] **Phase 7:** ทดสอบ end-to-end + เตรียม demo
- [ ] (เสริม) WebSocket แจ้งเตือน real-time
