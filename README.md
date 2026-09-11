# 🖥️ IT Equipment Management System
> ระบบบริหารจัดการอุปกรณ์และวัสดุสิ้นเปลืองสารสนเทศแบบครบวงจร (IT Asset & Consumable Inventory Management)

[![Angular](https://img.shields.io/badge/Frontend-Angular_22-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Style-Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 📌 ภาพรวมระบบ (System Overview)

**IT Equipment Management System** เป็นระบบเว็บแอปพลิเคชันสำหรับบริหารจัดการทรัพยากรไอทีขององค์กร ออกแบบมาเพื่อแก้ปัญหาความสับสนระหว่าง **"อุปกรณ์สินทรัพย์ถาวรที่ต้องยืม-คืน"** (Fixed Assets เช่น แล็ปท็อป, จอมอนิเตอร์, โปรเจกเตอร์) กับ **"วัสดุสิ้นเปลืองที่เบิกแล้วตัดสต็อก"** (Consumables เช่น สายแลน, เมาส์, หมึกพิมพ์, ถ่านชาร์จ)

ระบบช่วยให้องค์กรควบคุมวงจรชีวิตอุปกรณ์ (Asset Lifecycle) ได้ตั้งแต่การตรวจรับ, การสร้างรหัสและ QR Code ประจำเครื่อง, การยื่นคำขอยืม-เบิกผ่านระบบ, การอนุมัติโดยผู้ดูแลระบบ, การตรวจสอบและส่งมอบด้วยการสแกน QR Code, ไปจนถึงการวิเคราะห์สถิติการใช้งานและการคาดการณ์ความเสี่ยงของขาดสต็อกด้วย Machine Learning ในอนาคต

---

## ✨ คุณสมบัติเด่นของระบบ (Key Features)

### 1. 📦 Hybrid Inventory Management (จัดการคลังอุปกรณ์แบบผสมผสาน)
- **Fixed Assets (สินทรัพย์ถาวร):** ติดตามรายชิ้น มี Serial Number, หมายเลข QR Code เฉพาะเครื่อง, และติดตามสถานะเรียลไทม์ (`AVAILABLE`, `CHECKED_OUT`, `MAINTENANCE`, `RETIRED`)
- **Consumables (วัสดุสิ้นเปลือง):** จัดการปริมาณสต็อกคงเหลือ (Stock Quantity) และตัดยอดอัตโนมัติเมื่อมีการเบิกใช้งาน
- **Image & Asset Upload:** อัปโหลดรูปภาพตัวจริงของอุปกรณ์และแสดงผลในระบบ
- **Dynamic Categories:** ผู้ดูแลระบบสามารถสร้าง แก้ไข และกำหนดไอคอนหมวดหมู่อุปกรณ์ได้อย่างยืดหยุ่น

### 2. 📱 QR Code Tracking & Verification (ระบบติดตามด้วย QR Code)
- **Auto QR Generation:** สร้าง QR Code ประจำอุปกรณ์อัตโนมัติพร้อมปุ่มสั่งพิมพ์/ดาวน์โหลดเพื่อนำไปติดที่ตัวเครื่อง
- **Built-in QR Scanner:** สแกนเนอร์ในตัวผ่านเว็บแคมหรือกล้องสมาร์ตโฟน (HTML5-QRCode) เพื่อยืนยันการรับเครื่องและการคืนเครื่องได้อย่างรวดเร็ว

### 3. 📝 Request & Approval Workflow (ขั้นตอนการขอยืม-เบิกและอนุมัติ)
- **ยื่นคำขอ:** พนักงานเลือกอุปกรณ์ที่ต้องการ พร้อมระบุวัตถุประสงค์และประเภทคำขอ (`CHECKOUT` ยืมอุปกรณ์ หรือ `CONSUME` เบิกใช้)
- **การอนุมัติ:** ผู้ดูแลระบบตรวจสอบคำขอ พร้อมบันทึกข้อความอนุมัติ (`APPROVE`) หรือระบุเหตุผลในการปฏิเสธ (`REJECT`)
- **Audit Trail:** ตรวจสอบย้อนหลังได้ว่าใครเป็นผู้ขอยืม, อนุมัติเมื่อใด, รับเครื่องไปเมื่อใด, และคืนเครื่องแล้วหรือไม่

### 4. 📊 Interactive Analytics Dashboard (แดชบอร์ดสรุปและวิเคราะห์ข้อมูล)
- **KPI Metric Cards:** สรุปยอดรวมอุปกรณ์, อุปกรณ์ที่ถูกยืมใช้งาน, อุปกรณ์พร้อมใช้, คำขอรออนุมัติ, และรายการที่สต็อกเหลือน้อย
- **Multi-Mode Trend Chart:** กราฟ ApexCharts แสดงแนวโน้มการเบิก-ยืม-คืน สามารถสลับดูได้ทั้ง:
  - **รายปี (Year View):** วิเคราะห์ภาพรวมตลอดทั้งปี
  - **รายเดือน (Month View):** เจาะลึกรายวันในแต่ละเดือน
  - **เลือกช่วงวันเอง (Custom Date Range):** กำหนดวันเริ่มต้น-สิ้นสุดได้อย่างอิสระ พร้อม Shared Tooltip เปรียบเทียบข้อมูล 3 แท่งพร้อมกัน
- **Category Donut Chart:** สัดส่วนอุปกรณ์แยกตามหมวดหมู่

### 5. 🔐 Role-Based Access Control (การจัดการสิทธิ์ผู้ใช้งาน)
- **ADMIN:** สิทธิ์เต็มในการบริหารจัดการ (Dashboard, เพิ่ม/ลบ/แก้ไขอุปกรณ์, อนุมัติคำขอ, จัดการหมวดหมู่, จัดการผู้ใช้งาน)
- **USER:** สิทธิ์ทั่วไปสำหรับพนักงาน (ดูรายการอุปกรณ์, ยื่นคำขอยืม/เบิก, ดูสถานะคำขอและประวัติของตนเอง)
- **Quick Login:** แถบล็อกอินด่วนสำหรับทดสอบระบบ (Admin, IT Engineer, Marketing, HR)

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture)

```mermaid
graph TD
    subgraph Client["Frontend (Angular 22 + Tailwind CSS)"]
        UI[Responsive Web UI]
        AuthGuard[Auth & Admin Route Guards]
        ApexCharts[ApexCharts & AG-Grid]
        Scanner[HTML5 QR Scanner]
    end

    subgraph Server["Backend (Node.js + Express + TypeScript)"]
        API[Express RESTful API]
        AuthMW[JWT & Role Middleware]
        Uploads[Multer File Uploads]
        Controllers[Controllers & Zod Validation]
    end

    subgraph Data["Database & Storage"]
        Prisma[Prisma ORM]
        Postgres[(PostgreSQL Database)]
        LocalStorage[Static Uploads Storage]
    end

    subgraph FutureML["Future AI / ML Microservice"]
        MLService[Stockout Prediction & Demand Forecasting]
    end

    UI -->|HTTP Requests / Bearer JWT| API
    API --> AuthMW
    AuthMW --> Controllers
    Controllers --> Prisma
    Prisma --> Postgres
    Controllers --> Uploads
    Uploads --> LocalStorage
    API -.->|Predictive Data| MLService
```

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **Framework:** [Angular 22](https://angular.dev/) (Standalone Components, Signals Architecture)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts & Visualization:** [ApexCharts](https://apexcharts.com/) / `ng-apexcharts`
- **Data Table:** [AG-Grid Community](https://www.ag-grid.com/)
- **Hardware Integration:** `html5-qrcode` (กล้องสแกน QR Code) และ `qrcode` (สร้างภาพ QR Code)
- **Routing & State:** Angular Router พร้อม Functional Guards (`authGuard`, `adminGuard`)

### Backend
- **Runtime & Language:** [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Web Framework:** [Express 4](https://expressjs.com/)
- **Database ORM:** [Prisma ORM v5](https://www.prisma.io/)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation:** [Zod](https://zod.dev/)
- **File Management:** `multer` (บันทึกรูปภาพอุปกรณ์)

### Database
- **DBMS:** [PostgreSQL](https://www.postgresql.org/)

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema)

```mermaid
erDiagram
    User ||--o{ Request : "submits"
    Category ||--o{ Equipment : "contains"
    Equipment ||--o{ RequestItem : "referenced in"
    Request ||--|{ RequestItem : "contains"

    User {
        string id PK
        string employee_id UK
        string email UK
        string password_hash
        string full_name
        string department
        enum role "USER | ADMIN"
        boolean is_active
        datetime created_at
    }

    Category {
        string id PK
        string name UK
        string description
        string icon
    }

    Equipment {
        string id PK
        string name
        string description
        string category_id FK
        string serial_number UK
        boolean is_consumable
        int quantity
        enum status "AVAILABLE | CHECKED_OUT | MAINTENANCE | RETIRED"
        string location
        string image_url
        string qr_code UK
    }

    Request {
        string id PK
        string request_number UK
        string requester_id FK
        enum type "CHECKOUT | CONSUME"
        enum status "PENDING | APPROVED | REJECTED | RETURNED | CANCELLED"
        string reason
        string admin_note
        datetime approved_at
        datetime rejected_at
    }

    RequestItem {
        string id PK
        string request_id FK
        string equipment_id FK
        int quantity
        datetime checked_out_at
        datetime returned_at
        datetime qr_scanned_at
    }
```

---

## 📂 โครงสร้างไดเรกทอรี (Project Structure)

```text
it-equipment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # สกีมาฐานข้อมูล Prisma
│   │   └── seed.ts             # สคริปต์จำลองข้อมูลเริ่มต้น (Users, Equipment, History)
│   ├── src/
│   │   ├── controllers/        # คอนโทรลเลอร์ประมวลผลคำขอ (Auth, Equipment, Request, ฯลฯ)
│   │   ├── middleware/         # ตรวจสอบสิทธิ์ (Auth Guard, Error Handler, Upload)
│   │   ├── routes/             # นิยาม API Endpoints
│   │   ├── services/           # Business Logic และการเชื่อมต่อฐานข้อมูล
│   │   └── server.ts           # ทางเข้าหลัก Express Server
│   ├── uploads/                # ไดเรกทอรีจัดเก็บรูปภาพอุปกรณ์
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Guards, Interceptors, และ Base Services (Auth, API)
│   │   │   ├── features/       # หน้าจอหลักแต่ละฟังก์ชัน (Auth, Dashboard, Equipment, Requests, History)
│   │   │   ├── layout/         # โครงร่างหน้าเว็บ (Sidebar, Navbar, Main Layout)
│   │   │   ├── shared/         # Reusable Components, Pipes, UI Widgets
│   │   │   ├── app.routes.ts   # แผนผังเส้นทาง URL (Routing)
│   │   │   └── app.config.ts   # การตั้งค่าแอปพลิเคชัน Angular
│   │   └── environments/       # การตั้งค่า Endpoint ตามสภาพแวดล้อม (Dev/Prod)
│   ├── package.json
│   └── angular.json
│
├── .gitignore
└── README.md
```

---

## 🚀 ขั้นตอนการติดตั้งและเริ่มใช้งาน (Getting Started)

### ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
- [PostgreSQL](https://www.postgresql.org/) (กำลังรันอยู่ที่ Port 5432 หรือ Cloud Database)
- เครื่องมือจัดการแพ็กเกจ `npm`

---

### 1. ตั้งค่าและรัน Backend

```bash
# 1. เข้าสู่โฟลเดอร์ backend
cd backend

# 2. ติดตั้ง Dependencies
npm install

# 3. สร้างไฟล์ .env สำหรับตั้งค่าฐานข้อมูล
# ตัวอย่างการกำหนดใน .env:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/it_equipment?schema=public"
# JWT_SECRET="your-super-secret-jwt-key"
# PORT=3000

# 4. ซิงค์โครงสร้างตารางเข้าสู่ฐานข้อมูล
npm run prisma:push

# 5. ใส่ข้อมูลทดสอบ (Seed Data)
npm run prisma:seed

# 6. เริ่มต้นรัน Backend ในโหมด Development
npm run dev
```
> Backend API จะพร้อมใช้งานที่: `http://localhost:3000`

---

### 2. ตั้งค่าและรัน Frontend

```bash
# 1. เปิด Terminal ใหม่ แล้วเข้าสู่โฟลเดอร์ frontend
cd frontend

# 2. ติดตั้ง Dependencies
npm install

# 3. เริ่มต้นรันเซิร์ฟเวอร์ Angular
npm start
```
> Frontend จะพร้อมใช้งานที่: `http://localhost:4200`

---

## 👥 บัญชีผู้ใช้สำหรับการทดสอบ (Default Credentials)

สามารถกดปุ่ม **Quick Login** ที่หน้าล็อกอิน หรือกรอกข้อมูลต่อไปนี้:

| อีเมล (Email) | รหัสผ่าน (Password) | บทบาท (Role) | ตำแหน่ง / แผนก |
| :--- | :--- | :--- | :--- |
| `admin@company.com` | `password123` | **ADMIN** | IT Administrator (สิทธิ์ดูแลระบบ) |
| `somchai@company.com` | `password123` | **USER** | Software Engineering |
| `kanokwan@company.com` | `password123` | **USER** | Marketing & Design |

---

## 🔮 แผนการต่อยอดด้วย AI / Machine Learning (Future Roadmap)

ระบบถูกออกแบบโครงสร้างฐานข้อมูลและการเก็บ Log ให้พร้อมสำหรับการเชื่อมต่อกับโมเดลการเรียนรู้ของเครื่อง (Machine Learning) เพื่อยกระดับสู่การเป็น **Smart IT Inventory**:

1. **Stockout Risk Prediction (ทำนายความเสี่ยงของขาดสต็อก):**
   - ใช้ชุดข้อมูลพฤติกรรมการเบิกจ่ายและสต็อกคงเหลือ (เทียบเคียงกับชุดข้อมูล Kaggle: `Inventory Demand Forecasting and Stockout Risk`)
   - นำอัลกอริทึม Classification (เช่น **Random Forest**, **XGBoost**) มาวิเคราะห์อัตราการเบิกใช้งาน, Lead Time ของคู่ค้า, และส่งการแจ้งเตือนความเสี่ยงของหมดสต็อกล่วงหน้า
2. **Demand Forecasting (พยากรณ์ความต้องการเบิกใช้อุปกรณ์):**
   - ใช้อัลกอริทึม Time-Series เพื่อประมาณการความต้องการใช้วัสดุสิ้นเปลืองรายไตรมาส ช่วยลดปัญหาสต็อกจมและวางแผนงบประมาณได้อย่างแม่นยำ
3. **Automated Reordering Recommendation:**
   - แนะนำรายการและจำนวนอุปกรณ์ที่ควรสั่งซื้อเติมสต็อกโดยอัตโนมัติตามสถิติการใช้งานจริง

---

## 📄 ใบอนุญาต (License)
โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษาและการพัฒนาระบบสารสนเทศ (Senior Project)
