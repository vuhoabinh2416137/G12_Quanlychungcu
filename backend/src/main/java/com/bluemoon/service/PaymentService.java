package com.bluemoon.service;

import com.bluemoon.model.Payment;
import java.util.List;

public interface PaymentService {
    // Cư dân thực hiện thanh toán cho 1 hóa đơn
    Payment processPayment(Long feeId, Payment payment);

    // Xem lịch sử giao dịch của 1 hóa đơn
    List<Payment> getPaymentHistory(Long feeId);
}