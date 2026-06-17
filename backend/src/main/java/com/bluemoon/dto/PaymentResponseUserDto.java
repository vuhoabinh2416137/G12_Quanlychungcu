package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for {@link com.bluemoon.model.Payment}
 */
public record PaymentResponseUserDto(Long id,  BigDecimal amount, Instant paymentDate,
                                      String method, String status) implements Serializable {
}