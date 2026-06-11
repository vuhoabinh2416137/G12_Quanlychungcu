package com.bluemoon.config;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Resident;
import com.bluemoon.model.User;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.ResidentRepository;
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
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            seedUserIfMissing(userRepository, passwordEncoder, "admin", "admin123", "ADMIN", "Admin");
            seedUserIfMissing(userRepository, passwordEncoder, "manager", "manager123", "MANAGER", "Manager");
            User residentUser = seedUserIfMissing(userRepository, passwordEncoder, "resident", "resident123", "RESIDENT", "Resident");
            User resident456User = seedUserIfMissing(userRepository, passwordEncoder, "resident456", "resident456", "RESIDENT", "Resident 456");

            Apartment residentApartment = seedApartmentIfMissing(apartmentRepository, "A1001", "A", "10", "75.50");
            Apartment resident456Apartment = seedApartmentIfMissing(apartmentRepository, "A1002", "A", "10", "82.00");

            seedResidentProfile(residentRepository, residentUser, residentApartment, "Resident");
            seedResidentProfile(residentRepository, resident456User, resident456Apartment, "Resident 456");
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
            User user,
            Apartment apartment,
            String fullName
    ) {
        Resident residentProfile = residentRepository.findByUser_Username(user.getUsername())
                .orElseGet(Resident::new);
        residentProfile.setUser(user);
        residentProfile.setApartment(apartment);
        residentProfile.setFullName(fullName);
        residentProfile.setRelationship("CHU_HO");
        residentProfile.setEmail(user.getEmail());
        residentProfile.setPhone(user.getPhone());
        residentRepository.save(residentProfile);
    }
}
