package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for {@link com.bluemoon.model.Payment}
 */
public record PaymentResponseAdminDto(Long id,
                                      Long feeId,
                                      String feeName, String apartmentNumber,@NotNull BigDecimal amount, Instant paymentDate,
                                      @Size(max = 50) String method, String note) implements Serializable {
}