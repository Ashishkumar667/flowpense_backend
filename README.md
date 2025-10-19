# 💳 Flowpense – Corporate Expense Management System

Flowpense is a **full-stack financial management and virtual card system** designed to help organizations manage teams, budgets, expenses, and KYC-compliant payments.  
It supports **role-based access**, **virtual card generation**, **expense approvals**, **real-time notifications**, and **Paystack-based onboarding and verification**.

---

## 🚀 Features

### 👥 User & Authentication
- Secure **JWT-based authentication** with **hashed passwords** (`bcrypt`)
- **Role-based access control** (`ADMIN`, `TEAMLEAD`, `EMPLOYEE`, `SUPERADMIN`)
- **Email verification** using OTP
- **Multi-factor authentication (MFA)** support

### 🏢 Company Management
- Create and manage company profiles
- Upload and verify **Company KYC**
- Integrated with **Paystack Customer API** for verification
- Manage company wallets and transaction ledger

### 💳 Card Management
- Create **Virtual Cards** with limits:
  - Daily, Weekly, Monthly, and Per-Transaction limits
- Assign **Card Holders**, **Approvers**, and **Blocked Categories**
- Auto-generate card numbers
- Manage card funding requests
- Delete or archive cards safely

### 💸 Expense Management
- Employees can log expenses against their cards
- Automatic approval for low-value expenses (≤ 10,000 NGN)
- Approval workflow for higher amounts
- Real-time email notifications for expense requests
- Redis caching for performance optimization

### 📊 Wallet & Ledger
- Real-time wallet updates with balance tracking
- Transaction ledger for every financial activity
- Integration-ready with Paystack webhooks

### 🧾 KYC Management
- User and Company KYC document uploads
- Stored as JSON metadata in the database
- Reviewed by Super Admin
- Verified using Paystack BVN and account APIs

### 🔔 Notifications
- Notifications stored in PostgreSQL for persistence

### 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Backend Framework** | Node.js + Express |
| **ORM** | Prisma ORM |
| **Database** | PostgreSQL |
| **Cache / PubSub** | Redis |
| **Authentication** | JWT + bcrypt |
| **Payments** | Paystack API |
| **Email** | Nodemailer + Custom Templates |
| **Deployment** | Render |
| **Containerization** | Docker + Docker Compose |

---

## ⚙️ Installation & Setup

### 🧩 Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/) (optional for local setup)

---

### 🪄 Clone the repository
```bash
git clone https://gitlab.funtech.dev/flowpence/flowpence_backend
cd flowpense

```
### 📦 Install dependencies
```bash
npm install
```

### ⚙️ Environment Variables
```bash
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
PORT=4000
STRIPE_SECRET_KEY=
CLIENT_URL=
STRIPE_WEBHOOK_SECRET=
JWT_REFRESH_SECRET=
DATABASE_URL=
DIRECT_URL=
GOOGLE_CLIENT_ID=

PAYSTACK_SECRET_KEY=
GOOGLE_CLIENT_ID_WEB=
GOOGLE_CLIENT_SECRET=
BACKEND_URL=
FRONTEND_URL=
GOOGLE_REDIRECT_URI=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
REDIS_URL=
AUTO_APPROVE_LIMIT=
PAGA_PRINCIPAL=
PAGA_CREDENTIALS=cV7=
PAGA_HMAC_SECRET=
PAGA_BASE_URL=
PAGA_PERSISTENT_BASE_URL=
PAGA_RECEIVER_PHONE=  
WEBHOOK_URL=
destinationBankUUID=
destinationBankAccountNumber=
```

### 🛢️ Database Setup
```bash
npx prisma migrate dev --name init
npx prisma generate
To open Prisma Studio (DB GUI): To open prisma DB(GUI)
```

### 🧰 Run Redis (if local)
```bash
redis-server
```
## Or docker
```bash
docker run -d -p 6379:6379 redis
```

### Start the server
```bash
docker run -d -p 6379:6379 redis
```

### Start Command
```bash
npm start
```

### 🧑‍💻 Author
```bash
Ashish Kumar
Backend Developer – Node.js | Prisma | PostgreSQL | Redis | Paystack
🚀 Building scalable financial systems and AI-driven solutions.




