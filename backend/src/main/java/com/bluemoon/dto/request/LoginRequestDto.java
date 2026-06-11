package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequestDto(
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank
        @Pattern(regexp = "ADMIN|MANAGER|RESIDENT", message = "Vai trò không hợp lệ")
        String role
) {
}
