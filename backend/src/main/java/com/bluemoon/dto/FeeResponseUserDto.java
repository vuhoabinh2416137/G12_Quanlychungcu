package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for {@link com.bluemoon.model.Fee}
 */
public record FeeResponseUserDto(Long id, @NotNull @Size(max = 100) String name, String description,
                                 @NotNull BigDecimal amount, @Size(max = 50) String type, LocalDate dueDate,
                                 Boolean paid) implements Serializable {
}