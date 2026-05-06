package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.bluemoon.model.Incident}
 */
public record IncidentResponseAdminDto(Long id,Long apartmentId,
                                       String apartmentNumber,  @NotNull @Size(max = 200) String title, @NotNull String description,
                                       @Size(max = 50) @Pattern(message = "status không hợp lệ", regexp = "PENDING|PROCESSING|RESOLVED") String status,
                                       Instant createdAt) implements Serializable {
}