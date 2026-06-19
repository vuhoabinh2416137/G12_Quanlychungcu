package com.bluemoon.service.impl;

import com.bluemoon.exception.DuplicateResourceException;
import com.bluemoon.exception.ResourceNotFoundException;
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
        if (idCard != null && !idCard.trim().isEmpty() && residentRepository.findByIdCard(idCard).isPresent()) {
            throw new DuplicateResourceException("CCCD/CMND này đã được đăng ký trong hệ thống!");
        }

        String phone = resident.getPhone();
        if (phone != null && !phone.trim().isEmpty() && residentRepository.findByPhone(phone).isPresent()) {
            throw new DuplicateResourceException("Số điện thoại này đã được đăng ký trong hệ thống!");
        }

        String email = resident.getEmail();
        if (email != null && !email.trim().isEmpty() && residentRepository.findByEmail(email).isPresent()) {
            throw new DuplicateResourceException("Email này đã được đăng ký trong hệ thống!");
        }

        if (apartment.getResidentCount() == null || apartment.getResidentCount() == 0) {
            if (!"CHU_HO".equals(resident.getRelationship())) {
                throw new IllegalArgumentException("Người đầu tiên vào ở căn hộ phải là Chủ hộ.");
            }
        }

        resident.setApartment(apartment);
        Resident saved = residentRepository.save(resident);

        apartment.setResidentCount((apartment.getResidentCount() != null ? apartment.getResidentCount() : 0) + 1);
        apartment.setStatus("OCCUPIED");
        apartmentRepository.save(apartment);

        return saved;
    }

    @Override
    @Transactional
    public Resident updateResident(Long id, Resident residentDetails) {
        Resident existingResident = getResidentById(id);

        String idCard = residentDetails.getIdCard();
        if (idCard != null && !idCard.trim().isEmpty() && !idCard.equals(existingResident.getIdCard()) && residentRepository.findByIdCard(idCard).isPresent()) {
            throw new DuplicateResourceException("CCCD/CMND này đã được đăng ký trong hệ thống!");
        }

        String phone = residentDetails.getPhone();
        if (phone != null && !phone.trim().isEmpty() && !phone.equals(existingResident.getPhone()) && residentRepository.findByPhone(phone).isPresent()) {
            throw new DuplicateResourceException("Số điện thoại này đã được đăng ký trong hệ thống!");
        }

        String email = residentDetails.getEmail();
        if (email != null && !email.trim().isEmpty() && !email.equals(existingResident.getEmail()) && residentRepository.findByEmail(email).isPresent()) {
            throw new DuplicateResourceException("Email này đã được đăng ký trong hệ thống!");
        }

        existingResident.setFullName(residentDetails.getFullName());
        existingResident.setDateOfBirth(residentDetails.getDateOfBirth());
        existingResident.setGender(residentDetails.getGender());
        existingResident.setPhone(residentDetails.getPhone());
        existingResident.setEmail(residentDetails.getEmail());
        existingResident.setRelationship(residentDetails.getRelationship());
        existingResident.setIdCard(residentDetails.getIdCard());

        return residentRepository.save(existingResident);
    }

    @Override
    @Transactional
    public void deleteResident(Long id) {
        Resident existingResident = getResidentById(id);
        Apartment apartment = existingResident.getApartment();
        
        residentRepository.delete(existingResident);

        int newCount = (apartment.getResidentCount() != null ? apartment.getResidentCount() : 1) - 1;
        if (newCount < 0) newCount = 0;
        apartment.setResidentCount(newCount);
        if (newCount == 0) {
            apartment.setStatus("VACANT");
        }
        apartmentRepository.save(apartment);
    }
}

