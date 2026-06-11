package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Notification;
import com.bluemoon.model.User;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.NotificationRepository;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   ApartmentRepository apartmentRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    public Notification createNotification(String username, Notification notification, Long apartmentId) {
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        notification.setSender(sender);
        notification.setCreatedAt(Instant.now());

        if (apartmentId != null) {
            Apartment apartment = apartmentRepository.findById(apartmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with id: " + apartmentId));
            notification.setApartment(apartment);
        } else {
            notification.setApartment(null); // Thông báo chung
        }

        return notificationRepository.save(notification);
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
