package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.bluemoon.model.Apartment}
 */
public record ApartmentRequestDto(
        @NotNull @Size(max = 20) String apartmentNumber,
        @Size(max = 50) String building, 
        @Size(max = 10) String floor, 
        BigDecimal area,
        @NotNull @Size(max = 20) @Pattern(message = "status chỉ được phép là VACANT hoặc OCCUPIED", regexp = "VACANT|OCCUPIED") String status,
        Integer motorbikeCount,
        Integer carCount
) implements Serializable {}