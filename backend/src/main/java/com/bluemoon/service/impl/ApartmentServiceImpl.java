package com.bluemoon.service.impl;

import com.bluemoon.exception.DuplicateResourceException;
import com.bluemoon.exception.ResourceNotFoundException;
import com.bluemoon.model.Apartment;
import com.bluemoon.model.Resident;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.repository.VehicleRepository;
import com.bluemoon.service.ApartmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApartmentServiceImpl implements ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;
    private final VehicleRepository vehicleRepository;

    public ApartmentServiceImpl(ApartmentRepository apartmentRepository, ResidentRepository residentRepository, VehicleRepository vehicleRepository) {
        this.apartmentRepository = apartmentRepository;
        this.residentRepository = residentRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }

    @Override
    public Apartment getApartmentById(Long id) {
        return apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy căn hộ với ID: " + id));
    }

    @Override
    public Apartment getApartmentByNumber(String apartmentNumber) {
        return apartmentRepository.findByApartmentNumber(apartmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy căn hộ số: " + apartmentNumber));
    }

    @Override
    @Transactional
    public Apartment createApartment(Apartment apartment) {
        if (apartmentRepository.findByApartmentNumber(apartment.getApartmentNumber()).isPresent()) {
            throw new DuplicateResourceException("Số căn hộ đã tồn tại!");
        }
        return apartmentRepository.save(apartment);
    }

    @Override
    @Transactional
    public Apartment updateApartment(Long id, Apartment apartmentDetails) {
        Apartment existingApartment = getApartmentById(id);

        existingApartment.setBuilding(apartmentDetails.getBuilding());
        existingApartment.setFloor(apartmentDetails.getFloor());
        existingApartment.setArea(apartmentDetails.getArea());
        existingApartment.setStatus(apartmentDetails.getStatus());
        existingApartment.setSoDienTieuThu(apartmentDetails.getSoDienTieuThu());
        existingApartment.setSoNuocTieuThu(apartmentDetails.getSoNuocTieuThu());

        return apartmentRepository.save(existingApartment);
    }

    @Override
    @Transactional
    public void deleteApartment(Long id) {
        Apartment existingApartment = getApartmentById(id);

        // Xóa tất cả cư dân đang ở trong căn hộ này trước khi xóa căn hộ
        List<Resident> residents = residentRepository.findByApartment_Id(id);
        residentRepository.deleteAll(residents);

        apartmentRepository.delete(existingApartment);
    }

    @Override
    public List<com.bluemoon.model.Vehicle> getVehiclesByApartmentId(Long id) {
        getApartmentById(id); // Ensure apartment exists
        return vehicleRepository.findByApartmentId(id);
    }

    @Override
    @Transactional
    public com.bluemoon.model.Vehicle addVehicleToApartment(Long apartmentId, com.bluemoon.dto.request.VehicleRequestDto dto) {
        Apartment apartment = getApartmentById(apartmentId);
        com.bluemoon.model.Vehicle vehicle = new com.bluemoon.model.Vehicle();
        vehicle.setApartment(apartment);
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setType(dto.getType());
        vehicle.setColor(dto.getColor());
        com.bluemoon.model.Vehicle saved = vehicleRepository.save(vehicle);
        
        if ("O_TO".equalsIgnoreCase(saved.getType())) {
            apartment.setCarCount((apartment.getCarCount() == null ? 0 : apartment.getCarCount()) + 1);
        } else {
            apartment.setMotorbikeCount((apartment.getMotorbikeCount() == null ? 0 : apartment.getMotorbikeCount()) + 1);
        }
        apartmentRepository.save(apartment);
        
        return saved;
    }

    @Override
    @Transactional
    public void deleteVehicle(Long apartmentId, Long vehicleId) {
        Apartment apartment = getApartmentById(apartmentId);
        com.bluemoon.model.Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện với ID: " + vehicleId));
        if (!vehicle.getApartment().getId().equals(apartmentId)) {
            throw new IllegalArgumentException("Phương tiện không thuộc căn hộ này");
        }
        
        if ("O_TO".equalsIgnoreCase(vehicle.getType())) {
            int current = apartment.getCarCount() == null ? 0 : apartment.getCarCount();
            apartment.setCarCount(Math.max(0, current - 1));
        } else {
            int current = apartment.getMotorbikeCount() == null ? 0 : apartment.getMotorbikeCount();
            apartment.setMotorbikeCount(Math.max(0, current - 1));
        }
        apartmentRepository.save(apartment);
        
        vehicleRepository.delete(vehicle);
    }
}