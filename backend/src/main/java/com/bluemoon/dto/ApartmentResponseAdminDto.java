package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.bluemoon.model.Apartment}
 */
public record ApartmentResponseAdminDto(
        Long id, 
        @NotNull @Size(max = 20) String apartmentNumber,
        String building, 
        String floor, 
        BigDecimal area,
        String status,
        BigDecimal soDienTieuThu,
        BigDecimal soNuocTieuThu,
        Integer motorbikeCount,
        Integer carCount,
        Integer residentCount
) implements Serializable {}