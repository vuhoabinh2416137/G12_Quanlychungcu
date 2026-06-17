package com.bluemoon.repository;

import com.bluemoon.model.Payment;
import com.bluemoon.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Xem lịch sử đóng tiền của 1 khoản phí cụ thể
    List<Payment> findByFeeId(Long feeId);
    
    // Tìm giao dịch hoàn tiền gần nhất của user
    Payment findFirstByPayerAndRefundBankIsNotNullOrderByIdDesc(User payer);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Payment p SET p.payer = null WHERE p.payer = :payer")
    void unlinkPayer(@org.springframework.data.repository.query.Param("payer") User payer);
}