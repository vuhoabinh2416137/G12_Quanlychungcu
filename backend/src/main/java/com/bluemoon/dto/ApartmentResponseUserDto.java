package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.bluemoon.model.Apartment}
 */
public record ApartmentResponseUserDto(Long id,String apartmentNumber,
                                    String building,
                                    String floor) implements Serializable {
}