package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link com.bluemoon.model.Resident}
 */
public record ResidentResponseAdminDto(Long id, Long apartmentId,
                                       String apartmentNumber,
                                       @NotNull @Size(max = 100) String fullName, LocalDate dateOfBirth,
                                       @Size(max = 10) String gender, @Size(max = 20) String idCard,
                                       @Size(max = 20) String phone, @Size(max = 100) String email,
                                       @Size(max = 50) String relationship) implements Serializable {
}