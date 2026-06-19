# 🏢 BlueMoon – Phần mềm Quản lý Chung cư

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green?logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Hệ thống quản lý chung cư toàn diện, hỗ trợ Ban quản trị, Cư dân và Thủ quỹ trong việc quản lý thông tin dân cư, thu phí dịch vụ, gửi thông báo và xuất hóa đơn.

---

## 📋 Mục lục

- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [API Documentation](#-api-documentation)
- [Đội ngũ phát triển](#-đội-ngũ-phát-triển)
- [Lộ trình phát triển](#-lộ-trình-phát-triển)

---

## ✨ Tính năng chính

### Phiên bản 1.0
- **Quản lý cư dân & căn hộ** – Lưu trữ, tìm kiếm, cập nhật thông tin nhân khẩu và hộ gia đình
- **Quản lý khoản thu & thu phí dịch vụ** – Tự động tính phí theo diện tích, quản lý phí bắt buộc và tự nguyện
- **Quản lý thanh toán & thu ngân** – Ghi nhận thanh toán và quy trình duyệt hóa đơn dành cho Thủ quỹ
- **Thông báo & Ý kiến đóng góp** – Gửi thông báo đa luồng đến cư dân, hỗ trợ gửi và phản hồi ý kiến đóng góp, báo cáo sự cố
- **Phân quyền người dùng** – Phân quyền riêng biệt cho Ban quản trị, Thủ quỹ và Cư dân
- **Tra cứu & Tìm kiếm** – Tìm nhanh theo số căn hộ, tên cư dân, trạng thái đóng phí
- **Cấu hình hệ thống** – Ban quản lý có thể điều chỉnh linh hoạt các tham số chung của toà nhà
- **Giao diện hiện đại (Modern UI/UX)** – Nâng cấp trải nghiệm người dùng với thiết kế trực quan, hiệu ứng mượt mà và thân thiện

### Phiên bản 2.0 (Roadmap)
- Hỗ trợ đa chung cư trên cùng hệ thống
- Quản lý dịch vụ điện, nước, internet
- Quản lý phương tiện di chuyển (biển số xe, hầm gửi xe)

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────┐        ┌─────────────────────┐
│     Frontend        │  HTTP  │      Backend        │
│    Vite             │◄──────►│  Maven              │
│    React.js 18      │  REST  │  Spring Boot 3.x    │
│    Tailwind CSS     │        │  Spring Security    │
│                     │        │  Spring Data JPA    │
└─────────────────────┘        └──────────┬──────────┘
                                          │
                               ┌──────────▼──────────┐
                               │      Database       │
                               │     MySQL 8.0       │
                               │  (AIVEN Cloud)      │
                               └─────────────────────┘
```

**Xác thực:** JWT (JSON Web Token)  
**Hạ tầng:** AIVEN (Cloud Database)  
**CI/CD:** GitHub Actions

---

## 📁 Cấu trúc thư mục

```
bluemoon/
│
├── 📄 README.md
├── 📄 .gitignore
├── 📄 docker-compose.yml          # (tuỳ chọn) chạy local với Docker
├── 📄 run-all.bat                 # Script chạy nhanh dự án (Docker DB, Backend, Frontend)
│
├── 📁 frontend/                   # React.js Application
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instances & API calls
│   │   ├── assets/                # Hình ảnh, icon, font
│   │   ├── components/            # UI Components dùng chung
│   │   │   ├── common/            # Button, Modal, Table, Input...
│   │   │   ├── layout/            # Sidebar, Header, Footer
│   │   │   ├── payment/           # Component thanh toán
│   │   │   └── charts/            # Biểu đồ thống kê
│   │   ├── pages/                 # Các trang chính
│   │   │   ├── auth/              # Đăng nhập, Đổi mật khẩu
│   │   │   ├── dashboard/         # Trang tổng quan
│   │   │   ├── residents/         # Quản lý cư dân & căn hộ
│   │   │   ├── fees/              # Quản lý khoản thu & phí
│   │   │   ├── payments/          # Lịch sử thanh toán
│   │   │   ├── notifications/     # Thông báo
│   │   │   ├── feedback/          # Ý kiến đóng góp
│   │   │   ├── users/             # Quản lý tài khoản
│   │   │   ├── cashier/           # Duyệt thanh toán
│   │   │   └── profile/           # Thông tin cá nhân
│   │   ├── hooks/                 # Custom React Hooks
│   │   ├── store/                 # State management (Redux / Zustand)
│   │   ├── routes/                # React Router config & PrivateRoute
│   │   ├── utils/                 # Helper functions
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── 📁 backend/                    # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bluemoon/
│   │   │   │   ├── config/        # CORS, Database Seed config
│   │   │   │   ├── security/      # Security, JWT config
│   │   │   │   ├── controller/    # REST Controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── ResidentController.java
│   │   │   │   │   ├── ApartmentController.java
│   │   │   │   │   ├── FeeController.java
│   │   │   │   │   ├── PaymentController.java
│   │   │   │   │   ├── CashierController.java
│   │   │   │   │   ├── NotificationController.java
│   │   │   │   │   ├── FeedbackController.java
│   │   │   │   │   ├── IncidentController.java
│   │   │   │   │   ├── SystemConfigController.java
│   │   │   │   │   └── UserController.java
│   │   │   │   ├── service/       # Business Logic
│   │   │   │   ├── repository/    # Spring Data JPA Repositories
│   │   │   │   ├── model/         # JPA Entity classes
│   │   │   │   │   ├── User.java, Resident.java, Apartment.java...
│   │   │   │   │   └── enums/     # Enum classes (PaymentStatus, FeeType...)
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   │   └── mapper/    # DTO Mappers
│   │   │   │   ├── exception/     # Custom exceptions & GlobalExceptionHandler
│   │   │   │   ├── scheduler/     # Scheduled tasks (FeeScheduler)
│   │   │   │   └── util/          # JWT Util, helpers...
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── schema.sql
│   ├── pom.xml
│
├── 📁 database/
│   ├── schema.sql                 # DDL – Tạo bảng
│   └── seed.sql                   # Dữ liệu mẫu
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu hệ thống
- **Docker Desktop** (Để chạy cơ sở dữ liệu)
- **Java (JDK) 17+**
- **Node.js 18+**
*(Lưu ý: Dự án đã tích hợp sẵn Maven Wrapper nên không cần cài đặt cấu hình Maven global)*

### 1-Click Cài đặt cực nhanh (Windows)

Thay vì phải chạy thủ công từng phần, dự án đã cung cấp sẵn script `run-all.bat` giúp bạn chạy ứng dụng cực kì nhanh gọn. Script này sẽ tự động:
1. Bật **Docker Desktop** (Nếu chưa bật) và khởi tạo MySQL kèm dữ liệu mẫu.
2. Mở một cửa sổ mới chạy **Spring Boot Backend**.
3. Mở một cửa sổ mới tự động tải thư viện (npm install) và khởi chạy **React Frontend**.

**Bước 1: Clone repository về máy**
```bash
git clone https://github.com/vuhoabinh2416137/G12_Quanlychungcu.git
cd G12_Quanlychungcu
```

**Bước 2: Click đúp vào file hoặc chạy lệnh sau**
```cmd
.\run-all.bat
```

🎉 **Vậy là xong! Bạn hãy đợi một chút cho Backend và Frontend khởi động, sau đó truy cập hệ thống tại: `http://localhost:5173`.**

<details>
<summary><b>(Tùy chọn) Chạy thủ công trên Linux / macOS hoặc không dùng run-all.bat</b></summary>

Nếu bạn không sử dụng Windows hoặc muốn chạy từng thành phần độc lập:

**1. Khởi chạy Database bằng Docker:**
```bash
docker-compose up -d
```

**2. Chạy Backend:**
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```
*(Backend khởi động tại: `http://localhost:8080`)*

**3. Chạy Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*(Frontend khởi động tại: `http://localhost:5173`)*
</details>

---

## 📡 API Documentation

Sau khi chạy backend, truy cập Swagger UI tại:

```
http://localhost:8080/swagger-ui/index.html
```

### Các nhóm API chính

| Module | Endpoint prefix | Mô tả |
|--------|----------------|-------|
| Auth | `/api/auth` | Đăng nhập, đăng ký, refresh token |
| Residents | `/api/residents` | Quản lý nhân khẩu |
| Apartments | `/api/apartments` | Quản lý căn hộ |
| Fees | `/api/fees` | Quản lý khoản thu, phí dịch vụ |
| Payments | `/api/payments` | Ghi nhận & theo dõi thanh toán |
| Cashier | `/api/cashier` | Quản lý & duyệt thanh toán (Thủ quỹ) |
| Notifications | `/api/notifications` | Gửi & quản lý thông báo |
| Feedbacks | `/api/feedbacks` | Gửi & trả lời ý kiến đóng góp |
| Incidents | `/api/incidents` | Báo cáo & quản lý sự cố chung cư |
| System Config | `/api/system-config` | Cấu hình tham số hệ thống chung |
| Users | `/api/users` | Quản lý tài khoản & phân quyền |

---

## 🧪 Kiểm thử

```bash
# Chạy toàn bộ unit test (Backend)
cd backend
./mvnw test

# (Frontend hiện sử dụng Vite, cấu hình test đang được cập nhật)
```

---

## 👥 Đội ngũ phát triển

| Thành viên | Vai trò |
|-----------|--------|
| Vũ Hòa Bình | Trưởng nhóm (PM) |
| Lý Công Hiếu | Developer |
| Đỗ Duy Đức | Developer |
| Hoàng Công Đức | Developer |
| Phạm Duy Nguyên Lâm | Developer |

**Giảng viên hướng dẫn:** Thầy Nguyễn Mạnh Tuấn  
**Môn học:** IT3180

---

## 🗓 Lộ trình phát triển

| Mốc | Ngày | Nội dung |
|-----|------|---------|
| Khởi động | 05/03/2026 | Bắt đầu dự án |
| Sprint 1 | 05/03 – 20/03/2026 | Auth, Quản lý tài khoản |
| Sprint 2 | 20/03 – 05/04/2026 | Quản lý cư dân, căn hộ |
| Sprint 3 | 05/04 – 20/04/2026 | Phí, hóa đơn, thông báo |
| **v1.0** | **20/04/2026** | **Bàn giao phiên bản 1.0** |
| Sprint 4-5 | 20/04 – 15/05/2026 | Tính năng v2.0 |
| **v2.0** | **15/05/2026** | **Bàn giao phiên bản 2.0** |

---

## 📄 Giấy phép

Dự án được phát triển cho mục đích học thuật trong khuôn khổ môn học IT3180 – Trường Đại học Bách khoa Hà Nội.
