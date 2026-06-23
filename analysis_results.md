# 📊 Phân Tích Đối Chiếu: Báo Cáo vs Code Thực Tế

## Dự án BlueMoon - Nhóm 12

Tài liệu này so sánh nội dung trong [G12_Report.tex](file:///c:/Users/mrore/G12_Quanlychungcu/G12_Report.tex) với mã nguồn thực tế của dự án. Chia thành 2 phần chính:
- **🔴 Báo cáo ghi nhưng code KHÔNG CÓ / KHÁC BIỆT**
- **🟢 Code CÓ nhưng báo cáo KHÔNG ĐỀ CẬP**

---

## 🔴 PHẦN 1: BÁO CÁO GHI NHƯNG CODE KHÔNG ĐÚNG / KHÔNG CÓ

### 1.1 Bảng Users — Thiếu nhiều trường, sai kiểu dữ liệu

> [!WARNING]
> Báo cáo mô tả bảng `Users` thiếu nhiều trường so với thực tế.

| Mục | Báo cáo (Dòng 880-898) | Code thực tế ([schema.sql](file:///c:/Users/mrore/G12_Quanlychungcu/database/schema.sql), [User.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/User.java)) |
|---|---|---|
| Trường `role` | ENUM `['ADMIN', 'CASHIER', 'RESIDENT']` | VARCHAR(20) — hỗ trợ thêm `MAINTENANCE` (4 vai trò) |
| Trường `full_name` | ❌ **Không đề cập** | ✅ Có (`VARCHAR(100) NOT NULL`) |
| Trường `email` | ❌ **Không đề cập** | ✅ Có (`VARCHAR(100) UNIQUE`) |
| Trường `phone` | ❌ **Không đề cập** | ✅ Có (`VARCHAR(20)`) |
| Trường `active` | ❌ **Không đề cập** | ✅ Có (`BOOLEAN DEFAULT TRUE`) — dùng cho khóa tài khoản |
| Trường `created_at` | ❌ **Không đề cập** | ✅ Có (`TIMESTAMP`) |
| Trường `apartment_id` | ✅ Ghi là FK → `apartments` | ❌ **Code KHÔNG CÓ** — Thay vào đó, liên kết qua bảng `residents.user_id` |

---

### 1.2 Bảng Apartments — Thiếu rất nhiều trường

> [!WARNING]
> Báo cáo mô tả bảng `Apartments` rất thiếu so với thực tế.

| Mục | Báo cáo (Dòng 900-917) | Code thực tế ([schema.sql](file:///c:/Users/mrore/G12_Quanlychungcu/database/schema.sql#L22-L34), [Apartment.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Apartment.java)) |
|---|---|---|
| Status values | `AVAILABLE`, `OCCUPIED` | `VACANT`, `OCCUPIED` (khác nhau: AVAILABLE vs VACANT) |
| Trường `building` | ❌ Không đề cập | ✅ Có (`VARCHAR(50)`) |
| Trường `floor` | ❌ Không đề cập | ✅ Có (`VARCHAR(10)`) |
| Trường `balance` | ❌ Không đề cập | ✅ Có (`DECIMAL(15,2)`) |
| Trường `so_dien_tieu_thu` | ❌ Không đề cập | ✅ Có (`DECIMAL(10,2)`) — Số điện tiêu thụ |
| Trường `so_nuoc_tieu_thu` | ❌ Không đề cập | ✅ Có (`DECIMAL(10,2)`) — Số nước tiêu thụ |
| Trường `motorbike_count` | ❌ Không đề cập | ✅ Có (`INT`) |
| Trường `car_count` | ❌ Không đề cập | ✅ Có (`INT`) |
| Trường `resident_count` | ❌ Không đề cập | ✅ Có (`INT` — thêm bởi JPA) |

---

### 1.3 Bảng Residents — Khác biệt và thiếu trường

| Mục | Báo cáo (Dòng 919-938) | Code thực tế ([Resident.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Resident.java)) |
|---|---|---|
| Trường `cmnd` | ✅ Ghi là `cmnd` | Code dùng `id_card` (tên khác) |
| Trường `phone_number` | ✅ Ghi là `phone_number` | Code dùng `phone` (tên khác) |
| Trường `date_of_birth` | ❌ Không đề cập trong bảng | ✅ Có trong code |
| Trường `gender` | ❌ Không đề cập trong bảng | ✅ Có trong code |
| Trường `email` | ❌ Không đề cập trong bảng | ✅ Có trong code |
| Trường `user_id` (FK) | ❌ Không đề cập | ✅ Có — liên kết Resident ↔ User (OneToOne) |

---

### 1.4 Bảng Fees — Thiết kế hoàn toàn khác

> [!CAUTION]
> Đây là sai lệch **nghiêm trọng nhất**. Báo cáo mô tả Fee theo kiểu "danh mục khoản thu toàn hệ thống" nhưng code triển khai Fee theo kiểu "hóa đơn cho từng căn hộ".

| Mục | Báo cáo (Dòng 940-961) | Code thực tế ([Fee.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Fee.java), [schema.sql](file:///c:/Users/mrore/G12_Quanlychungcu/database/schema.sql#L60-L71)) |
|---|---|---|
| Thiết kế | Fee là **danh mục khoản thu chung** (ko gắn với apartment) | Fee **GẮN TRỰC TIẾP với apartment** (`apartment_id` FK) |
| Trường `type` | ENUM `['MANDATORY', 'VOLUNTARY']` | VARCHAR `['DIEN', 'NUOC', 'QUAN_LY', 'GUI_XE', 'DICH_VU', 'DONG_GOP', 'KHAC']` — **Hoàn toàn khác!** |
| Trường `amount` | "Đơn giá" chung | Số tiền **cụ thể** cho 1 căn hộ |
| Trường `description` | ❌ Không đề cập | ✅ Có (TEXT) |
| Trường `paid` | ❌ Không đề cập | ✅ Có (BOOLEAN) — Thay thế cho payment status |
| Trường `start_date` | ✅ Ghi có | ❌ **Không có** trong code |
| Trường `end_date` | ✅ Ghi có | ❌ **Không có** trong code |
| Trường `unit` | ✅ Ghi có | ❌ **Không có** trong code |

---

### 1.5 Bảng Payments — Khác biệt lớn

| Mục | Báo cáo (Dòng 963-983) | Code thực tế ([Payment.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Payment.java)) |
|---|---|---|
| Trường `apartment_id` | ✅ Ghi có FK → apartments | ❌ **Không có** — Payment liên kết qua `fee_id → Fee → Apartment` |
| Trường `total_amount` | ✅ Ghi tên `total_amount` | Code dùng `amount` |
| Trường `status` | `['PENDING', 'WAITING_APPROVAL', 'PAID']` | `['PENDING', 'COMPLETED', 'REJECTED']` — **Khác!** Không có `WAITING_APPROVAL` hay `PAID` |
| Trường `image_proof` | ✅ Ghi "Ảnh bill chuyển khoản" | ❌ **Không có** — Hệ thống không hỗ trợ upload ảnh bill |
| Trường `payer_id` | ❌ Không đề cập | ✅ Có (FK → users) — Người thanh toán |
| Trường `transfer_time` | ❌ Không đề cập | ✅ Có |
| Trường `receipt_number` | ❌ Không đề cập | ✅ Có — Mã biên lai (auto-generated) |
| Trường `refund_*` (5 trường) | ❌ Không đề cập | ✅ Có — Hệ thống hoàn tiền phức tạp |

---

### 1.6 Bảng Feedbacks — Khác biệt cấu trúc

| Mục | Báo cáo (Dòng 985-1005) | Code thực tế ([Feedback.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Feedback.java)) |
|---|---|---|
| FK liên kết | `resident_id → residents` | `apartment_id → apartments` + `author_id → users` — **Hoàn toàn khác** |
| Trường `subject` | ✅ Ghi có | Code dùng `title` (tên khác) |
| Trường `status` | `['NEW', 'IN_PROGRESS', 'RESOLVED']` | `['PENDING', 'REPLIED']` — **Khác!** |
| Trường `reply` | ❌ Không đề cập | ✅ Có — Admin có thể trả lời phản hồi |
| Trường `replied_at` | ❌ Không đề cập | ✅ Có — Thời gian trả lời |

---

### 1.7 API Endpoints — Nhiều endpoint báo cáo ghi sai

| Báo cáo ghi (Dòng 1017-1031) | Code thực tế | Vấn đề |
|---|---|---|
| `GET /api/residents` | Không tồn tại trực tiếp | Code có `GET /api/residents/apartment/{id}` — phải chọn theo căn hộ |
| `POST /api/residents` | Không tồn tại | Code có `POST /api/residents/apartment/{id}` |
| `GET /api/payments/my` | Không tồn tại | Code có `GET /api/payments/apartment/{id}/history/my` |
| `POST /api/payments/{id}/proof` | **Không tồn tại** | Code **không có tính năng upload ảnh bill** |
| `PUT /api/cashier/approve/{id}` | Không tồn tại | Code có `POST /api/cashier/payments/{id}/confirm` — khác method và path |
| `POST /api/feedbacks` | ✅ Tồn tại | Đúng |

---

### 1.8 Quy trình thanh toán (UC10) — Hoàn toàn khác

> [!CAUTION]
> Báo cáo mô tả quy trình **upload ảnh bill + QR Code** nhưng code triển khai hoàn toàn khác.

**Báo cáo mô tả (UC10, Dòng 546-556):**
1. Cư dân xem danh sách phí nợ → Chọn hóa đơn → Hệ thống tạo QR Code
2. Quét QR chuyển khoản → Upload ảnh bill → Nhấn "Xác nhận đã thanh toán"
3. Trạng thái → "Đang chờ duyệt"

**Code thực tế:**
1. Cư dân chọn phí → Nhập số tiền, phương thức thanh toán, ghi chú, thời gian chuyển khoản
2. **Không có tạo QR Code, không có upload ảnh bill**
3. Nếu thanh toán QR: trạng thái = PENDING → Thủ quỹ xác nhận với **số tiền thực nhận** (có thể khác)
4. Nếu thanh toán trực tiếp: hoàn thành ngay

---

### 1.9 Duyệt thanh toán (UC11) — Khác

**Báo cáo mô tả (UC11, Dòng 578-591):**
- Thủ quỹ xem ảnh bill → Phê duyệt/Từ chối → Gửi thông báo

**Code thực tế ([CashierController.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/controller/CashierController.java)):**
- Thủ quỹ xem danh sách PENDING → Nhập **số tiền thực nhận** (`actualAmount`) → Xác nhận
- **Không có Từ chối** — chỉ có xác nhận
- **Không xem ảnh bill** (vì không có upload ảnh)
- Có logic **hoàn tiền** nếu nộp thừa (PENDING_INFO → PENDING_REFUND → COMPLETED)

---

### 1.10 Tính năng báo cáo ghi nhưng không có

| Tính năng | Báo cáo mô tả | Code |
|---|---|---|
| **Push Notification / Email** | UC08 (Dòng 523), UC12 (Dòng 617) — Gửi Push/Email | ❌ **Không có** — chỉ lưu Notification vào DB |
| **Upload ảnh bill** | UC10 (Dòng 553) | ❌ **Không có** |
| **QR Code tự tạo** | UC10 (Dòng 551) "Tạo mã QR Code ngân hàng" | ❌ **Không có trong Backend** (có thể Frontend tự tạo) |
| **Từ chối duyệt + lý do** | UC11 (Dòng 590) | ❌ **Không có** — chỉ có xác nhận |
| **Xuất Excel** | UC16 (Dòng 669-670) | ❌ **Không có** |
| **Biểu đồ thống kê** | UC16 (Dòng 667) "Biểu đồ tròn, cột" | Frontend có Dashboard nhưng không rõ thực tế |
| **Đổi mật khẩu (UC19)** | Dòng 315 — Use Case đổi mật khẩu | Không thấy endpoint `/api/auth/change-password` |
| **Cấu hình hệ thống (UC20)** | Dòng 316 | ✅ **Có** — `/api/system-config` |
| **Khóa tài khoản** | UC01 (Dòng 396) "Tài khoản bị khóa" | Có trường `active` nhưng chưa kiểm tra khi login |
| **Phân trang (Pagination)** | API docs (Dòng 1019) | ❌ **Không có** — Tất cả API trả toàn bộ danh sách |

---

### 1.11 Cấu trúc Package Backend — Không có `com.bluemoon.dto` theo mô tả

**Báo cáo mô tả (Dòng 1038-1044):** 5 package:
- `com.bluemoon.controller` ✅
- `com.bluemoon.service` ✅
- `com.bluemoon.repository` ✅
- `com.bluemoon.security` ✅
- `com.bluemoon.dto` ✅

**Code thực tế — có thêm nhiều package khác:**
- `com.bluemoon.config` ❌ Không đề cập
- `com.bluemoon.exception` ❌ Không đề cập
- `com.bluemoon.model` ❌ Không đề cập (báo cáo gọi là "Entity" nhưng không nêu package name)
- `com.bluemoon.scheduler` ❌ Không đề cập
- `com.bluemoon.util` ❌ Không đề cập
- `com.bluemoon.dto.mapper` ❌ Không đề cập (MapStruct mappers)
- `com.bluemoon.dto.request` ❌ Không đề cập

---

### 1.12 Kiến trúc Database — Sai mô tả

| Mục | Báo cáo (Dòng 872) | Thực tế ([application.properties](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/resources/application.properties)) |
|---|---|---|
| DB hosting | "AIVEN Cloud, đảm bảo luôn sẵn sàng" | `localhost:3307` — Local Docker MySQL |
| DB port | Không đề cập | Port **3307** (không phải default 3306 như hướng dẫn nói) |

---

## 🟢 PHẦN 2: CODE CÓ NHƯNG BÁO CÁO KHÔNG ĐỀ CẬP

### 2.1 Bảng & Entity `vehicles` — Quản lý phương tiện

> [!IMPORTANT]
> Code có **toàn bộ module quản lý phương tiện** nhưng báo cáo **hoàn toàn không đề cập** (chỉ nêu trong phần "Hướng phát triển tương lai" dòng 1230 như chưa làm).

- **Database**: Bảng [vehicles](file:///c:/Users/mrore/G12_Quanlychungcu/database/schema.sql#L50-L58) — `id, apartment_id, license_plate, type, color`
- **Backend**: [Vehicle.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Vehicle.java), [VehicleRepository.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/repository/VehicleRepository.java)
- **Frontend**: [VehiclesPage.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/residents/VehiclesPage.jsx) (22KB), Route `/vehicles`
- **Seed data**: 20 phương tiện mẫu
- Loại xe: `O_TO`, `XE_MAY`, `XE_DAP_DIEN`

**Nghịch lý**: Báo cáo Dòng 1230 ghi "*Hướng phát triển: Quản lý phương tiện di chuyển (đăng ký biển số xe, thu phí gửi xe theo tháng)*" — nhưng thực tế code **đã làm rồi!**

---

### 2.2 Bảng & Entity `incidents` — Báo cáo sự cố

> [!IMPORTANT]
> Code có module **Incident** (báo cáo sự cố kỹ thuật) riêng biệt với Feedback nhưng báo cáo gộp chung vào Feedback.

- **Backend**: [Incident.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Incident.java), [IncidentController.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/controller/IncidentController.java), [IncidentService.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/service/IncidentService.java)
- Có status: `PENDING`, `PROCESSING`, `RESOLVED`
- Endpoint: `/api/incidents/**`

---

### 2.3 Bảng `system_config` — Cấu hình đơn giá hệ thống

> [!IMPORTANT]
> Hệ thống có **cấu hình đơn giá tự động** rất phức tạp nhưng báo cáo chỉ đề cập sơ lược.

- **Database**: [system_config](file:///c:/Users/mrore/G12_Quanlychungcu/database/schema.sql#L99-L114)
- **Service**: [SystemConfigServiceImpl.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/service/impl/SystemConfigServiceImpl.java)
- 7 cấu hình: Phí quản lý/m², xe máy, ô tô, điện/kWh, nước/m³, **phí dịch vụ/người**, ngày hạn nộp
- **Frontend**: [FeeConfigModal.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/fees/FeeConfigModal.jsx)

---

### 2.4 FeeScheduler — Tự động phát phí hàng tháng

> [!IMPORTANT]
> Code có **Scheduler tự động tạo 5 loại phí hàng tháng** — tính năng rất quan trọng nhưng báo cáo KHÔNG ĐỀ CẬP.

- **Backend**: [FeeScheduler.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/scheduler/FeeScheduler.java) — `@Scheduled(cron = "0 0 0 1 * ?")`
- 5 loại phí tự động: Quản lý (theo m²), Gửi xe (theo số xe), Điện (theo kWh), Nước (theo m³), **Dịch vụ (theo số nhân khẩu)**
- Sau khi tạo phí, **reset số điện/nước về 0**
- **Tự động gửi Notification** cho mỗi khoản phí mới

---

### 2.5 Hệ thống hoàn tiền (Refund)

> [!IMPORTANT]
> Code triển khai **quy trình hoàn tiền 3 bước** hoàn toàn không có trong báo cáo.

- Nếu cư dân nộp **thừa** so với số tiền phí:
  1. `PENDING_INFO` — Hệ thống thông báo cư dân cung cấp thông tin tài khoản ngân hàng
  2. `PENDING_REFUND` — Cư dân đã gửi thông tin, chờ Admin hoàn tiền
  3. `COMPLETED` — Admin xác nhận đã hoàn tiền
- **Frontend**: [RefundInfoModal.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/notifications/RefundInfoModal.jsx)
- Payment entity có 5 trường refund: `refund_amount`, `refund_bank`, `refund_account_number`, `refund_account_name`, `refund_status`

---

### 2.6 Vai trò MAINTENANCE

- Code có vai trò `MAINTENANCE` trong [UserRole.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/enums/UserRole.java) và [User.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/User.java#L30-L33)
- Báo cáo chỉ đề cập 4 tác nhân: Admin, Cashier, Resident, System (không có MAINTENANCE)

---

### 2.7 Tính năng đăng ký tài khoản (Register)

- Code có endpoint `POST /api/auth/register` ([AuthController.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/controller/AuthController.java#L47-L59))
- Code có endpoint `GET /api/auth/check-resident` — kiểm tra cư dân bằng SĐT trước khi đăng ký
- **Báo cáo KHÔNG đề cập** — chỉ nói "Tài khoản được cấp" (UC01 dòng 381)

---

### 2.8 Frontend Pages không đề cập

| Page | File | Mô tả |
|---|---|---|
| Profile Page | [ProfilePage.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/profile/ProfilePage.jsx) | Xem thông tin cá nhân |
| Vehicles Page | [VehiclesPage.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/residents/VehiclesPage.jsx) | Quản lý phương tiện |
| Cashier Dashboard | [CashierDashboard.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/cashier/CashierDashboard.jsx) | Bảng điều khiển thủ quỹ |
| Users Page | [UsersPage.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/users/UsersPage.jsx) | Quản lý tài khoản |
| Login Page | [LoginPage.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/auth/LoginPage.jsx) (14KB) | Có cả Login + Register |
| Auto Fee Modal | [AutoFeeModal.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/fees/AutoFeeModal.jsx) | Phát phí tự động |
| Fee Config Modal | [FeeConfigModal.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/fees/FeeConfigModal.jsx) | Cấu hình đơn giá |
| Apartment Detail | [ApartmentDetailModal.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/residents/ApartmentDetailModal.jsx) | Xem chi tiết căn hộ |
| Refund Info Modal | [RefundInfoModal.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/notifications/RefundInfoModal.jsx) | Nhập thông tin hoàn tiền |

---

### 2.9 Thư viện & Dependencies không đề cập

| Thư viện | Mô tả | Báo cáo |
|---|---|---|
| `MapStruct` | Tự động map Entity ↔ DTO | ❌ Không đề cập |
| `lucide-react` | Icon library cho Frontend | ❌ Không đề cập |
| `H2 Database` | DB memory cho testing | ❌ Không đề cập |
| `spring-boot-devtools` | Hot reload khi phát triển | ❌ Không đề cập |
| `spring-boot-starter-validation` | Bean validation | ❌ Không đề cập |

---

### 2.10 Phí dịch vụ theo nhân khẩu (DICH_VU)

- [FeeScheduler.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/scheduler/FeeScheduler.java#L165-L178): Tự tính phí dịch vụ = `số nhân khẩu × đơn giá/người`
- Config key: `fee.service_per_person` = 100,000 VNĐ/người
- FeeType enum có `DICH_VU`
- Báo cáo dòng 169 nhắc "phí dịch vụ: 8.000 VNĐ/m²/tháng" (tính theo m², không phải theo người!) — **sai so với code**

---

---

## 🔵 PHẦN BỔ SUNG: Phát Hiện Thêm Từ Đợt Kiểm Tra Cuối

### B.1 QR Code — Ảnh tĩnh, không tự tạo động

> [!WARNING]
> Báo cáo dòng 551 nói "tạo tự động theo số tiền và cú pháp chuyển khoản" nhưng thực tế:

- [QrPaymentModal.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/components/payment/QrPaymentModal.jsx#L36) hiển thị **ảnh tĩnh cố định**: `/IMG_0792.jpg`
- Thông tin ngân hàng **hard-coded**: Techcombank, STK: 19036728374011, Chủ TK: BQL CHUNG CU BLUEMOON
- **Không tự tạo QR theo số tiền** — tất cả khoản phí hiển thị cùng 1 QR code

### B.2 Dashboard — Không có biểu đồ (Charts)

- Báo cáo dòng 1083: "biểu đồ (Charts) đường (Line chart) thể hiện tốc độ đóng phí"
- Thực tế [DashboardPage.jsx](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/pages/dashboard/DashboardPage.jsx): **Chỉ có 3 StatCard** (Tổng căn hộ, Tổng cư dân, Tổng khoản phí) + bảng "Phí chưa thanh toán"
- Thư mục `components/charts/` chỉ có file `.gitkeep` — **trống hoàn toàn, chưa làm**
- **Không có biểu đồ tròn, biểu đồ cột, hay biểu đồ đường nào cả**

### B.3 Hai file `schema.sql` khác nhau

Dự án có **2 file schema SQL khác nhau**, gây nhầm lẫn:

| File | Đặc điểm khác biệt |
|---|---|
| [database/schema.sql](file:///c:/Users/mrore/G12_Quanlychungcu/database/schema.sql) | Có bảng `system_config` + seed cấu hình. Có `balance`, `so_dien_tieu_thu`, `so_nuoc_tieu_thu`, `motorbike_count`, `car_count` trong `apartments`. Bảng `payments` có trường `status`. Role comment: `ADMIN, CASHIER, MAINTENANCE, RESIDENT` |
| [backend/src/main/resources/schema.sql](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/resources/schema.sql) | **Thiếu** bảng `system_config`. Bảng `apartments` đơn giản hơn (thiếu balance, xe, điện/nước). Bảng `payments` **thiếu** trường `status`. Có bảng `incidents`. Role comment: `ADMIN, MANAGER, RESIDENT` |

**Vấn đề**: Backend schema nói role là `MANAGER` nhưng code Java dùng `MAINTENANCE` — mâu thuẫn nội bộ.

### B.4 Bảng `feedbacks` KHÔNG CÓ trong bất kỳ schema.sql nào

- Cả 2 file schema.sql đều **không có** `CREATE TABLE feedbacks`
- Bảng được tạo bởi Hibernate `ddl-auto=update` tự động từ [Feedback.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/model/Feedback.java)
- Báo cáo dòng 985-1005 mô tả bảng Feedbacks nhưng chưa bao giờ có schema SQL cho nó

### B.5 File `test.java` — Code debug còn sót

- [test.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/controller/test.java) — Controller test đơn giản (`/api/test` → "thanh cong roi")
- Tên class viết thường, không theo Java naming convention
- Nên xóa trước khi nộp

### B.6 Mock API support — Không đề cập

- Frontend có hệ thống [Mock API](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/api/apiBaseUrl.js) (`isMockApi()`) cho phép chạy frontend mà không cần backend
- [paymentsApi.js](file:///c:/Users/mrore/G12_Quanlychungcu/frontend/src/api/paymentsApi.js) có mock data cho tất cả các endpoint
- Báo cáo không đề cập

### B.7 DatabaseSeedConfig — Auto-seeding Java

- [DatabaseSeedConfig.java](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/java/com/bluemoon/config/DatabaseSeedConfig.java) tự tạo tài khoản admin + cấu hình phí + sync resident count khi khởi động
- Khác với báo cáo nói dùng `seed.sql` để chèn dữ liệu mẫu (dòng 1203)

### B.8 Docker port — Báo cáo ghi sai

- Báo cáo dòng 1203 nói Docker MySQL tại cổng `3306`
- [docker-compose.yml](file:///c:/Users/mrore/G12_Quanlychungcu/docker-compose.yml#L10-L11) thực tế map `3307:3306`
- [application.properties](file:///c:/Users/mrore/G12_Quanlychungcu/backend/src/main/resources/application.properties#L5) kết nối `localhost:3307`

### B.9 Frontend port — Báo cáo ghi đúng

- Báo cáo dòng 1195/1197 ghi Frontend tại cổng `5173` — **Đúng** (Vite default)

---

## 📋 PHẦN 3: TÓM TẮT CÁC SAI LỆCH QUAN TRỌNG NHẤT

### Mức độ nghiêm trọng cao 🔴

| # | Vấn đề | Chi tiết |
|---|---|---|
| 1 | **Fee/Payment design khác hoàn toàn** | Báo cáo: Fee là danh mục chung → tạo Payment cho mỗi apartment. Code: Fee **đã gắn sẵn** với apartment, Payment là lịch sử thanh toán |
| 2 | **Không có upload ảnh bill** | Báo cáo mô tả upload ảnh chuyển khoản (UC10), nhưng code không hỗ trợ |
| 3 | **Loại phí hoàn toàn khác** | Báo cáo: MANDATORY/VOLUNTARY. Code: DIEN/NUOC/QUAN_LY/GUI_XE/DICH_VU/DONG_GOP/KHAC |
| 4 | **Module phương tiện ĐÃ CÓ nhưng báo cáo ghi là "hướng phát triển"** | Rất mâu thuẫn |
| 5 | **Payment status khác** | Báo cáo: PENDING → WAITING_APPROVAL → PAID. Code: PENDING → COMPLETED |
| 6 | **Không có Từ chối duyệt** | Báo cáo UC11 có từ chối, code chỉ có xác nhận |
| 7 | **QR Code là ảnh tĩnh, không tự tạo** | Báo cáo nói "tạo tự động theo số tiền", thực tế dùng 1 ảnh QR cố định cho mọi khoản phí |
| 8 | **Dashboard không có biểu đồ** | Báo cáo mô tả biểu đồ tròn, cột, đường nhưng `components/charts/` hoàn toàn trống |

### Mức độ trung bình 🟡

| # | Vấn đề |
|---|---|
| 9 | User.apartment_id trong báo cáo → code không có, dùng Resident.user_id thay thế |
| 10 | Apartment status: AVAILABLE vs VACANT |
| 11 | Feedback status: NEW/IN_PROGRESS/RESOLVED vs PENDING/REPLIED |
| 12 | Có module Incident riêng biệt nhưng báo cáo gộp vào Feedback |
| 13 | Có hệ thống hoàn tiền (Refund) rất phức tạp nhưng không đề cập |
| 14 | FeeScheduler tự động tạo 5 loại phí hàng tháng nhưng không đề cập |
| 15 | Có tính năng đăng ký tài khoản nhưng không đề cập |
| 16 | Bảng `feedbacks` không có trong bất kỳ file schema.sql nào (tạo bởi Hibernate) |
| 17 | Hai file `schema.sql` nội dung khác nhau + role MANAGER vs MAINTENANCE mâu thuẫn |

### Mức độ thấp 🟢

| # | Vấn đề |
|---|---|
| 18 | Thiếu khai báo nhiều trường trong bảng DB (building, floor, email, phone, etc.) |
| 19 | DB hosting sai (ghi AIVEN Cloud, thực tế dùng local Docker) |
| 20 | Port DB khác (báo cáo hướng dẫn 3306, code dùng 3307) |
| 21 | API paths khác với tài liệu |
| 22 | Thiếu đề cập MapStruct, lucide-react, H2 |
| 23 | Vai trò MAINTENANCE có trong code nhưng không trong báo cáo |
| 24 | File `test.java` debug còn sót trong codebase |
| 25 | Mock API support trong frontend không đề cập |
| 26 | DatabaseSeedConfig auto-seed khác với báo cáo nói dùng seed.sql |
