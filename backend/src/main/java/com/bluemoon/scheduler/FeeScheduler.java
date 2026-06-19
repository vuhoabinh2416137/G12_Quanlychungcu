package com.bluemoon.scheduler;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Fee;
import com.bluemoon.model.Vehicle;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.VehicleRepository;
import com.bluemoon.service.SystemConfigService;
import com.bluemoon.service.impl.SystemConfigServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.time.Instant;
import com.bluemoon.model.Notification;
import com.bluemoon.repository.NotificationRepository;

@Component
public class FeeScheduler {

    private static final Logger log = LoggerFactory.getLogger(FeeScheduler.class);

    private final ApartmentRepository apartmentRepository;
    private final FeeRepository feeRepository;
    private final VehicleRepository vehicleRepository;
    private final SystemConfigService systemConfigService;
    private final NotificationRepository notificationRepository;

    public FeeScheduler(
            ApartmentRepository apartmentRepository,
            FeeRepository feeRepository,
            VehicleRepository vehicleRepository,
            SystemConfigService systemConfigService,
            NotificationRepository notificationRepository
    ) {
        this.apartmentRepository = apartmentRepository;
        this.feeRepository = feeRepository;
        this.vehicleRepository = vehicleRepository;
        this.systemConfigService = systemConfigService;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Chạy tự động vào 00:00 ngày 1 hàng tháng.
     * Tính phí dựa trên dữ liệu tiêu thụ thực tế (soDienTieuThu, soNuocTieuThu)
     * và số xe đăng ký trong bảng vehicles.
     * Sau khi tạo phí, reset số điện/nước về 0.
     */
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void generateMonthlyFees() {
        log.info("=== BẮT ĐẦU PHÁT PHÍ CỐ ĐỊNH TỰ ĐỘNG ===");

        // Đọc đơn giá từ cấu hình hệ thống
        BigDecimal managementFeePerSqm = systemConfigService.getDecimalValue(
                SystemConfigServiceImpl.KEY_MANAGEMENT_FEE_PER_SQM, new BigDecimal("10000"));
        BigDecimal motorbikeFee = systemConfigService.getDecimalValue(
                SystemConfigServiceImpl.KEY_MOTORBIKE_FEE, new BigDecimal("150000"));
        BigDecimal carFee = systemConfigService.getDecimalValue(
                SystemConfigServiceImpl.KEY_CAR_FEE, new BigDecimal("1000000"));
        BigDecimal electricityFeePerKwh = systemConfigService.getDecimalValue(
                SystemConfigServiceImpl.KEY_ELECTRICITY_FEE_PER_KWH, new BigDecimal("3500"));
        BigDecimal waterFeePerM3 = systemConfigService.getDecimalValue(
                SystemConfigServiceImpl.KEY_WATER_FEE_PER_M3, new BigDecimal("15000"));
        int dueDayOfMonth = systemConfigService.getDecimalValue(
                SystemConfigServiceImpl.KEY_DUE_DAY_OF_MONTH, new BigDecimal("15")).intValue();

        log.info("Đơn giá: Quản lý={}/m², Xe máy={}/xe, Ô tô={}/xe, Điện={}/kWh, Nước={}/m³, Hạn nộp ngày={}",
                managementFeePerSqm, motorbikeFee, carFee, electricityFeePerKwh, waterFeePerM3, dueDayOfMonth);

        List<Apartment> apartments = apartmentRepository.findByStatus("OCCUPIED");
        LocalDate today = LocalDate.now();
        // Phí phát sinh đầu tháng này cho tiêu thụ tháng trước
        String monthYear = today.format(DateTimeFormatter.ofPattern("MM/yyyy"));
        int dueDay = Math.min(dueDayOfMonth, today.lengthOfMonth());
        LocalDate dueDate = today.withDayOfMonth(dueDay);

        List<Fee> feesToSave = new ArrayList<>();

        for (Apartment apartment : apartments) {
            // 1. Phí Quản lý (theo diện tích) - cố định hàng tháng
            if (apartment.getArea() != null && managementFeePerSqm.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal amount = apartment.getArea()
                        .multiply(managementFeePerSqm)
                        .setScale(2, RoundingMode.HALF_UP);

                Fee mgmtFee = new Fee();
                mgmtFee.setApartment(apartment);
                mgmtFee.setName("Phí quản lý tháng " + monthYear);
                mgmtFee.setDescription("Diện tích " + apartment.getArea() + " m² × " + managementFeePerSqm + " VNĐ/m²");
                mgmtFee.setAmount(amount);
                mgmtFee.setType("QUAN_LY");
                mgmtFee.setDueDate(dueDate);
                mgmtFee.setPaid(false);
                feesToSave.add(mgmtFee);
            }

            // 2. Phí Gửi xe (từ motorbikeCount và carCount của căn hộ)
            int motorbikeCount = apartment.getMotorbikeCount();
            int carCount = apartment.getCarCount();
            BigDecimal totalVehicleFee = BigDecimal.ZERO;
            
            if (motorbikeCount > 0) {
                totalVehicleFee = totalVehicleFee.add(motorbikeFee.multiply(new BigDecimal(motorbikeCount)));
            }
            if (carCount > 0) {
                totalVehicleFee = totalVehicleFee.add(carFee.multiply(new BigDecimal(carCount)));
            }

            if (totalVehicleFee.compareTo(BigDecimal.ZERO) > 0) {
                Fee vehicleFeeEntry = new Fee();
                vehicleFeeEntry.setApartment(apartment);
                vehicleFeeEntry.setName("Phí gửi xe tháng " + monthYear);
                vehicleFeeEntry.setDescription(motorbikeCount + " xe máy × " + motorbikeFee + " + " + carCount + " ô tô × " + carFee);
                vehicleFeeEntry.setAmount(totalVehicleFee);
                vehicleFeeEntry.setType("GUI_XE");
                vehicleFeeEntry.setDueDate(dueDate);
                vehicleFeeEntry.setPaid(false);
                feesToSave.add(vehicleFeeEntry);
            }

            // 3. Phí Điện (soDienTieuThu × đơn giá) - chỉ tạo nếu > 0
            BigDecimal soDien = apartment.getSoDienTieuThu();
            if (soDien != null && soDien.compareTo(BigDecimal.ZERO) > 0
                    && electricityFeePerKwh.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal amount = soDien.multiply(electricityFeePerKwh).setScale(2, RoundingMode.HALF_UP);
                Fee electricityFee = new Fee();
                electricityFee.setApartment(apartment);
                electricityFee.setName("Phí điện tháng " + monthYear);
                electricityFee.setDescription(soDien + " kWh × " + electricityFeePerKwh + " VNĐ/kWh");
                electricityFee.setAmount(amount);
                electricityFee.setType("DIEN");
                electricityFee.setDueDate(dueDate);
                electricityFee.setPaid(false);
                feesToSave.add(electricityFee);
            }

            // 4. Phí Nước (soNuocTieuThu × đơn giá) - chỉ tạo nếu > 0
            BigDecimal soNuoc = apartment.getSoNuocTieuThu();
            if (soNuoc != null && soNuoc.compareTo(BigDecimal.ZERO) > 0
                    && waterFeePerM3.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal amount = soNuoc.multiply(waterFeePerM3).setScale(2, RoundingMode.HALF_UP);
                Fee waterFee = new Fee();
                waterFee.setApartment(apartment);
                waterFee.setName("Phí nước tháng " + monthYear);
                waterFee.setDescription(soNuoc + " m³ × " + waterFeePerM3 + " VNĐ/m³");
                waterFee.setAmount(amount);
                waterFee.setType("NUOC");
                waterFee.setDueDate(dueDate);
                waterFee.setPaid(false);
                feesToSave.add(waterFee);
            }

            // Reset số liệu tiêu thụ cho tháng mới
            apartment.setSoDienTieuThu(BigDecimal.ZERO);
            apartment.setSoNuocTieuThu(BigDecimal.ZERO);
            apartmentRepository.save(apartment);
        }

        List<Fee> savedFees = feeRepository.saveAll(feesToSave);
        
        List<Notification> notificationsToSave = new ArrayList<>();
        for (Fee savedFee : savedFees) {
            Notification notification = new Notification();
            notification.setTitle("Thông báo đóng phí: " + savedFee.getName());
            notification.setContent("Căn hộ " + savedFee.getApartment().getApartmentNumber() + " có một khoản phí mới cần thanh toán: " + savedFee.getName() + " với số tiền là " + savedFee.getAmount() + " VNĐ. " + (savedFee.getDescription() != null ? savedFee.getDescription() : ""));
            notification.setType("FEE_NOTICE");
            notification.setApartment(savedFee.getApartment());
            notification.setReferenceId(savedFee.getId());
            notification.setCreatedAt(Instant.now());
            notificationsToSave.add(notification);
        }
        notificationRepository.saveAll(notificationsToSave);

        log.info("=== HOÀN TẤT: Đã phát {} khoản phí và gửi {} thông báo cho {} căn hộ. Đã reset số điện/nước về 0. ===",
                savedFees.size(), notificationsToSave.size(), apartments.size());
    }
}
