package com.bluemoon.repository;

import com.bluemoon.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    // Lấy danh sách phí của 1 căn hộ
    List<Fee> findByApartmentId(Long apartmentId);

    // Tìm các khoản phí của 1 căn hộ MÀ CHƯA THANH TOÁN (paid = false)
    List<Fee> findByApartmentIdAndPaid(Long apartmentId, Boolean paid);
}