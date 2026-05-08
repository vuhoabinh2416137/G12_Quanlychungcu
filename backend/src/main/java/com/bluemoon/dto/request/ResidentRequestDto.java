package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link com.bluemoon.model.Resident}
 */
public record ResidentRequestDto(@NotNull @Size(max = 100) String fullName, @NotNull LocalDate dateOfBirth,
                                 @NotNull @Size(max = 10) String gender, @NotNull @Size(max = 20) String idCard,
                                 @NotNull @Size(max = 20) String phone, @NotNull @Size(max = 100) String email,
                                 @Size(max = 50) String relationship) implements Serializable {
}