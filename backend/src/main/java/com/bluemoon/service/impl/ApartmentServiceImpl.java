package com.bluemoon.service.impl;

import com.bluemoon.exception.DuplicateResourceException;
import com.bluemoon.exception.ResourceNotFoundException;
import com.bluemoon.model.Apartment;
import com.bluemoon.model.Resident;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.service.ApartmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApartmentServiceImpl implements ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;

    public ApartmentServiceImpl(ApartmentRepository apartmentRepository, ResidentRepository residentRepository) {
        this.apartmentRepository = apartmentRepository;
        this.residentRepository = residentRepository;
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
}