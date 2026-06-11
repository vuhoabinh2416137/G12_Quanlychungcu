package com.bluemoon.service;

import com.bluemoon.model.Notification;
import java.util.List;

public interface NotificationService {
    
    // Gửi thông báo (từ admin/manager)
    Notification createNotification(String username, Notification notification, Long apartmentId);

    // Lấy thông báo theo ID
    Notification getNotificationById(Long id);

    // Lấy tất cả thông báo (dành cho Admin)
    List<Notification> getAllNotifications();

    // Lấy thông báo cho 1 căn hộ cụ thể (bao gồm thông báo riêng của căn hộ + thông báo chung)
    List<Notification> getNotificationsForApartment(Long apartmentId);

    // Xóa thông báo
    void deleteNotification(Long id);
}
