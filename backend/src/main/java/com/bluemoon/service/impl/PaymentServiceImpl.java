package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Fee;
import com.bluemoon.model.Payment;
import com.bluemoon.model.User;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.PaymentRepository;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.bluemoon.repository.NotificationRepository;
import com.bluemoon.model.Notification;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final ApartmentRepository apartmentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            FeeRepository feeRepository,
            ApartmentRepository apartmentRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
        this.apartmentRepository = apartmentRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public Payment processPayment(Long feeId, Payment payment, String username) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay khoan phi!"));

        if (Boolean.TRUE.equals(fee.getPaid())) {
            throw new RuntimeException("Khoan phi nay da duoc thanh toan day du!");
        }

        User payer = null;
        if (username != null) {
            payer = userRepository.findByUsername(username).orElse(null);
        }
        payment.setPayer(payer);
        payment.setFee(fee);
        
        // If payment is via QR, set status to PENDING and don't mark as paid yet
        if ("QR".equalsIgnoreCase(payment.getMethod()) || "PENDING".equals(payment.getStatus())) {
            payment.setStatus("PENDING");
            return paymentRepository.save(payment);
        }

        payment.setStatus("COMPLETED");
        payment.setReceiptNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        Payment savedPayment = paymentRepository.save(payment);

        processCompletedPayment(savedPayment, savedPayment.getAmount());

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
        payment.setReceiptNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        Payment savedPayment = paymentRepository.save(payment);
        
        processCompletedPayment(savedPayment, actualAmount);
        return savedPayment;
    }
    
    private void processCompletedPayment(Payment payment, BigDecimal actualAmount) {
        Fee fee = payment.getFee();
        Apartment apartment = fee.getApartment();
        if (actualAmount.compareTo(fee.getAmount()) >= 0) {
            BigDecimal diff = actualAmount.subtract(fee.getAmount());
            if (apartment != null && diff.compareTo(BigDecimal.ZERO) > 0) {
                // Yêu cầu hoàn tiền
                payment.setRefundAmount(diff);
                
                boolean infoAutoFilled = false;
                User payer = payment.getPayer();
                if (payer != null && "RESIDENT".equals(payer.getRole())) {
                    Payment previousRefund = paymentRepository.findFirstByPayerAndRefundBankIsNotNullOrderByIdDesc(payer);
                    if (previousRefund != null) {
                        payment.setRefundBank(previousRefund.getRefundBank());
                        payment.setRefundAccountNumber(previousRefund.getRefundAccountNumber());
                        payment.setRefundAccountName(previousRefund.getRefundAccountName());
                        payment.setRefundStatus("PENDING_REFUND");
                        infoAutoFilled = true;
                    }
                }
                
                if (!infoAutoFilled) {
                    payment.setRefundStatus("PENDING_INFO");
                    paymentRepository.save(payment);
                    
                    Notification notif = new Notification();
                    notif.setApartment(apartment);
                    notif.setTitle("Yêu cầu thông tin hoàn tiền");
                    notif.setContent("Khoản phí " + fee.getName() + " được thanh toán thừa. Vui lòng cung cấp thông tin tài khoản để ban quản lý hoàn trả số tiền thừa.");
                    notif.setType("REFUND_REQUEST");
                    notif.setReferenceId(payment.getId());
                    notif.setCreatedAt(java.time.Instant.now());
                    notificationRepository.save(notif);
                } else {
                    paymentRepository.save(payment);
                }
            }
            fee.setPaid(true);
        } else {
            BigDecimal remaining = fee.getAmount().subtract(actualAmount);
            fee.setAmount(remaining);
            fee.setPaid(false);
        }

        feeRepository.save(fee);
    }

    @Override
    public List<Payment> getPaymentHistory(Long feeId) {
        return paymentRepository.findByFeeId(feeId);
    }
    
    @Override
    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatus("PENDING");
    }

    @Override
    public List<Payment> getPaymentsByApartmentHistory(Long apartmentId) {
        return paymentRepository.findByFee_Apartment_IdAndStatus(apartmentId, "COMPLETED");
    }

    @Override
    @Transactional
    public Payment submitRefundInfo(Long paymentId, String bankName, String accountNumber, String accountName) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch!"));
        
        if (!"PENDING_INFO".equals(payment.getRefundStatus())) {
            throw new RuntimeException("Giao dịch không ở trạng thái chờ thông tin hoàn tiền!");
        }

        payment.setRefundBank(bankName);
        payment.setRefundAccountNumber(accountNumber);
        payment.setRefundAccountName(accountName.toUpperCase());
        payment.setRefundStatus("PENDING_REFUND");
        
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment confirmRefund(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch!"));
        
        if (!"PENDING_REFUND".equals(payment.getRefundStatus())) {
            throw new RuntimeException("Giao dịch chưa sẵn sàng để hoàn trả!");
        }

        payment.setRefundStatus("COMPLETED");
        
        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getRefundPayments() {
        return paymentRepository.findByRefundAmountGreaterThan(BigDecimal.ZERO);
    }
}
