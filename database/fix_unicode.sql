USE bluemoon;

SET NAMES utf8mb4;

-- Fix mojibake Vietnamese text caused by importing SQL with a non-UTF8 codepage
UPDATE residents
SET full_name = 'Nguyễn Văn A'
WHERE id = 1;

UPDATE residents
SET full_name = 'Trần Thị B', gender = 'Nữ'
WHERE id = 2;

UPDATE residents
SET full_name = 'Lê Văn C'
WHERE id = 3;

UPDATE fees
SET name = 'Phí quản lý tháng 05/2026'
WHERE id IN (1, 2);

