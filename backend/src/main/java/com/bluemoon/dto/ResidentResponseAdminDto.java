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
                                        String fullName, LocalDate dateOfBirth,
                                        String gender,  String idCard,
                                       String phone,  String email,
                                       String relationship) implements Serializable {
}