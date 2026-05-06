package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link com.bluemoon.model.Resident}
 */
public record ResidentResponseUserDto(Long id, @NotNull @Size(max = 100) String fullName, LocalDate dateOfBirth,
                                      @Size(max = 10) String gender, @Size(max = 50) String relationship) implements Serializable {
}