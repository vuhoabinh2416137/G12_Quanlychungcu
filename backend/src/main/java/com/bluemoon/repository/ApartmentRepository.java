package com.bluemoon.repository;

import com.bluemoon.model.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    // Tìm căn hộ chính xác theo số phòng (VD: A1205)
    Optional<Apartment> findByApartmentNumber(String apartmentNumber);

    // Tìm danh sách các căn hộ đang trống hoặc đang có người ở
    List<Apartment> findByStatus(String status);
}