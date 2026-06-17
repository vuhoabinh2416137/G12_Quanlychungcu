package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public class AutoFeeRequestDto {
    @NotNull
    @PositiveOrZero
    private BigDecimal managementFeePerSqm;

    @NotNull
    @PositiveOrZero
    private BigDecimal motorbikeFee;

    @NotNull
    @PositiveOrZero
    private BigDecimal carFee;

    @NotNull
    @PositiveOrZero
    private BigDecimal electricityFeePerKwh;

    @NotNull
    @PositiveOrZero
    private BigDecimal waterFeePerM3;

    @NotNull
    @Min(1)
    @Max(28)
    private Integer dueDayOfMonth;

    public BigDecimal getManagementFeePerSqm() {
        return managementFeePerSqm;
    }

    public void setManagementFeePerSqm(BigDecimal managementFeePerSqm) {
        this.managementFeePerSqm = managementFeePerSqm;
    }

    public BigDecimal getMotorbikeFee() {
        return motorbikeFee;
    }

    public void setMotorbikeFee(BigDecimal motorbikeFee) {
        this.motorbikeFee = motorbikeFee;
    }

    public BigDecimal getCarFee() {
        return carFee;
    }

    public void setCarFee(BigDecimal carFee) {
        this.carFee = carFee;
    }

    public BigDecimal getElectricityFeePerKwh() {
        return electricityFeePerKwh;
    }

    public void setElectricityFeePerKwh(BigDecimal electricityFeePerKwh) {
        this.electricityFeePerKwh = electricityFeePerKwh;
    }

    public BigDecimal getWaterFeePerM3() {
        return waterFeePerM3;
    }

    public void setWaterFeePerM3(BigDecimal waterFeePerM3) {
        this.waterFeePerM3 = waterFeePerM3;
    }

    public Integer getDueDayOfMonth() {
        return dueDayOfMonth;
    }

    public void setDueDayOfMonth(Integer dueDayOfMonth) {
        this.dueDayOfMonth = dueDayOfMonth;
    }
}
