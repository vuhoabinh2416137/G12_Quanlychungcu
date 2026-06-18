package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for {@link com.bluemoon.model.Fee}
 */
public record FeeResponseAdminDto(Long id,Long apartmentId,
                                  String apartmentNumber,
                                  String name,  BigDecimal amount, String type, LocalDate dueDate,
                                  Boolean paid, String paymentStatus) implements Serializable {
}