package com.bluemoon.dto;

import com.bluemoon.model.Vehicle;

public class VehicleDto {
    private Long id;
    private String licensePlate;
    private String type;
    private String color;

    public VehicleDto() {
    }

    public VehicleDto(Vehicle vehicle) {
        this.id = vehicle.getId();
        this.licensePlate = vehicle.getLicensePlate();
        this.type = vehicle.getType();
        this.color = vehicle.getColor();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
