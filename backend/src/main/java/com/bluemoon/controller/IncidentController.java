package com.bluemoon.controller;

import com.bluemoon.dto.IncidentResponseAdminDto;
import com.bluemoon.dto.IncidentResponseUserDto;
import com.bluemoon.dto.mapper.IncidentMapper;
import com.bluemoon.dto.request.IncidentRequestDto;
import com.bluemoon.model.Incident;
import com.bluemoon.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;
    private final IncidentMapper incidentMapper;

    public IncidentController(IncidentService incidentService, IncidentMapper incidentMapper) {
        this.incidentService = incidentService;
        this.incidentMapper = incidentMapper;
    }

    // ADMIN + MANAGER: xem tất cả sự cố đang PENDING cần xử lý
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<IncidentResponseAdminDto>> getPending() {
        return ResponseEntity.ok(incidentMapper.toAdminDtoList(incidentService.getPendingIncidents()));
    }

    // ADMIN + MANAGER: xem tất cả sự cố của 1 căn hộ
    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<IncidentResponseAdminDto>> getByApartment(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(
                incidentMapper.toAdminDtoList(incidentService.getIncidentsByApartment(apartmentId)));
    }

    // RESIDENT: xem sự cố của căn hộ mình (không thấy apartmentId, building)
    @GetMapping("/apartment/{apartmentId}/my")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<IncidentResponseUserDto>> getByApartmentForResident(
            @PathVariable Long apartmentId) {
        return ResponseEntity.ok(
                incidentMapper.toUserDtoList(incidentService.getIncidentsByApartment(apartmentId)));
    }

    // RESIDENT + ADMIN: báo sự cố mới — status tự động PENDING
    @PostMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<IncidentResponseUserDto> report(
            @PathVariable Long apartmentId,
            @Valid @RequestBody IncidentRequestDto requestDto) {
        Incident incident = incidentMapper.toEntity(requestDto);
        Incident saved = incidentService.reportIncident(apartmentId, incident);
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentMapper.toUserDto(saved));
    }

    // ADMIN + MANAGER: cập nhật trạng thái xử lý sự cố
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<IncidentResponseAdminDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Incident updated = incidentService.updateIncidentStatus(id, status);
        return ResponseEntity.ok(incidentMapper.toAdminDto(updated));
    }
}
