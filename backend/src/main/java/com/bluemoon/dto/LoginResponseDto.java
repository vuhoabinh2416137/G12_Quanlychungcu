package com.bluemoon.dto;

public record LoginResponseDto(
        String token,
        String role,
        String username,
        String fullName
) {
}
