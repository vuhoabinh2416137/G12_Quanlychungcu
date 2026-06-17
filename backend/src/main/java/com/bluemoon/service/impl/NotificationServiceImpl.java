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
    public List<Notification> createNotifications(String username, Notification notificationTemplate, List<Long> apartmentIds) {
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        java.util.List<Notification> toSave = new java.util.ArrayList<>();
        
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
                Notification n = new Notification();
                n.setTitle(notificationTemplate.getTitle());
                n.setContent(notificationTemplate.getContent());
                n.setType(notificationTemplate.getType());
                n.setReferenceId(notificationTemplate.getReferenceId());
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
