package com.bluemoon.repository;

import com.bluemoon.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Lấy thông báo gửi riêng cho 1 căn hộ HOẶC thông báo chung (apartmentId IS NULL)
    List<Notification> findByApartmentIdOrApartmentIdIsNullOrderByCreatedAtDesc(Long apartmentId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Notification n SET n.sender = null WHERE n.sender = :sender")
    void unlinkSender(@org.springframework.data.repository.query.Param("sender") com.bluemoon.model.User sender);
}
