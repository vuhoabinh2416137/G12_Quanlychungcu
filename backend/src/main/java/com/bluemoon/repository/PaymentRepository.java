package com.bluemoon.repository;

import com.bluemoon.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Xem lịch sử đóng tiền của 1 khoản phí cụ thể
    List<Payment> findByFeeId(Long feeId);
}