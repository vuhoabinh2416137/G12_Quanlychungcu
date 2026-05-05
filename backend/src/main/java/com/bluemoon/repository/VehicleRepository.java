package com.bluemoon.repository;

import com.bluemoon.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByApartmentId(Long apartmentId);
    Optional<Vehicle> findByLicensePlate(String licensePlate); // Tìm xe qua biển số
}
