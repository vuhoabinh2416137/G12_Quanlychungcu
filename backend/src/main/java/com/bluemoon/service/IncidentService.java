package com.bluemoon.service;

import com.bluemoon.model.Incident;
import java.util.List;

public interface IncidentService {
    // Cư dân báo cáo sự cố
    Incident reportIncident(Long apartmentId, Incident incident);

    // Cư dân xem các sự cố nhà mình đã báo
    List<Incident> getIncidentsByApartment(Long apartmentId);

    // Ban quản lý xem các sự cố đang chờ xử lý
    List<Incident> getPendingIncidents();

    // Kỹ thuật viên/BQL cập nhật trạng thái (PENDING -> PROCESSING -> RESOLVED)
    Incident updateIncidentStatus(Long incidentId, String status);
}