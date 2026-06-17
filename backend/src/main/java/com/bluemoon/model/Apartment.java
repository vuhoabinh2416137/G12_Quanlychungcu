package com.bluemoon.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(name = "apartments")
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 20)
    @NotNull
    @Column(name = "apartment_number", nullable = false, length = 20)
    private String apartmentNumber;

    @Size(max = 50)
    @Column(name = "building", length = 50)
    private String building;

    @Size(max = 10)
    @Column(name = "floor", length = 10)
    private String floor;

    @Column(name = "area", precision = 10, scale = 2)
    private BigDecimal area;

    @Size(max = 20)
    @Pattern(
            regexp = "VACANT|OCCUPIED",
            message = "status chỉ được phép là VACANT hoặc OCCUPIED"
    )
    @ColumnDefault("'VACANT'")
    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "balance", precision = 15, scale = 2)
    @ColumnDefault("0.0")
    private BigDecimal balance;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApartmentNumber() {
        return apartmentNumber;
    }

    public void setApartmentNumber(String apartmentNumber) {
        this.apartmentNumber = apartmentNumber;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public BigDecimal getArea() {
        return area;
    }

    public void setArea(BigDecimal area) {
        this.area = area;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    @Column(name = "so_dien_tieu_thu", precision = 10, scale = 2)
    @ColumnDefault("0")
    private BigDecimal soDienTieuThu = BigDecimal.ZERO;

    @Column(name = "so_nuoc_tieu_thu", precision = 10, scale = 2)
    @ColumnDefault("0")
    private BigDecimal soNuocTieuThu = BigDecimal.ZERO;

    public BigDecimal getSoDienTieuThu() {
        return soDienTieuThu;
    }

    public void setSoDienTieuThu(BigDecimal soDienTieuThu) {
        this.soDienTieuThu = soDienTieuThu;
    }

    public BigDecimal getSoNuocTieuThu() {
        return soNuocTieuThu;
    }

    public void setSoNuocTieuThu(BigDecimal soNuocTieuThu) {
        this.soNuocTieuThu = soNuocTieuThu;
    }

}