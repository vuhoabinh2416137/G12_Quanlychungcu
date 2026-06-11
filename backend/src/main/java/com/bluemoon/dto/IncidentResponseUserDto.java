package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.bluemoon.model.Incident}
 */
public record IncidentResponseUserDto(Long id, String title, String description,
                                      String status, Instant createdAt) implements Serializable {
}