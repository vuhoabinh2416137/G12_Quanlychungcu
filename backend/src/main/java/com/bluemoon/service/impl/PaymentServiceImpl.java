package com.bluemoon.service.impl;

import com.bluemoon.model.Fee;
import com.bluemoon.model.Payment;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.PaymentRepository;
import com.bluemoon.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, FeeRepository feeRepository) {
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
    }

    @Override
    @Transactional
    public Payment processPayment(Long feeId, Payment payment) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));

        if (fee.getPaid()) {
            throw new RuntimeException("Hóa đơn này đã được thanh toán đầy đủ!");
        }

        payment.setId(feeId); // Gắn khóa ngoại
        Payment savedPayment = paymentRepository.save(payment);

        // Logic tự động đánh dấu hoàn tất hóa đơn nếu đã nộp đủ tiền
        if (payment.getAmount().compareTo(fee.getAmount()) >= 0) {
            fee.setPaid(true);
            feeRepository.save(fee);
        }

        return savedPayment;
    }

    @Override
    public List<Payment> getPaymentHistory(Long feeId) {
        return paymentRepository.findByFeeId(feeId);
    }
}