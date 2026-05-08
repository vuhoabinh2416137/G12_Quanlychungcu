package com.bluemoon.repository;

import com.bluemoon.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Lấy thông báo gửi riêng cho 1 căn hộ HOẶC thông báo chung (apartmentId IS NULL)
    List<Notification> findByApartmentIdOrApartmentIdIsNullOrderByCreatedAtDesc(Long apartmentId);
}
