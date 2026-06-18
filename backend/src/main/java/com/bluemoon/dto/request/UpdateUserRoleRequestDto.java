package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserRoleRequestDto(
        @NotBlank @Pattern(regexp = "ADMIN|CASHIER|MAINTENANCE|RESIDENT") String role
) {
}
