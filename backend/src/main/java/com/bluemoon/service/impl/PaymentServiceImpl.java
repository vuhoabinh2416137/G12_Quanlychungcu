package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Fee;
import com.bluemoon.model.Invoice;
import com.bluemoon.model.Payment;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.InvoiceRepository;
import com.bluemoon.repository.PaymentRepository;
import com.bluemoon.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            FeeRepository feeRepository,
            InvoiceRepository invoiceRepository,
            ApartmentRepository apartmentRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
        this.invoiceRepository = invoiceRepository;
        this.apartmentRepository = apartmentRepository;
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
        
        // If payment is via QR, set status to PENDING and don't mark as paid yet
        if ("QR".equalsIgnoreCase(payment.getMethod()) || "PENDING".equals(payment.getStatus())) {
            payment.setStatus("PENDING");
            return paymentRepository.save(payment);
        }

        payment.setStatus("COMPLETED");
        Payment savedPayment = paymentRepository.save(payment);

        processCompletedPayment(fee, payment.getAmount());

        return savedPayment;
    }
    
    @Transactional
    public Payment confirmPayment(Long paymentId, BigDecimal actualAmount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay giao dich!"));
                
        if ("COMPLETED".equals(payment.getStatus())) {
            throw new RuntimeException("Giao dich da duoc xac nhan truoc do!");
        }
        
        payment.setAmount(actualAmount);
        payment.setStatus("COMPLETED");
        Payment savedPayment = paymentRepository.save(payment);
        
        processCompletedPayment(payment.getFee(), actualAmount);
        return savedPayment;
    }
    
    private void processCompletedPayment(Fee fee, BigDecimal actualAmount) {
        Apartment apartment = fee.getApartment();
        if (actualAmount.compareTo(fee.getAmount()) >= 0) {
            BigDecimal diff = actualAmount.subtract(fee.getAmount());
            if (apartment != null && diff.compareTo(BigDecimal.ZERO) > 0) {
                if (apartment.getBalance() == null) {
                    apartment.setBalance(BigDecimal.ZERO);
                }
                apartment.setBalance(apartment.getBalance().add(diff));
                apartmentRepository.save(apartment);
            }
            fee.setPaid(true);
        } else {
            BigDecimal remaining = fee.getAmount().subtract(actualAmount);
            fee.setAmount(remaining);
            fee.setPaid(false);
        }

        feeRepository.save(fee);
        syncInvoiceStatus(fee.getInvoice());
    }

    @Override
    public List<Payment> getPaymentHistory(Long feeId) {
        return paymentRepository.findByFeeId(feeId);
    }
    
    public List<Payment> getPendingPayments() {
        // Can be improved with custom repository method
        return paymentRepository.findAll().stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .toList();
    }

    private void syncInvoiceStatus(Invoice invoice) {
        if (invoice == null) return;

        boolean allFeesPaid = invoice.getFees().stream()
                .allMatch(fee -> Boolean.TRUE.equals(fee.getPaid()));
        invoice.setStatus(allFeesPaid ? "PAID" : "UNPAID");
        invoiceRepository.save(invoice);
    }
}
