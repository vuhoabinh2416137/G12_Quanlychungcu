package com.bluemoon.service.impl;

import com.bluemoon.model.Fee;
import com.bluemoon.model.Invoice;
import com.bluemoon.model.Payment;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.InvoiceRepository;
import com.bluemoon.repository.PaymentRepository;
import com.bluemoon.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            FeeRepository feeRepository,
            InvoiceRepository invoiceRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    @Transactional
    public Payment processPayment(Long feeId, Payment payment) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay khoan phi!"));

        if (Boolean.TRUE.equals(fee.getPaid())) {
            throw new RuntimeException("Khoan phi nay da duoc thanh toan day du!");
        }

        payment.setFee(fee);
        Payment savedPayment = paymentRepository.save(payment);

        if (payment.getAmount().compareTo(fee.getAmount()) >= 0) {
            fee.setPaid(true);
            feeRepository.save(fee);
            syncInvoiceStatus(fee.getInvoice());
        }

        return savedPayment;
    }

    @Override
    public List<Payment> getPaymentHistory(Long feeId) {
        return paymentRepository.findByFeeId(feeId);
    }

    private void syncInvoiceStatus(Invoice invoice) {
        if (invoice == null) return;

        boolean allFeesPaid = invoice.getFees().stream()
                .allMatch(fee -> Boolean.TRUE.equals(fee.getPaid()));
        invoice.setStatus(allFeesPaid ? "PAID" : "UNPAID");
        invoiceRepository.save(invoice);
    }
}
