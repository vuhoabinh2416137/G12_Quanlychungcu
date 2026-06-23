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

import java.text.Normalizer;
import java.util.regex.Pattern;

import com.bluemoon.repository.NotificationRepository;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.model.Notification;
import com.bluemoon.model.Resident;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final ApartmentRepository apartmentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ResidentRepository residentRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            FeeRepository feeRepository,
            ApartmentRepository apartmentRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            ResidentRepository residentRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
        this.apartmentRepository = apartmentRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.residentRepository = residentRepository;
    }

    private String normalizeName(String s) {
        if (s == null) return null;
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replace("đ", "d").replace("Đ", "D").toUpperCase().trim();
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

    @Override
    @Transactional
    public Payment processVoluntaryPayment(Long apartmentId, Payment payment, String username) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay can ho!"));

        User payer = null;
        if (username != null) {
            payer = userRepository.findByUsername(username).orElse(null);
        }

        // Tao Fee tu nguyen
        Fee fee = new Fee();
        fee.setApartment(apartment);
        fee.setName("Dong gop tu nguyen");
        fee.setDescription(payment.getNote() != null ? payment.getNote() : "Dong gop tu nguyen");
        fee.setAmount(payment.getAmount());
        fee.setType("DONG_GOP");
        fee.setDueDate(java.time.LocalDate.now());
        fee.setPaid(false);
        Fee savedFee = feeRepository.save(fee);

        payment.setPayer(payer);
        payment.setFee(savedFee);
        payment.setStatus("PENDING");

        return paymentRepository.save(payment);
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
        
        // Xu ly dac biet cho phi tu nguyen (khong hoan tien)
        if ("DONG_GOP".equals(fee.getType())) {
            fee.setAmount(actualAmount);
            fee.setPaid(true);
            payment.setAmount(actualAmount);
            paymentRepository.save(payment);
            feeRepository.save(fee);
            return;
        }

        if (actualAmount.compareTo(fee.getAmount()) >= 0) {
            BigDecimal diff = actualAmount.subtract(fee.getAmount());
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                payment.setAmount(fee.getAmount());
                if (apartment != null) {
                    payment.setRefundAmount(diff);
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
                } // This closes if (apartment != null)
            } else {
                payment.setAmount(actualAmount);
            }
            fee.setPaid(true);
        } else {
            payment.setAmount(actualAmount);
            BigDecimal remaining = fee.getAmount().subtract(actualAmount);
            fee.setAmount(remaining);
            fee.setPaid(false);
        }
        paymentRepository.save(payment);
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
        
        notificationRepository.deleteByTypeAndReferenceId("REFUND_REQUEST", paymentId);
        
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
    @Transactional
    public Payment reRequestRefundInfo(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        if (!"COMPLETED".equals(payment.getStatus())) {
            throw new RuntimeException("Chỉ yêu cầu nhập lại cho giao dịch đã hoàn tất");
        }

        payment.setRefundStatus("PENDING_INFO");
        payment.setRefundBank(null);
        payment.setRefundAccountNumber(null);
        payment.setRefundAccountName(null);

        Notification notif = new Notification();
        notif.setApartment(payment.getFee().getApartment());
        notif.setTitle("Yêu cầu nhập lại thông tin hoàn tiền");
        notif.setContent("Thông tin hoàn tiền cho khoản phí " + payment.getFee().getName() + " không hợp lệ. Vui lòng cập nhật lại.");
        notif.setType("REFUND_REQUEST");
        notif.setReferenceId(payment.getId());
        notif.setCreatedAt(java.time.Instant.now());
        notificationRepository.save(notif);

        return paymentRepository.save(payment);
    }

    @Override
    public Payment getLastRefundInfo(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));
        if (payment.getFee() == null || payment.getFee().getApartment() == null) {
            return null;
        }
        return paymentRepository.findFirstByFee_Apartment_IdAndRefundStatusOrderByIdDesc(
                payment.getFee().getApartment().getId(), "COMPLETED");
    }

    @Override
    public List<Payment> getRefundPayments() {
        return paymentRepository.findByRefundAmountGreaterThan(BigDecimal.ZERO);
    }
}
