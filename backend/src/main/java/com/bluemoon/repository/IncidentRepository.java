package com.bluemoon.repository;

import com.bluemoon.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    // Lấy các sự cố do 1 căn hộ báo cáo
    List<Incident> findByApartmentId(Long apartmentId);

    // Lọc sự cố theo trạng thái (VD: Lấy các sự cố 'PENDING' để ban quản lý xử lý)
    List<Incident> findByStatus(String status);
}