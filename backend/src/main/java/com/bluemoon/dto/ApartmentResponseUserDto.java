package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.bluemoon.model.Apartment}
 */
public record ApartmentResponseUserDto(
        Long id, 
        String apartmentNumber,
        String building,
        String floor, 
        BigDecimal area,
        Integer motorbikeCount,
        Integer carCount,
        Integer residentCount
) implements Serializable {}