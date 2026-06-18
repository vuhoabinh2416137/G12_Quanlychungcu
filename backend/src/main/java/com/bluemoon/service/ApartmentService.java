package com.bluemoon.service;

import com.bluemoon.model.Apartment;
import java.util.List;

public interface ApartmentService {
    List<Apartment> getAllApartments();

    Apartment getApartmentById(Long id);

    Apartment getApartmentByNumber(String apartmentNumber);

    Apartment createApartment(Apartment apartment);

    Apartment updateApartment(Long id, Apartment apartmentDetails);

    void deleteApartment(Long id);

    List<com.bluemoon.model.Vehicle> getVehiclesByApartmentId(Long id);
}