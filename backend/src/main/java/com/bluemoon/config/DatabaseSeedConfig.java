package com.bluemoon.config;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Resident;
import com.bluemoon.model.SystemConfig;
import com.bluemoon.model.User;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.repository.SystemConfigRepository;
import com.bluemoon.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DatabaseSeedConfig {

    @Bean
    public CommandLineRunner seedDefaultData(
            UserRepository userRepository,
            ApartmentRepository apartmentRepository,
            ResidentRepository residentRepository,
            PasswordEncoder passwordEncoder,
            SystemConfigRepository systemConfigRepository
    ) {
        return args -> {
            // Seed admin account only if no users exist in the system at all
            if (userRepository.count() == 0) {
                seedUserIfMissing(userRepository, passwordEncoder, "admin", "admin123", "ADMIN", "Admin");
            }

            // Seed cấu hình phí cố định mặc định
            seedConfigIfMissing(systemConfigRepository, "fee.management_per_sqm", "10000", "Đơn giá phí quản lý (VNĐ/m²)");
            seedConfigIfMissing(systemConfigRepository, "fee.motorbike", "150000", "Đơn giá gửi xe máy (VNĐ/xe/tháng)");
            seedConfigIfMissing(systemConfigRepository, "fee.car", "1000000", "Đơn giá gửi ô tô (VNĐ/xe/tháng)");
            seedConfigIfMissing(systemConfigRepository, "fee.electricity_per_kwh", "3500", "Đơn giá điện (VNĐ/kWh)");
            seedConfigIfMissing(systemConfigRepository, "fee.water_per_m3", "15000", "Đơn giá nước (VNĐ/m³)");
            seedConfigIfMissing(systemConfigRepository, "fee.due_day_of_month", "15", "Ngày hạn nộp hàng tháng");
        };
    }

    private static User seedUserIfMissing(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String username,
            String rawPassword,
            String role,
            String fullName
    ) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User u = new User();
            u.setUsername(username);
            u.setPassword(passwordEncoder.encode(rawPassword));
            u.setRole(role);
            u.setFullName(fullName);
            u.setActive(true);
            return userRepository.save(u);
        });
    }

    private static Apartment seedApartmentIfMissing(
            ApartmentRepository apartmentRepository,
            String apartmentNumber,
            String building,
            String floor,
            String area
    ) {
        Apartment apartment = apartmentRepository.findByApartmentNumber(apartmentNumber)
                .orElseGet(() -> {
                    Apartment next = new Apartment();
                    next.setApartmentNumber(apartmentNumber);
                    next.setBuilding(building);
                    next.setFloor(floor);
                    next.setArea(new BigDecimal(area));
                    next.setStatus("OCCUPIED");
                    return apartmentRepository.save(next);
                });

        if (!"OCCUPIED".equals(apartment.getStatus())) {
            apartment.setStatus("OCCUPIED");
            apartment = apartmentRepository.save(apartment);
        }

        return apartment;
    }

    private static void seedResidentProfile(
            ResidentRepository residentRepository,
            Apartment apartment,
            String fullName,
            String phone
    ) {
        Resident residentProfile = residentRepository.findByPhone(phone)
                .orElseGet(Resident::new);
        residentProfile.setApartment(apartment);
        residentProfile.setFullName(fullName);
        residentProfile.setRelationship("CHU_HO");
        residentProfile.setPhone(phone);
        residentRepository.save(residentProfile);
    }

    private static void seedConfigIfMissing(
            SystemConfigRepository systemConfigRepository,
            String key,
            String value,
            String description
    ) {
        systemConfigRepository.findByConfigKey(key).orElseGet(() -> {
            SystemConfig config = new SystemConfig(key, value, description);
            return systemConfigRepository.save(config);
        });
    }
}
