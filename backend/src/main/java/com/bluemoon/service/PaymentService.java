package com.bluemoon.service;

import com.bluemoon.model.Payment;
import java.util.List;
import java.math.BigDecimal;

public interface PaymentService {
    // Cư dân thực hiện thanh toán cho 1 hóa đơn
    Payment processPayment(Long feeId, Payment payment, String username);

    Payment confirmPayment(Long paymentId, BigDecimal actualAmount);

    // Xem lịch sử giao dịch của 1 hóa đơn
    List<Payment> getPaymentHistory(Long feeId);

    List<Payment> getPendingPayments();
    List<Payment> getPaymentsByApartmentHistory(Long apartmentId);

    Payment submitRefundInfo(Long paymentId, String bankName, String accountNumber, String accountName);

    Payment confirmRefund(Long paymentId);

    List<Payment> getRefundPayments();
}