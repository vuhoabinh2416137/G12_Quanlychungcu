package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateUserActiveRequestDto(
        @NotNull Boolean active
) {
}
