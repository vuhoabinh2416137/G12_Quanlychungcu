package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for {@link com.bluemoon.model.Fee}
 */
public record FeeRequestDto(@NotNull @Size(max = 100) String name, String description, @NotNull BigDecimal amount,
                            @Size(max = 50) String type, LocalDate dueDate) implements Serializable {
}