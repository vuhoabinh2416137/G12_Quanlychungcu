package com.bluemoon.controller;

import com.bluemoon.dto.NotificationResponseAdminDto;
import com.bluemoon.dto.NotificationResponseUserDto;
import com.bluemoon.dto.mapper.NotificationMapper;
import com.bluemoon.dto.request.NotificationRequestDto;
import com.bluemoon.model.Notification;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;
    private final ResidentAccessService residentAccessService;

    public NotificationController(
            NotificationService notificationService,
            NotificationMapper notificationMapper,
            ResidentAccessService residentAccessService
    ) {
        this.notificationService = notificationService;
        this.notificationMapper = notificationMapper;
        this.residentAccessService = residentAccessService;
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<NotificationResponseAdminDto> createNotification(
            @Valid @RequestBody NotificationRequestDto requestDto,
            Authentication authentication
    ) {
        String username = authentication.getName();
        Notification notification = notificationMapper.toEntity(requestDto);
        Notification saved = notificationService.createNotification(username, notification, requestDto.getApartmentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationMapper.toAdminDto(saved));
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<NotificationResponseAdminDto>> getAllNotifications() {
        return ResponseEntity.ok(notificationMapper.toAdminDtoList(notificationService.getAllNotifications()));
    }

    @GetMapping("/apartment/{apartmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<List<NotificationResponseUserDto>> getNotificationsForApartment(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(notificationMapper.toUserDtoList(notificationService.getNotificationsForApartment(apartmentId)));
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<NotificationResponseAdminDto> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationMapper.toAdminDto(notificationService.getNotificationById(id)));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
