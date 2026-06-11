package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequestDto(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 6, max = 100) String newPassword
) {
}
