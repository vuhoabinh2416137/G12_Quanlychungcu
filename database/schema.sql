-- Create database (Náº¿u chÆ°a cÃ³)
-- Xóa database cũ nếu tồn tại để tạo lại với đúng encoding
DROP DATABASE IF EXISTS bluemoon;
CREATE DATABASE bluemoon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bluemoon;

-- 1. Users table (Tài khoản người dùng/Ban quản lý)
CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50) UNIQUE NOT NULL,
    password   VARCHAR(255)       NOT NULL,
    role       VARCHAR(20)        NOT NULL, -- ADMIN, CASHIER, MAINTENANCE, RESIDENT
    full_name  VARCHAR(100)       NOT NULL,
    email      VARCHAR(100) UNIQUE,
    phone      VARCHAR(20),
    active     BOOLEAN   DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Apartments table (Căn hộ)
CREATE TABLE IF NOT EXISTS apartments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_number VARCHAR(20) UNIQUE NOT NULL,
    building         VARCHAR(50),
    floor            VARCHAR(10),
    area             DECIMAL(10, 2),
    balance          DECIMAL(15, 2) DEFAULT 0.0,
    so_dien_tieu_thu DECIMAL(10, 2) DEFAULT 0,
    so_nuoc_tieu_thu DECIMAL(10, 2) DEFAULT 0,
    status           VARCHAR(20) DEFAULT 'VACANT' -- VACANT, OCCUPIED
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Residents table (Cư dân/Nhân khẩu)
CREATE TABLE IF NOT EXISTS residents (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id  BIGINT,
    full_name     VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender        VARCHAR(10),
    id_card       VARCHAR(20) UNIQUE,
    phone         VARCHAR(20),
    email         VARCHAR(100),
    relationship  VARCHAR(50), -- CHU_HO, VO_CHONG, CON_CAI, KHACH_THUE
    FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE SET NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Vehicles table (Phương tiện ra vào)
CREATE TABLE IF NOT EXISTS vehicles (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id  BIGINT,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    type          VARCHAR(50), -- O_TO, XE_MAY, XE_DAP_DIEN
    color         VARCHAR(50),
    FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Fees table (Các khoản phí)
CREATE TABLE IF NOT EXISTS fees (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT,
    name         VARCHAR(100)   NOT NULL,
    description  TEXT,
    amount       DECIMAL(15, 2) NOT NULL,
    type         VARCHAR(50), -- DIEN, NUOC, QUAN_LY, GUI_XE
    due_date     DATE,
    paid         BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payments table (Lịch sử thanh toán)
CREATE TABLE IF NOT EXISTS payments (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    fee_id       BIGINT,
    amount       DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method       VARCHAR(50), -- TIEN_MAT, CHUYEN_KHOAN, MOMO
    status       VARCHAR(20) DEFAULT 'COMPLETED', -- PENDING, COMPLETED, REJECTED
    note         TEXT,
    FOREIGN KEY (fee_id) REFERENCES fees (id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications table (Thông báo)
CREATE TABLE IF NOT EXISTS notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id    BIGINT,
    apartment_id BIGINT       NULL, -- Nếu NULL nghĩa là thông báo chung cho toàn chung cư
    title        VARCHAR(200) NOT NULL,
    content      TEXT         NOT NULL,
    type         VARCHAR(50),       -- NHAC_NHO, THONG_BAO_CHUNG, CANH_BAO
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Incidents table (Phản ánh sự cố kỹ thuật)
CREATE TABLE IF NOT EXISTS incidents (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT,
    title        VARCHAR(200) NOT NULL,
    description  TEXT         NOT NULL,
    status       VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, RESOLVED
    created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments (id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System Config table (Cấu hình hệ thống)
CREATE TABLE IF NOT EXISTS system_config (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key   VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description  VARCHAR(255)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default fee configs
INSERT IGNORE INTO system_config (config_key, config_value, description) VALUES
('fee.management_per_sqm', '10000', 'Đơn giá phí quản lý (VNĐ/m²)'),
('fee.motorbike', '150000', 'Đơn giá gửi xe máy (VNĐ/xe/tháng)'),
('fee.car', '1000000', 'Đơn giá gửi ô tô (VNĐ/xe/tháng)'),
('fee.electricity_per_kwh', '3500', 'Đơn giá điện (VNĐ/kWh)'),
('fee.water_per_m3', '15000', 'Đơn giá nước (VNĐ/m³)'),
('fee.due_day_of_month', '15', 'Ngày hạn nộp hàng tháng');
