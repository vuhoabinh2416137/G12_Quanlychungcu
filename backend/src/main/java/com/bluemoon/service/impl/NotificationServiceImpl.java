package com.bluemoon.service.impl;

import com.bluemoon.exception.ResourceNotFoundException;
import com.bluemoon.model.Apartment;
import com.bluemoon.model.Notification;
import com.bluemoon.model.User;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.NotificationRepository;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.PaymentRepository;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.model.Fee;
import com.bluemoon.model.Payment;
import com.bluemoon.model.Resident;
import com.bluemoon.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.math.BigDecimal;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;
    private final FeeRepository feeRepository;
    private final PaymentRepository paymentRepository;
    private final ResidentRepository residentRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   ApartmentRepository apartmentRepository,
                                   FeeRepository feeRepository,
                                   PaymentRepository paymentRepository,
                                   ResidentRepository residentRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.apartmentRepository = apartmentRepository;
        this.feeRepository = feeRepository;
        this.paymentRepository = paymentRepository;
        this.residentRepository = residentRepository;
    }

    @Override
    public List<Notification> createNotifications(String username, Notification notificationTemplate, List<Long> apartmentIds, BigDecimal refundAmount) {
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        List<Notification> toSave = new java.util.ArrayList<>();
        
        if (apartmentIds == null || apartmentIds.isEmpty()) {
            Notification n = new Notification();
            n.setTitle(notificationTemplate.getTitle());
            n.setContent(notificationTemplate.getContent());
            n.setType(notificationTemplate.getType());
            n.setReferenceId(notificationTemplate.getReferenceId());
            n.setSender(sender);
            n.setCreatedAt(Instant.now());
            n.setApartment(null);
            toSave.add(n);
        } else {
            for (Long id : apartmentIds) {
                Apartment apt = apartmentRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with id: " + id));
                
                Long referenceId = notificationTemplate.getReferenceId();
                if ("REFUND_REQUEST".equals(notificationTemplate.getType()) && refundAmount != null) {
                    Fee dummyFee = new Fee();
                    dummyFee.setApartment(apt);
                    dummyFee.setName("Hoàn tiền (Tạo thủ công)");
                    dummyFee.setAmount(BigDecimal.ZERO);
                    dummyFee.setPaid(true);
                    feeRepository.save(dummyFee);

                    Payment payment = new Payment();
                    payment.setFee(dummyFee);
                    payment.setAmount(BigDecimal.ZERO);
                    payment.setRefundAmount(refundAmount);
                    payment.setStatus("COMPLETED");
                    payment.setRefundStatus("PENDING_INFO");
                    User residentUser = residentRepository.findByApartment_Id(apt.getId()).stream().map(Resident::getUser).findFirst().orElse(null);
                    payment.setPayer(residentUser);
                    paymentRepository.save(payment);
                    
                    referenceId = payment.getId();
                }

                Notification n = new Notification();
                n.setTitle(notificationTemplate.getTitle());
                n.setContent(notificationTemplate.getContent());
                n.setType(notificationTemplate.getType());
                n.setReferenceId(referenceId);
                n.setSender(sender);
                n.setCreatedAt(Instant.now());
                n.setApartment(apt);
                toSave.add(n);
            }
        }

        return notificationRepository.saveAll(toSave);
    }

    @Override
    @Transactional(readOnly = true)
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForApartment(Long apartmentId) {
        return notificationRepository.findByApartmentIdOrApartmentIdIsNullOrderByCreatedAtDesc(apartmentId);
    }

    @Override
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }
}
