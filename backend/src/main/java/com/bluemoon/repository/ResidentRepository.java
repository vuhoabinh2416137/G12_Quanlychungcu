package com.bluemoon.repository;

import com.bluemoon.model.Resident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResidentRepository extends JpaRepository<Resident, Long> {
    List<Resident> findByApartment_Id(Long apartmentId);

    Optional<Resident> findByIdCard(String idCard);
}