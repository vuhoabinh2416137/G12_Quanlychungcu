package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

import java.time.Instant;

/**
 * DTO for {@link com.bluemoon.model.Payment}
 */
public record PaymentRequestDto(@NotNull BigDecimal amount, @Size(max = 50) String method,
                                String note, Instant transferTime) implements Serializable {
}