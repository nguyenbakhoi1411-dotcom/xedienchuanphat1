# Chuẩn Phát — Hệ Thống Quản Trị Showroom Xe Điện

Hệ thống ERP đa chi nhánh cho showroom xe điện **Chuẩn Phát**, xây dựng tiệm cận MISA AMIS.

---

## Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| Backend | Spring Boot 3.3, Spring Security, Spring Data JPA |
| Xác thực | JWT (Access Token + Refresh Token) |
| Database (dev) | H2 In-Memory (mode PostgreSQL) |
| Database (prod) | PostgreSQL 14+ |
| Migration | Flyway |
| Frontend | Next.js 15, React 18, TypeScript |
| State | TanStack Query, Zustand |
| UI | Tailwind CSS, Recharts |
| Export | Apache POI (Excel), OpenPDF |

---

## Yêu Cầu Hệ Thống

| Thành phần | Phiên bản tối thiểu |
|-----------|---------------------|
| Java | 17+ |
| Maven | 3.8+ (hoặc dùng `./mvnw`) |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ (chỉ production) |

---

## Cách Chạy Backend

### Development (H2 in-memory, tự seed dữ liệu demo)

```bash
# Sử dụng Maven Wrapper — không cần cài Maven riêng
./mvnw spring-boot:run
```

Backend chạy tại: `http://localhost:8080`  
H2 Console (chỉ dev): `http://localhost:8080/h2-console`  
JDBC URL H2: `jdbc:h2:mem:warrantydb`

### Chạy JAR trực tiếp (dev)

```bash
./mvnw clean package -DskipTests
java -jar target/warranty-service-0.0.1-SNAPSHOT.jar
```

### Production

```bash
# 1. Đặt biến môi trường (xem mục Biến Môi Trường bên dưới)
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL="jdbc:postgresql://localhost:5432/chuanphat"
export DATABASE_USERNAME="chuanphat_user"
export DATABASE_PASSWORD="<mật khẩu mạnh>"
export JWT_SECRET="<chuỗi ngẫu nhiên tối thiểu 64 ký tự>"
export CORS_ALLOWED_ORIGIN_PATTERNS="https://app.chuanphat.vn"

# 2. Build và chạy
./mvnw clean package -DskipTests
java -jar target/warranty-service-0.0.1-SNAPSHOT.jar
```

---

## Cách Chạy Frontend

### Development

```bash
cd frontend

# Lần đầu: cài dependencies
npm install

# Tạo file env local (chỉ cần làm một lần)
cp .env.example .env.local
# Chỉnh sửa .env.local nếu cần

# Khởi động dev server
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

### Production

```bash
cd frontend

# Tạo .env.production với giá trị thực
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.chuanphat.vn
NEXT_PUBLIC_ENABLE_MOCK=false
NEXT_PUBLIC_ENABLE_MOCK_LOGIN=false
EOF

# Build (không cần node_modules từ dev — luôn cài sạch)
rm -rf node_modules .next
npm ci
npm run typecheck
npm run lint
npm run build

# Chạy production server
npm run start
```

---

## Cấu Hình Database

### Dev (Tự động — không cần cài đặt)

Profile `dev` dùng H2 in-memory với mode PostgreSQL và tự seed dữ liệu demo.  
Không cần cấu hình thêm.

### Production (PostgreSQL)

**Bước 1: Tạo database và user**

```sql
-- Kết nối vào PostgreSQL với quyền superuser
CREATE DATABASE chuanphat ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';
CREATE USER chuanphat_user WITH PASSWORD 'change_me_strong_password';
GRANT ALL PRIVILEGES ON DATABASE chuanphat TO chuanphat_user;

-- PostgreSQL 15+: cần cấp thêm schema
\c chuanphat
GRANT ALL ON SCHEMA public TO chuanphat_user;
```

**Bước 2: Flyway tự động chạy migration khi backend khởi động**

Migration files tại `src/main/resources/db/migration/`:

| File | Nội dung |
|------|----------|
| `V1__init_schema.sql` | Schema cơ sở: branch, product, serial, sales, inventory, accounting, auth |
| `V2__seed_permissions.sql` | Permissions và roles |
| `V3__seed_admin.sql` | Placeholder admin |
| `V4__add_indexes.sql` | Indexes hiệu năng cơ bản |
| `V5__erp_role_permission_alignment.sql` | Chuẩn hóa quyền ERP |
| `V6__inventory_warehouse_cost_alignment.sql` | Chuẩn hóa kho và giá vốn |
| `V7__accounting_period.sql` | Kỳ kế toán (lock/unlock) |
| `V8__serial_enhancement.sql` | Nâng cấp serial xe |
| `V9__tax_management.sql` | Quản lý thuế suất |
| `V10__deposit.sql` | Đặt cọc xe |
| `V11__purchase_enhancements.sql` | Trả hàng NCC, thanh toán NCC |
| `V12__voucher_usage.sql` | Lịch sử dùng voucher |
| `V13__hr_module.sql` | Nhân sự, chấm công, lương, KPI |
| `V14__performance_indexes.sql` | Indexes hiệu năng bổ sung |

> ⚠️ **Không bao giờ** dùng `ddl-auto=update` ở production. Profile prod dùng `ddl-auto=validate` + Flyway.

---

## Biến Môi Trường

### Backend

#### Dev (tùy chọn override)

```bash
# Không bắt buộc — dev chạy ổn với giá trị mặc định
JWT_SECRET=dev-only-change-before-production-64-character-secret
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_PASSWORD=Admin@123
```

#### Production (BẮT BUỘC đầy đủ)

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `SPRING_PROFILES_ACTIVE` | Profile Spring | `prod` |
| `DATABASE_URL` | JDBC URL PostgreSQL | `jdbc:postgresql://localhost:5432/chuanphat` |
| `DATABASE_USERNAME` | Tên user DB | `chuanphat_user` |
| `DATABASE_PASSWORD` | Mật khẩu DB | `<mật khẩu mạnh>` |
| `JWT_SECRET` | Secret ký JWT (≥ 64 ký tự) | `<chuỗi ngẫu nhiên dài>` |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Domain frontend được phép | `https://app.chuanphat.vn` |
| `SERVER_PORT` | Port backend | `8080` |
| `MAIL_ENABLED` | Bật tính năng mail | `false` |
| `EXPOSE_RESET_TOKEN` | Lộ token reset (dev only) | `false` |
| `BOOTSTRAP_ADMIN_ENABLED` | Tạo admin lần đầu | `false` |
| `BRANCH_STRICT_MODE` | Giới hạn chi nhánh chặt | `true` |
| `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` | Số lần đăng nhập sai tối đa | `5` |
| `LOGIN_RATE_LIMIT_WINDOW_SECONDS` | Cửa sổ rate limit (giây) | `300` |

#### Tạo Admin Production (chỉ làm một lần)

```bash
# Bật tạm thời khi khởi tạo hệ thống lần đầu
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_PASSWORD=<mật khẩu rất mạnh>
BOOTSTRAP_ADMIN_EMAIL=admin@chuanphat.vn
BOOTSTRAP_ADMIN_FULL_NAME=Quản Trị Viên
BOOTSTRAP_ADMIN_PHONE=0909000000

# Sau khi đăng nhập thành công → TẮT NGAY
BOOTSTRAP_ADMIN_ENABLED=false
# Restart backend
```

### Frontend

File: `frontend/.env.local` (dev) hoặc `frontend/.env.production` (prod)

```bash
# URL backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Mock data — FALSE trong production, có thể TRUE chỉ trong development
NEXT_PUBLIC_ENABLE_MOCK=false
NEXT_PUBLIC_ENABLE_MOCK_LOGIN=false
```

---

## Build Production

### Backend

```bash
# 1. Set env vars
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL="jdbc:postgresql://localhost:5432/chuanphat"
export DATABASE_USERNAME="chuanphat_user"
export DATABASE_PASSWORD="strong_password_here"
export JWT_SECRET="$(openssl rand -hex 64)"
export CORS_ALLOWED_ORIGIN_PATTERNS="https://app.chuanphat.vn"

# 2. Test + Build
./mvnw test
./mvnw clean package

# 3. Chạy
java -jar target/warranty-service-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend

# Không bao giờ upload node_modules hay .next lên server
rm -rf node_modules .next

# Cài dependencies sạch (dùng npm ci thay vì npm install)
npm ci

# Kiểm tra trước khi build
npm run typecheck
npm run lint

# Build production
npm run build

# Chạy production server
npm run start
```

---

## Cách Deploy (VPS/Linux)

### Chuẩn bị server

```bash
# Cài Java 17
sudo apt update && sudo apt install -y openjdk-17-jdk

# Cài Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Cài PostgreSQL 14+
sudo apt install -y postgresql postgresql-contrib

# Cài PM2 để quản lý tiến trình
npm install -g pm2
```

### Deploy lên server

**Chỉ upload source code. KHÔNG upload:**
- `frontend/node_modules/`
- `frontend/.next/`
- `target/`
- `.runtime/`
- `*.log`
- `.env*`

```bash
# Trên server — ví dụ deploy tại /app/chuanphat
cd /app/chuanphat

# 1. Pull code mới nhất
git pull origin main

# 2. Backend
./mvnw clean package -DskipTests
pm2 restart backend || pm2 start "java -jar target/warranty-service-0.0.1-SNAPSHOT.jar" \
  --name backend \
  --env SPRING_PROFILES_ACTIVE=prod

# 3. Frontend
cd frontend
rm -rf node_modules .next
npm ci
npm run build
pm2 restart frontend || pm2 start "npm run start" --name frontend

# 4. Lưu PM2 config
pm2 save
pm2 startup
```

### Cấu hình Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/chuanphat
server {
    listen 80;
    server_name app.chuanphat.vn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name app.chuanphat.vn;

    ssl_certificate /etc/letsencrypt/live/app.chuanphat.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.chuanphat.vn/privkey.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Tài Khoản Demo (Chỉ Profile Dev)

> ⚠️ **Tài khoản này chỉ tồn tại trong profile `dev`.**  
> **Production TUYỆT ĐỐI KHÔNG seed dữ liệu demo.**

| Username | Password | Role | Chi nhánh |
|----------|----------|------|-----------| 
| `admin` | `Admin@123` | SUPER_ADMIN | Tất cả |
| `manager1` | `Demo@123` | BRANCH_MANAGER | Chi nhánh 1 |
| `sales1` | `Demo@123` | SALES_STAFF | Chi nhánh 1 |
| `warehouse1` | `Demo@123` | WAREHOUSE_STAFF | Chi nhánh 1 |
| `accountant1` | `Demo@123` | ACCOUNTANT | Chi nhánh 1 |
| `technician1` | `Demo@123` | TECHNICIAN | Chi nhánh 1 |
| `sales2` | `Demo@123` | SALES_STAFF | Chi nhánh 2 |

---

## Xác Thực API

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin@123",
  "rememberMe": true
}
```

Response trả về `accessToken`, `refreshToken` và thông tin user.

```http
Authorization: Bearer <accessToken>
```

---

## Các API Chính

### Xác thực
- `POST /api/auth/login` — Đăng nhập
- `POST /api/auth/refresh` — Làm mới token
- `POST /api/auth/logout` — Đăng xuất
- `GET /api/auth/me` — Thông tin user hiện tại

### Nghiệp vụ
- **Chi nhánh:** `/api/branches`
- **Sản phẩm & Serial:** `/api/products`, `/api/products/serials`
- **Kho:** `/api/inventory/stocks`, `/api/inventory/import`, `/api/inventory/export`
- **Bán hàng:** `/api/sales/orders`, `/api/sales/quotations`, `/api/sales/returns`
- **Đặt cọc:** `/api/sales/deposits`
- **Nhà cung cấp:** `/api/suppliers`, `/api/suppliers/purchase-orders`
- **Bảo hành:** `/api/warranties`, `/api/service-tickets`
- **Kế toán:** `/api/accounting/journal-entries`, `/api/accounting/periods`
- **Báo cáo:** `/api/reports/*`
- **Nhân sự:** `/api/hr/employees`, `/api/hr/attendance`, `/api/hr/payroll`
- **Marketing:** `/api/marketing/vouchers`, `/api/marketing/campaigns`
- **Audit Log:** `/api/audit-logs`

---

## Checklist Build & Kiểm Tra

```bash
# Backend
./mvnw test
./mvnw clean package

# Frontend
cd frontend
npm run typecheck
npm run lint
npm run build
```

---

## Backup Database

```bash
# Backup
pg_dump -U chuanphat_user -h localhost chuanphat > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U chuanphat_user -h localhost chuanphat < backup_file.sql
```

Scripts tự động: `scripts/backup-postgres.sh`, `scripts/restore-postgres.sh`

---

## Phân Quyền Quan Trọng

| Permission | Mô tả |
|-----------|-------|
| `VIEW_COST_PRICE` | Xem giá vốn |
| `VIEW_PROFIT` | Xem lợi nhuận |
| `APPROVE_DISCOUNT` | Duyệt giảm giá vượt hạn mức |
| `LOCK_ACCOUNTING_PERIOD` | Khóa kỳ kế toán |
| `VIEW_ALL_BRANCHES` | Xem tất cả chi nhánh |
| `EXPORT_REPORT` | Xuất báo cáo |
| `VIEW_AUDIT_LOG` | Xem audit log |
| `APPROVE_STOCK_ADJUSTMENT` | Duyệt điều chỉnh kho |
