package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class VehicleRequestDto {
    
    @NotBlank(message = "Biển số xe không được để trống")
    @Size(max = 20)
    private String licensePlate;

    @NotBlank(message = "Loại xe không được để trống")
    @Size(max = 50)
    private String type;

    @Size(max = 50)
    private String color;

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
