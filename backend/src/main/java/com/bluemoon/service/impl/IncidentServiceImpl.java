package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Incident;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.IncidentRepository;
import com.bluemoon.service.IncidentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final ApartmentRepository apartmentRepository;
    public IncidentServiceImpl(IncidentRepository incidentRepository, ApartmentRepository apartmentRepository) {
        this.incidentRepository = incidentRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    @Transactional
    public Incident reportIncident(Long apartmentId, Incident incident) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy căn hộ với ID: " + apartmentId));

        incident.setApartment(apartment);
        incident.setStatus("PENDING"); // trạng thái mặc định
        return incidentRepository.save(incident);
    }

    @Override
    public List<Incident> getIncidentsByApartment(Long apartmentId) {
        return incidentRepository.findByApartmentId(apartmentId);
    }

    @Override
    public List<Incident> getPendingIncidents() {
        return incidentRepository.findByStatus("PENDING");
    }

    @Override
    @Transactional
    public Incident updateIncidentStatus(Long incidentId, String status) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự cố!"));

        incident.setStatus(status);
        return incidentRepository.save(incident);
    }
}