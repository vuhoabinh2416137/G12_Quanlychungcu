package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Resident;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.service.ResidentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResidentServiceImpl implements ResidentService {
    private final ResidentRepository residentRepository;
    private final ApartmentRepository apartmentRepository;

    public ResidentServiceImpl(ResidentRepository residentRepository, ApartmentRepository apartmentRepository) {
        this.residentRepository = residentRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    public List<Resident> getAllResidents() {
        return residentRepository.findAll();
    }

    @Override
    public List<Resident> getResidentsByApartmentId(Long apartmentId) {
        return residentRepository.findByApartment_Id(apartmentId);
    }

    @Override
    public Resident getResidentById(Long id) {
        return residentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident not found with id: " + id));
    }

    @Override
    public Resident getResidentByPhone(String phone) {
        return residentRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Resident not found with phone: " + phone));
    }

    @Override
    @Transactional
    public Resident addResidentToApartment(Long apartmentId, Resident resident) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy căn hộ với ID: " + apartmentId));

        String idCard = resident.getIdCard();
        if (idCard != null && residentRepository.findByIdCard(idCard).isPresent()) {
            throw new DuplicateResourceException("CCCD/CMND này đã được đăng ký trong hệ thống!");
        }

        resident.setApartment(apartment);
        return residentRepository.save(resident);
    }

    @Override
    @Transactional
    public Resident updateResident(Long id, Resident residentDetails) {
        Resident existingResident = getResidentById(id);

        existingResident.setFullName(residentDetails.getFullName());
        existingResident.setDateOfBirth(residentDetails.getDateOfBirth());
        existingResident.setGender(residentDetails.getGender());
        existingResident.setPhone(residentDetails.getPhone());
        existingResident.setEmail(residentDetails.getEmail());
        existingResident.setRelationship(residentDetails.getRelationship());

        return residentRepository.save(existingResident);
    }

    @Override
    @Transactional
    public void deleteResident(Long id) {
        Resident existingResident = getResidentById(id);
        residentRepository.delete(existingResident);
    }
}

