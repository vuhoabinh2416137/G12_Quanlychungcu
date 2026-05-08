package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.bluemoon.model.Incident}
 */
public record IncidentRequestDto(@NotNull @Size(max = 200) String title,
                                 @NotNull String description) implements Serializable {
}