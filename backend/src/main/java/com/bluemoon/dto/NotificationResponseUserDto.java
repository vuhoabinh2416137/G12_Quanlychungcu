package com.bluemoon.dto;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.bluemoon.model.Notification}
 */
public record NotificationResponseUserDto(
        Long id,
        String title,
        String content,
        String type,
        Instant createdAt,
        Long referenceId
) implements Serializable {
}
