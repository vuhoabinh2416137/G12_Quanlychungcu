package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.bluemoon.model.Apartment}
 */
public record ApartmentResponseUserDto(Long id, @NotNull @Size(max = 20) String apartmentNumber,
                                       @Size(max = 50) String building,
                                       @Size(max = 10) String floor) implements Serializable {
}