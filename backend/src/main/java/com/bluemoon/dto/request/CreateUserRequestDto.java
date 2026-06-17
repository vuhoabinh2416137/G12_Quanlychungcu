package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUserRequestDto(
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotBlank @Pattern(regexp = "ADMIN|CASHIER|MAINTENANCE|RESIDENT") String role,
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 100) String email,
        @Size(max = 20) String phone
) {
}
