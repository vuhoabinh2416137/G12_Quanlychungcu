package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequestDto(
        @NotBlank String username,
        @NotBlank String password
) {
}
