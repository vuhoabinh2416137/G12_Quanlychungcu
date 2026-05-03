# BlueMoon - Basic Starter Edition

## 📋 Tổng Quan
Đây là phiên bản cơ bản/starter của hệ thống quản lý chung cư BlueMoon.
Chỉ bao gồm những module cơ bản: Căn hộ và Cư dân.

## 🚀 Bắt Đầu Nhanh

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven

### Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd bluemoon-basic

# 2. Build Docker
docker compose build

# 3. Run services
docker compose up -d

# 4. Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
```

## 📁 Cấu Trúc Dự Án

```
bluemoon-basic/
├── backend/
│   ├── src/main/java/com/bluemoon/
│   │   ├── BluemoonApplication.java
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   └── config/
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   └── schema.sql
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🛠️ Công Nghệ Sử Dụng

### Backend
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database / MySQL
- Java 17

### Frontend
- React 18.2.0
- React Router 6
- Axios
- Tailwind CSS

## 📝 API Endpoints

### Apartments
- `GET /api/apartments` - Lấy tất cả căn hộ
- `GET /api/apartments/{id}` - Lấy thông tin căn hộ
- `POST /api/apartments` - Tạo căn hộ mới
- `PUT /api/apartments/{id}` - Cập nhật căn hộ
- `DELETE /api/apartments/{id}` - Xóa căn hộ

### Residents
- `GET /api/residents` - Lấy tất cả cư dân
- `GET /api/residents/{id}` - Lấy thông tin cư dân
- `POST /api/residents` - Tạo cư dân mới
- `PUT /api/residents/{id}` - Cập nhật cư dân
- `DELETE /api/residents/{id}` - Xóa cư dân

## 🔧 Phát Triển

### Backend Development
```bash
cd backend
mvn clean package
mvn spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## 📦 Deployment

Sử dụng Docker Compose để deploy toàn bộ ứng dụng:

```bash
docker compose build
docker compose up
```

## 👥 Contributors

BlueMoon Team

## 📄 License

MIT License
