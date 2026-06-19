package com.bluemoon.repository;

import com.bluemoon.model.Payment;
import com.bluemoon.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /** Xem lịch sử đóng tiền của 1 khoản phí cụ thể */
    List<Payment> findByFeeId(Long feeId);

    /** Lấy danh sách thanh toán đang chờ duyệt */
    List<Payment> findByStatus(String status);

    /** Lấy lịch sử thanh toán đã hoàn thành theo căn hộ */
    List<Payment> findByFee_Apartment_IdAndStatus(Long apartmentId, String status);

    /** Lấy danh sách giao dịch có hoàn tiền */
    List<Payment> findByRefundAmountGreaterThan(BigDecimal amount);

    /** Tìm giao dịch hoàn tiền gần nhất của user */
    Payment findFirstByPayerAndRefundBankIsNotNullOrderByIdDesc(User payer);

    /** Tìm giao dịch hoàn tiền gần nhất của căn hộ đã hoàn tất */
    Payment findFirstByFee_Apartment_IdAndRefundStatusOrderByIdDesc(Long apartmentId, String refundStatus);

    @Modifying
    @Query("UPDATE Payment p SET p.payer = null WHERE p.payer = :payer")
    void unlinkPayer(@Param("payer") User payer);
}