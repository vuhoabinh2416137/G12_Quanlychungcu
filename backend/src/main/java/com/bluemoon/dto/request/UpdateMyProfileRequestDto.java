package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateMyProfileRequestDto(
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 100) String email,
        @Size(max = 20) String phone
) {
}
