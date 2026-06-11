USE bluemoon;

SET NAMES utf8mb4;

-- Seed demo data for testing (20-30 entries per table)

-- APARTMENTS (25 entries)
INSERT IGNORE INTO apartments (id, apartment_number, building, floor, area, status) VALUES
  (1, 'A101', 'A', '1', 75.50, 'OCCUPIED'),
  (2, 'A102', 'A', '1', 80.00, 'OCCUPIED'),
  (3, 'A103', 'A', '1', 75.50, 'VACANT'),
  (4, 'A201', 'A', '2', 90.00, 'OCCUPIED'),
  (5, 'A202', 'A', '2', 92.50, 'OCCUPIED'),
  (6, 'A203', 'A', '2', 90.00, 'VACANT'),
  (7, 'B101', 'B', '1', 85.00, 'OCCUPIED'),
  (8, 'B102', 'B', '1', 85.00, 'OCCUPIED'),
  (9, 'B103', 'B', '1', 85.00, 'VACANT'),
  (10, 'B201', 'B', '2', 95.00, 'OCCUPIED'),
  (11, 'B202', 'B', '2', 95.00, 'OCCUPIED'),
  (12, 'B203', 'B', '2', 95.00, 'VACANT'),
  (13, 'B301', 'B', '3', 100.00, 'OCCUPIED'),
  (14, 'B302', 'B', '3', 100.00, 'VACANT'),
  (15, 'C101', 'C', '1', 110.00, 'OCCUPIED'),
  (16, 'C102', 'C', '1', 110.00, 'OCCUPIED'),
  (17, 'C201', 'C', '2', 120.00, 'OCCUPIED'),
  (18, 'C202', 'C', '2', 120.00, 'VACANT'),
  (19, 'C301', 'C', '3', 130.00, 'OCCUPIED'),
  (20, 'C302', 'C', '3', 130.00, 'VACANT'),
  (21, 'D101', 'D', '1', 75.00, 'OCCUPIED'),
  (22, 'D102', 'D', '1', 75.00, 'OCCUPIED'),
  (23, 'D201', 'D', '2', 88.00, 'VACANT'),
  (24, 'D202', 'D', '2', 88.00, 'OCCUPIED'),
  (25, 'D301', 'D', '3', 105.00, 'OCCUPIED');

-- RESIDENTS (30 entries)
INSERT IGNORE INTO residents (id, apartment_id, full_name, date_of_birth, gender, id_card, phone, email, relationship) VALUES
  (1, 1, 'Nguyễn Trọng Tài', '1985-10-20', 'Nam', '012345678901', '0905123456', 'trongtai@example.com', 'CHU_HO'),
  (2, 1, 'Trần Bích Ngọc', '1988-05-15', 'Nữ', '012345678902', '0905123457', 'bichngoc@example.com', 'VO_CHONG'),
  (3, 1, 'Nguyễn Trọng Tuấn', '2010-03-10', 'Nam', '012345678903', '0905123458', 'trongtuan@example.com', 'CON_CAI'),
  (4, 2, 'Lê Thị Thanh Hương', '1990-01-01', 'Nữ', '012345678904', '0905123459', 'thanhhuong@example.com', 'CHU_HO'),
  (5, 2, 'Phạm Anh Đức', '1992-07-20', 'Nam', '012345678905', '0905123460', 'anhduc@example.com', 'VO_CHONG'),
  (6, 3, 'Hoàng Quốc Cường', '1988-12-15', 'Nam', '012345678906', '0905123461', 'quoccuong@example.com', 'CHU_HO'),
  (7, 4, 'Bùi Thị Thu Ngân', '1995-04-25', 'Nữ', '012345678907', '0905123462', 'thungan@example.com', 'CHU_HO'),
  (8, 4, 'Trương Minh Đạt', '1993-08-10', 'Nam', '012345678908', '0905123463', 'minhdat@example.com', 'VO_CHONG'),
  (9, 5, 'Vũ Thu Hiền', '1998-02-14', 'Nữ', '012345678909', '0905123464', 'thuhien@example.com', 'CHU_HO'),
  (10, 6, 'Dương Trọng Nghĩa', '1986-06-30', 'Nam', '012345678910', '0905123465', 'trongnghia@example.com', 'CHU_HO'),
  (11, 7, 'Đặng Mai Phương', '1991-11-05', 'Nữ', '012345678911', '0905123466', 'maiphuong@example.com', 'CHU_HO'),
  (12, 7, 'Võ Tuấn Anh', '1989-09-18', 'Nam', '012345678912', '0905123467', 'tuananh@example.com', 'VO_CHONG'),
  (13, 8, 'Phan Bích Trâm', '1996-03-22', 'Nữ', '012345678913', '0905123468', 'bichtram@example.com', 'CHU_HO'),
  (14, 9, 'Tô Hải Đăng', '1987-10-08', 'Nam', '012345678914', '0905123469', 'haidang@example.com', 'CHU_HO'),
  (15, 10, 'Cao Quỳnh Như', '1994-05-12', 'Nữ', '012345678915', '0905123470', 'quynhnhu@example.com', 'CHU_HO'),
  (16, 10, 'Lý Bảo Phúc', '1992-01-28', 'Nam', '012345678916', '0905123471', 'baophuc@example.com', 'VO_CHONG'),
  (17, 11, 'Lương Mỹ Linh', '1999-07-15', 'Nữ', '012345678917', '0905123472', 'mylinh@example.com', 'CHU_HO'),
  (18, 12, 'Diệp Hùng Cường', '1985-12-03', 'Nam', '012345678918', '0905123473', 'hungcuong@example.com', 'CHU_HO'),
  (19, 13, 'Giang Hà Thu', '1993-04-17', 'Nữ', '012345678919', '0905123474', 'hathu@example.com', 'CHU_HO'),
  (20, 13, 'Hồ Tiến Dũng', '1991-08-24', 'Nam', '012345678920', '0905123475', 'tiendung@example.com', 'VO_CHONG'),
  (21, 14, 'Đinh Diệu Ly', '1997-02-09', 'Nữ', '012345678921', '0905123476', 'dieuly@example.com', 'CHU_HO'),
  (22, 15, 'Tạ Tấn Phát', '1986-09-11', 'Nam', '012345678922', '0905123477', 'tanphat@example.com', 'CHU_HO'),
  (23, 16, 'Ngô Ái Vi', '1989-06-19', 'Nữ', '012345678923', '0905123478', 'aivi@example.com', 'CHU_HO'),
  (24, 17, 'Đỗ Minh Khang', '1994-11-07', 'Nam', '012345678924', '0905123479', 'minhkhang@example.com', 'CHU_HO'),
  (25, 18, 'Đoàn Yến Nhi', '1990-05-22', 'Nữ', '012345678925', '0905123480', 'yennhi@example.com', 'CHU_HO'),
  (26, 19, 'Bùi Gia Huy', '1988-10-14', 'Nam', '012345678926', '0905123481', 'giahuy@example.com', 'CHU_HO'),
  (27, 20, 'Vương Thu Uyên', '1995-03-26', 'Nữ', '012345678927', '0905123482', 'thuuyen@example.com', 'CHU_HO'),
  (28, 21, 'Lê Văn Hậu', '1992-07-13', 'Nam', '012345678928', '0905123483', 'vanhau@example.com', 'CHU_HO'),
  (29, 22, 'Phạm Thúy Hạnh', '1987-12-31', 'Nữ', '012345678929', '0905123484', 'thuyhanh@example.com', 'CHU_HO'),
  (30, 24, 'Đỗ Thanh Hùng', '1993-02-16', 'Nam', '012345678930', '0905123485', 'thanhhung@example.com', 'CHU_HO');

-- VEHICLES (20 entries)
INSERT IGNORE INTO vehicles (id, apartment_id, license_plate, type, color) VALUES
  (1, 1, '51A-12345', 'O_TO', 'Đen'),
  (2, 1, '51B-98765', 'XE_MAY', 'Đỏ'),
  (3, 2, '51C-11111', 'O_TO', 'Trắng'),
  (4, 4, '51D-22222', 'O_TO', 'Xám'),
  (5, 4, '51E-33333', 'XE_MAY', 'Xanh'),
  (6, 5, '51F-44444', 'XE_DAP_DIEN', 'Xanh nhạt'),
  (7, 7, '51G-55555', 'O_TO', 'Bạc'),
  (8, 8, '51H-66666', 'XE_MAY', 'Vàng'),
  (9, 10, '51K-77777', 'O_TO', 'Đen'),
  (10, 11, '51L-88888', 'XE_MAY', 'Đỏ'),
  (11, 13, '51M-99999', 'XE_DAP_DIEN', 'Xanh'),
  (12, 15, '51N-10101', 'O_TO', 'Trắng'),
  (13, 16, '51P-20202', 'XE_MAY', 'Xám'),
  (14, 17, '51Q-30303', 'O_TO', 'Xám'),
  (15, 19, '51R-40404', 'XE_DAP_DIEN', 'Đỏ'),
  (16, 21, '51S-50505', 'O_TO', 'Trắng'),
  (17, 22, '51T-60606', 'XE_MAY', 'Xanh'),
  (18, 24, '51U-70707', 'O_TO', 'Bạc'),
  (19, 25, '51V-80808', 'XE_MAY', 'Đen'),
  (20, 2, '51W-90909', 'XE_DAP_DIEN', 'Vàng');

-- INVOICES (15 entries)
INSERT IGNORE INTO invoices (id, apartment_id, invoice_number, total_amount, status, issued_date) VALUES
  (1, 1, 'INV-2026-0001', 1000000, 'UNPAID', NOW()),
  (2, 2, 'INV-2026-0002', 1080000, 'PAID', NOW()),
  (3, 4, 'INV-2026-0003', 800000, 'UNPAID', NOW()),
  (4, 5, 'INV-2026-0004', 650000, 'UNPAID', NOW()),
  (5, 7, 'INV-2026-0005', 650000, 'PAID', NOW()),
  (6, 8, 'INV-2026-0006', 550000, 'UNPAID', NOW()),
  (7, 10, 'INV-2026-0007', 800000, 'UNPAID', NOW()),
  (8, 11, 'INV-2026-0008', 650000, 'UNPAID', NOW()),
  (9, 13, 'INV-2026-0009', 700000, 'PAID', NOW()),
  (10, 15, 'INV-2026-0010', 950000, 'PAID', NOW()),
  (11, 16, 'INV-2026-0011', 750000, 'PAID', NOW()),
  (12, 17, 'INV-2026-0012', 800000, 'UNPAID', NOW()),
  (13, 19, 'INV-2026-0013', 850000, 'PAID', NOW()),
  (14, 21, 'INV-2026-0014', 500000, 'UNPAID', NOW()),
  (15, 22, 'INV-2026-0015', 500000, 'PAID', NOW()),
  (16, 24, 'INV-2026-0016', 600000, 'UNPAID', NOW()),
  (17, 25, 'INV-2026-0017', 700000, 'PAID', NOW());

-- FEES (25 entries - tháng 05/2026)
INSERT IGNORE INTO fees (id, invoice_id, apartment_id, name, description, amount, type, due_date, paid) VALUES
  (1, 1, 1, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 500000, 'QUAN_LY', '2026-05-15', FALSE),
  (2, 1, 1, 'Phí điện tháng 05/2026', 'Tiêu thụ điện', 350000, 'DIEN', '2026-05-15', FALSE),
  (20, 1, 1, 'Phí gửi xe tháng 05/2026', 'Gửi xe', 150000, 'GUI_XE', '2026-05-15', FALSE),

  (3, 2, 2, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 650000, 'QUAN_LY', '2026-05-15', TRUE),
  (4, 2, 2, 'Phí nước tháng 05/2026', 'Tiêu thụ nước', 280000, 'NUOC', '2026-05-15', TRUE),
  (21, 2, 2, 'Phí gửi xe tháng 05/2026', 'Gửi xe', 150000, 'GUI_XE', '2026-05-15', TRUE),

  (5, 3, 4, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 650000, 'QUAN_LY', '2026-05-15', FALSE),
  (22, 3, 4, 'Phí gửi xe tháng 05/2026', 'Gửi xe', 150000, 'GUI_XE', '2026-05-15', FALSE),

  (6, 4, 5, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 650000, 'QUAN_LY', '2026-05-15', FALSE),

  (7, 5, 7, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 550000, 'QUAN_LY', '2026-05-15', TRUE),
  (23, 5, 7, 'Phí gửi xe tháng 05/2026', 'Gửi xe', 100000, 'GUI_XE', '2026-05-15', TRUE),

  (8, 6, 8, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 550000, 'QUAN_LY', '2026-05-15', FALSE),

  (9, 7, 10, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 650000, 'QUAN_LY', '2026-05-15', FALSE),
  (24, 7, 10, 'Phí gửi xe tháng 05/2026', 'Gửi xe', 150000, 'GUI_XE', '2026-05-15', FALSE),

  (10, 8, 11, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 650000, 'QUAN_LY', '2026-05-15', FALSE),

  (11, 9, 13, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 700000, 'QUAN_LY', '2026-05-15', TRUE),

  (12, 10, 15, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 750000, 'QUAN_LY', '2026-05-15', TRUE),
  (25, 10, 15, 'Phí gửi xe tháng 05/2026', 'Gửi xe', 200000, 'GUI_XE', '2026-05-15', TRUE),

  (13, 11, 16, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 750000, 'QUAN_LY', '2026-05-15', TRUE),

  (14, 12, 17, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 800000, 'QUAN_LY', '2026-05-15', FALSE),

  (15, 13, 19, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 850000, 'QUAN_LY', '2026-05-15', TRUE),

  (16, 14, 21, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 500000, 'QUAN_LY', '2026-05-15', FALSE),

  (17, 15, 22, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 500000, 'QUAN_LY', '2026-05-15', TRUE),

  (18, 16, 24, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 600000, 'QUAN_LY', '2026-05-15', FALSE),

  (19, 17, 25, 'Phí quản lý tháng 05/2026', 'Quản lý chung cư', 700000, 'QUAN_LY', '2026-05-15', TRUE);

-- PAYMENTS (20 entries - thanh toán phí)
INSERT IGNORE INTO payments (id, fee_id, amount, payment_date, method, note) VALUES
  (1, 2, 350000, '2026-05-03', 'CHUYEN_KHOAN', 'Thanh toán online'),
  (2, 4, 280000, '2026-05-05', 'TIEN_MAT', 'Thanh toán tại quầy'),
  (3, 5, 650000, '2026-05-02', 'MOMO', 'Thanh toán qua ứng dụng'),
  (4, 7, 550000, '2026-05-04', 'CHUYEN_KHOAN', 'Chuyển khoản'),
  (5, 9, 650000, '2026-05-06', 'TIEN_MAT', 'Thanh toán trực tiếp'),
  (6, 11, 700000, '2026-05-01', 'CHUYEN_KHOAN', 'Chuyển khoản'),
  (7, 13, 750000, '2026-05-03', 'MOMO', 'Thanh toán MoMo'),
  (8, 15, 850000, '2026-05-05', 'CHUYEN_KHOAN', 'Chuyển khoản tự động'),
  (9, 17, 500000, '2026-05-02', 'TIEN_MAT', 'Tiền mặt'),
  (10, 19, 700000, '2026-05-04', 'CHUYEN_KHOAN', 'Thanh toán định kỳ'),
  (11, 21, 150000, '2026-05-01', 'MOMO', 'Phí gửi xe'),
  (12, 22, 150000, '2026-05-02', 'CHUYEN_KHOAN', 'Phí gửi xe'),
  (13, 23, 150000, '2026-05-03', 'TIEN_MAT', 'Phí gửi xe'),
  (14, 24, 100000, '2026-05-04', 'MOMO', 'Phí gửi xe'),
  (15, 25, 200000, '2026-05-05', 'CHUYEN_KHOAN', 'Phí gửi xe'),
  (16, 3, 650000, '2026-05-02', 'TIEN_MAT', 'Quản lý tháng 5'),
  (17, 6, 650000, '2026-05-04', 'CHUYEN_KHOAN', 'Quản lý tháng 5'),
  (18, 8, 550000, '2026-05-03', 'MOMO', 'Quản lý tháng 5'),
  (19, 10, 650000, '2026-05-05', 'TIEN_MAT', 'Quản lý tháng 5'),
  (20, 16, 500000, '2026-05-01', 'CHUYEN_KHOAN', 'Quản lý tháng 5');

-- NOTIFICATIONS (20 entries - thông báo)
INSERT IGNORE INTO notifications (id, sender_id, apartment_id, title, content, type, created_at) VALUES
  (1, 1, NULL, 'Thông báo bảo trì hệ thống điện', 'Sẽ tiến hành bảo trì hệ thống điện từ 8h-12h ngày 10/5', 'THONG_BAO_CHUNG', NOW() - INTERVAL 5 DAY),
  (2, 1, NULL, 'Lịch vệ sinh chung cư', 'Vệ sinh sảnh chính vào các ngày thứ 2, thứ 5 hàng tuần', 'THONG_BAO_CHUNG', NOW() - INTERVAL 4 DAY),
  (3, 1, NULL, 'Nhắc nhở thanh toán phí quản lý', 'Vui lòng thanh toán phí quản lý tháng 05 trước ngày 15/5', 'NHAC_NHO', NOW() - INTERVAL 3 DAY),
  (4, 1, 1, 'Sửa chữa đường ống nước', 'Căn hộ A101 cần sửa chữa đường ống nước, vui lòng liên hệ quản lý', 'CANH_BAO', NOW() - INTERVAL 2 DAY),
  (5, 1, 2, 'Thanh toán quá hạn', 'Căn hộ A102 có khoản phí chưa thanh toán, vui lòng thanh toán sớm', 'CANH_BAO', NOW() - INTERVAL 1 DAY),
  (6, 1, NULL, 'Công bố quy định chung cư', 'Cập nhật các quy định mới về quản lý chung cư năm 2026', 'THONG_BAO_CHUNG', NOW()),
  (7, 1, NULL, 'Thông báo hội họp cư dân', 'Hội họp cư dân lần 1/2026 sẽ diễn ra vào 20/5 lúc 19h tại sảnh chính', 'THONG_BAO_CHUNG', NOW() - INTERVAL 6 DAY),
  (8, 1, 4, 'Vấn đề về tiếng ồn', 'Nhận được phản ánh từ cư dân, vui lòng hạn chế tiếng ồn sau 22h', 'CANH_BAO', NOW() - INTERVAL 7 DAY),
  (9, 1, NULL, 'Lịch kiểm tra PCCC', 'Sẽ tiến hành kiểm tra PCCC tòa A vào 25/5', 'THONG_BAO_CHUNG', NOW() - INTERVAL 8 DAY),
  (10, 1, NULL, 'Thanh toán giảm giá', 'Cư dân thanh toán trước hạn được giảm 5% phí quản lý', 'THONG_BAO_CHUNG', NOW() - INTERVAL 9 DAY),
  (11, 1, 7, 'Sư cố đường nước', 'Phát hiện rò rỉ nước ở sân chung cư tòa B, đang được xử lý', 'CANH_BAO', NOW() - INTERVAL 10 DAY),
  (12, 1, NULL, 'Nâng cấp hệ thống an ninh', 'Sẽ lắp đặt camera bổ sung tại các lối vào', 'THONG_BAO_CHUNG', NOW() - INTERVAL 11 DAY),
  (13, 1, NULL, 'Lịch giảm giá thuê xe', 'Tháng 5 giảm giá 10% cho dịch vụ gửi xe', 'THONG_BAO_CHUNG', NOW() - INTERVAL 12 DAY),
  (14, 1, 10, 'Mất điện dự kiến', 'Khu vực tòa B sẽ mất điện vào 15h-17h ngày 8/5 để sửa chữa', 'CANH_BAO', NOW() - INTERVAL 13 DAY),
  (15, 1, NULL, 'Buổi họp Ban quản trị', 'Buổi họp BQT sẽ diễn ra vào 30/5 lúc 14h', 'THONG_BAO_CHUNG', NOW() - INTERVAL 14 DAY),
  (16, 1, 15, 'Thông báo tăng phí', 'Từ tháng 6/2026, phí quản lý sẽ tăng 10% theo quyết định chung cư', 'CANH_BAO', NOW() - INTERVAL 15 DAY),
  (17, 1, NULL, 'Chiến dịch tiết kiệm điện nước', 'Chương trình tiết kiệm năng lượng, cư dân tiết kiệm được hoàn tiền', 'THONG_BAO_CHUNG', NOW() - INTERVAL 16 DAY),
  (18, 1, 20, 'Phục vụ bảo vệ đêm', 'Bảo vệ đêm sẽ tuần tra thêm vào các lối vào chính', 'NHAC_NHO', NOW() - INTERVAL 17 DAY),
  (19, 1, NULL, 'Lịch dọn dẻp chung cư', 'Chương trình dọn dẻp toàn diện sẽ bắt đầu từ tuần sau', 'THONG_BAO_CHUNG', NOW() - INTERVAL 18 DAY),
  (20, 1, NULL, 'Cuộc khảo sát hài lòng', 'Kính mời cư dân tham gia khảo sát hài lòng dịch vụ quản lý', 'NHAC_NHO', NOW() - INTERVAL 19 DAY);

-- INCIDENTS (15 entries - phản ánh sự cố)
INSERT IGNORE INTO incidents (id, apartment_id, title, description, status, created_at) VALUES
  (1, 1, 'Đèn hành lang bị hỏng', 'Đèn hành lang tầng 1 bị hỏng, cần thay thế', 'RESOLVED', NOW() - INTERVAL 5 DAY),
  (2, 2, 'Rò rỉ nước ở bếp', 'Vòi nước ở bếp bị rò rỉ, cần sửa chữa', 'PROCESSING', NOW() - INTERVAL 4 DAY),
  (3, 4, 'Cửa sổ bị hỏng', 'Cửa sổ phòng khách không đóng kín', 'PENDING', NOW() - INTERVAL 3 DAY),
  (4, 5, 'Điều hòa không hoạt động', 'Máy điều hòa không phát lạnh', 'PROCESSING', NOW() - INTERVAL 2 DAY),
  (5, 7, 'Mạng internet yếu', 'Tốc độ internet bị giảm đột ngột', 'RESOLVED', NOW() - INTERVAL 1 DAY),
  (6, 8, 'Ống thoát nước bị tắc', 'Ống thoát nước ở nhà vệ sinh bị tắc', 'PENDING', NOW()),
  (7, 10, 'Sơn tường bong tróc', 'Sơn tường ở phòng ngủ bong tróc', 'PENDING', NOW() - INTERVAL 6 DAY),
  (8, 11, 'Khóa cửa bị kẹt', 'Khóa cửa chính không hoạt động', 'PROCESSING', NOW() - INTERVAL 7 DAY),
  (9, 13, 'Đèn chùm rơi', 'Đèn chùm ở phòng khách bị lỏng', 'RESOLVED', NOW() - INTERVAL 8 DAY),
  (10, 15, 'Nước nóng không có', 'Máy nước nóng bị hỏng hoàn toàn', 'PROCESSING', NOW() - INTERVAL 9 DAY),
  (11, 16, 'Tiếng ồn từ trên', 'Tiếng ồn lớn từ căn hộ trên', 'PENDING', NOW() - INTERVAL 10 DAY),
  (12, 17, 'Tủ lạnh chạy liên tục', 'Tủ lạnh không ngừng chạy', 'RESOLVED', NOW() - INTERVAL 11 DAY),
  (13, 19, 'Rêm cửa hỏng', 'Rêm cửa không cuộn được', 'PENDING', NOW() - INTERVAL 12 DAY),
  (14, 21, 'Nút chuông cửa hỏng', 'Chuông cửa không hoạt động', 'PROCESSING', NOW() - INTERVAL 13 DAY),
  (15, 22, 'Gương phòng tắm vỡ', 'Gương phòng tắm bị nứt', 'RESOLVED', NOW() - INTERVAL 14 DAY);

