package com.bluemoon.service;

import com.bluemoon.model.Fee;
import com.bluemoon.model.Resident;
import java.util.List;

public interface ResidentService {
    List<Resident> getAllResidents();

    List<Resident> getResidentsByApartmentId(Long apartmentId);

    Resident getResidentById(Long id);

    Resident addResidentToApartment(Long apartmentId, Resident resident);

    Resident updateResident(Long id, Resident residentDetails);

    void deleteResident(Long id);
}