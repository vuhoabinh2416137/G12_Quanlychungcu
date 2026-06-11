package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link com.bluemoon.model.Resident}
 */
public record ResidentResponseUserDto(Long id, String fullName, LocalDate dateOfBirth,
                                       String gender, String relationship) implements Serializable {
}