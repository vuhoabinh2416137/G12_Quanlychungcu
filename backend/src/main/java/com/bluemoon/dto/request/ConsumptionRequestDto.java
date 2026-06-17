package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * DTO cho việc cập nhật số liệu tiêu thụ điện/nước hàng tháng
 */
public record ConsumptionRequestDto(
        @NotNull @PositiveOrZero BigDecimal soDienTieuThu,
        @NotNull @PositiveOrZero BigDecimal soNuocTieuThu
) {}
