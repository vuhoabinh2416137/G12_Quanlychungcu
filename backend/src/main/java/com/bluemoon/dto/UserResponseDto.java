package com.bluemoon.dto;

import java.time.Instant;

public record UserResponseDto(
        Long id,
        String username,
        String role,
        String fullName,
        String email,
        String phone,
        Boolean active,
        Instant createdAt
) {
}
