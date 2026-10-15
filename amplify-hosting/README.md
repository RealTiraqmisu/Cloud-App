# Deploy frontend ขึ้น AWS Amplify Hosting

Frontend (React + Vite) อยู่ใน `frontend/` ของ repo นี้ — Amplify จะดึงจาก GitHub แล้ว build ให้เองทุกครั้งที่ push

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|---|---|
| `amplify.yml` (root ของ repo) | Build spec แบบ monorepo (`appRoot: frontend`) — Amplify ตรวจเจอเองอัตโนมัติ |
| `frontend/.nvmrc` | บังคับ build ด้วย Node 22 (Vite 8 ต้องใช้ Node ≥ 20.19) |
| `frontend/src/config.js` | อ่าน `VITE_API_URL` — ว่าง = โหมด Mock |
| `amplify-hosting/set-api-url.*` | สคริปต์ดึง `ApiBaseUrl` จาก SAM แล้วตั้งให้ Amplify + build ใหม่ |
| `SAM/amplify.yaml` | (ทางเลือก) สร้าง Amplify app ด้วย CloudFormation แทนการกดใน console |

## 0. ก่อนเริ่ม

1. **Push โค้ดล่าสุดขึ้น GitHub** (ต้องมี `amplify.yml` กับ `frontend/.nvmrc` อยู่บน branch `main`)
   ```bash
   git add amplify.yml amplify-hosting frontend SAM/amplify.yaml
   git commit -m "Prepare frontend for AWS Amplify Hosting"
   git push origin main
   ```
2. **Deploy backend ก่อน** แล้วจด `ApiBaseUrl`
   ```bash
   cd SAM && sam build && sam deploy
   sam list stack-outputs --stack-name food-ordering --region us-east-1
   # ApiBaseUrl = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
   ```
   > ยังไม่มี backend ก็ deploy ได้ — เว้น `VITE_API_URL` ไว้ เว็บจะรันโหมด Mock (แถบเหลือง) ไว้เดโม UI

## 1. สร้าง App ใน Amplify Console

Region: **us-east-1** (ให้ตรงกับ SAM)

1. AWS Console → **AWS Amplify** → **Create new app**
2. เลือก **GitHub** → **Next** → กด Authorize / ติดตั้ง *AWS Amplify GitHub App* ให้เข้าถึง repo `RealTiraqmisu/Cloud-App`
   (ถ้า repo อยู่ใน account ของเพื่อน เจ้าของ repo ต้องเป็นคนกด authorize หรือเพิ่มเราเป็น collaborator ก่อน)
3. **Repository** = `RealTiraqmisu/Cloud-App`, **Branch** = `main`
4. ติ๊ก ✅ **My app is a monorepo** → **Monorepo root directory** = `frontend` → **Next**

## 2. App settings

| ช่อง | ค่า |
|---|---|
| App name | `food-ordering-frontend` |
| Build settings | ควรขึ้นว่า *detected `amplify.yml`* — **ไม่ต้องแก้** (ไฟล์ใน repo override ค่าใน console อยู่แล้ว) |
| Frontend build command / Build output directory | `npm run build` / `dist` (มาจาก amplify.yml) |
| Service role | ไม่จำเป็นสำหรับเว็บ static — ถ้า Learner Lab สร้าง role ไม่ได้ ให้เลือก **Use an existing service role → LabRole** หรือข้ามไป |

เปิด **Advanced settings → Environment variables** แล้วเพิ่ม:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev` (ค่า `ApiBaseUrl`, **ไม่มี `/` ท้าย**) |
| `AMPLIFY_MONOREPO_APP_ROOT` | `frontend` (console ตั้งให้เองเมื่อติ๊ก monorepo — เช็กว่ามี) |

> ⚠️ ชื่อต้องเป็น `VITE_API_URL` เป๊ะ ๆ — Vite ฝังเฉพาะตัวแปรที่ขึ้นต้นด้วย `VITE_` และโค้ดอ่านชื่อนี้
> (ของเก่าใน `SAM/amplify.yaml` ใช้ `VITE_API_BASE_URL` ซึ่งผิด → เว็บจะตกไปโหมด Mock โดยไม่ error)

**Next → Save and deploy** → รอ 3 ขั้น *Provision → Build → Deploy* (~2–4 นาที)

ได้ URL: `https://main.<app-id>.amplifyapp.com`

## 3. ตรวจว่าใช้ได้

- เปิด URL → **ไม่มีแถบสีเหลือง** = ต่อ API จริงแล้ว (มีแถบเหลือง = `VITE_API_URL` ว่าง/ชื่อผิด)
- ดู log build: ต้องเห็น `Using API: https://...` และ `node -v` เป็น `v22.x`
- ลองทุกหน้า: `#/`, `#/kitchen`, `#/admin`, `#/my-orders`
- เปิด DevTools → Network: request ไป `execute-api` ต้องไม่ติด CORS

## 4. หลังจากนี้

- **แก้โค้ดแล้ว push ขึ้น `main`** → Amplify build + deploy ให้อัตโนมัติ
- **เปลี่ยน API URL** (เช่น deploy SAM stack ใหม่) → ต้อง build ใหม่ เพราะค่าถูกฝังตอน build:
  - Console: *Hosting → Environment variables → Manage variables* แก้ค่า → ไปที่ branch → **Redeploy this version**
  - หรือใช้สคริปต์ (ต้อง `aws configure` แล้ว, App ID ดูได้จากหน้า *App settings → General*):
    ```powershell
    # PowerShell (Windows)
    .\amplify-hosting\set-api-url.ps1 -AppId d1abcdefgh1234
    ```
    ```bash
    # Git Bash / Linux / macOS
    ./amplify-hosting/set-api-url.sh d1abcdefgh1234
    ```
- **Rewrites and redirects**: ไม่ต้องตั้งเพิ่ม เพราะใช้ `HashRouter` (`/#/kitchen`) — rule ค่าเริ่มต้น `/<*> → /index.html (404-200)` ใช้ได้เลย

## 5. ฝั่ง Backend ที่ต้องรองรับ Amplify

1. **CORS ของ API Gateway** — ตอนนี้ `CorsAllowedOrigin="*"` ใช้ได้แล้ว
   ถ้าอยากล็อกเฉพาะเว็บเรา: แก้ใน `SAM/samconfig.toml` เป็น `CorsAllowedOrigin="https://main.<app-id>.amplifyapp.com"` แล้ว `sam deploy`
2. **Lambda ต้องคืน header CORS เอง** (proxy integration) ทุก response รวมถึงตอน error:
   ```python
   "headers": {"Access-Control-Allow-Origin": os.environ.get("CORS_ALLOWED_ORIGIN", "*"),
               "Content-Type": "application/json"}
   ```
   และ body ต้องเป็น JSON ตาม `docs/API.md` (ตอนนี้ Lambda ยังเป็น placeholder ที่คืน text ธรรมดา)
3. **อัปโหลดรูปเมนู** (presigned PUT จากเบราว์เซอร์) — bucket `MenuImagesBucket` ต้องมี CORS เพิ่มใน `SAM/template.yaml`:
   ```yaml
   CorsConfiguration:
     CorsRules:
       - AllowedOrigins: ['*']          # หรือ https://main.<app-id>.amplifyapp.com
         AllowedMethods: [PUT, GET]
         AllowedHeaders: ['*']
         MaxAge: 3000
   ```

## แก้ปัญหาที่เจอบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| Build fail: `Vite requires Node.js version 20.19+` | ไม่ได้ใช้ Node 22 → เช็กว่า `frontend/.nvmrc` ถูก push แล้ว หรือตั้ง *Build settings → Build image settings → Live package updates → Node.js = 22* |
| Build fail เรื่อง monorepo / `appRoot` | ไม่ได้ตั้ง `AMPLIFY_MONOREPO_APP_ROOT=frontend` หรือค่าไม่ตรงกับ `appRoot` ใน `amplify.yml` |
| `npm ci` fail: lock file ไม่ sync | รัน `npm install` ในเครื่อง แล้ว commit `frontend/package-lock.json` ใหม่ |
| เว็บขึ้นแต่มีแถบเหลือง (Mock) | `VITE_API_URL` ว่างหรือชื่อผิด → แก้แล้ว **Redeploy** |
| Console: `blocked by CORS policy` | Lambda ไม่ได้ใส่ `Access-Control-Allow-Origin` ใน response (ดูข้อ 5) |
| `เชื่อมต่อ API ไม่ได้` | URL ผิด / stage ผิด (`/dev`) / ใส่ `/` ท้าย / stack ถูกลบ |
| หน้าเว็บขาว 404 ตอนเข้า path ตรง | ใช้ลิงก์แบบ `/#/kitchen` ไม่ใช่ `/kitchen` |

## ทางเลือก: สร้างด้วย CloudFormation

ดูคำสั่งในหัวไฟล์ `SAM/amplify.yaml` (ต้องมี GitHub personal access token) — ได้ผลเหมือนกดใน console ทุกอย่าง
