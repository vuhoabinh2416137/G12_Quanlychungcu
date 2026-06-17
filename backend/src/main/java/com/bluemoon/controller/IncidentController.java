package com.bluemoon.controller;

import com.bluemoon.dto.IncidentResponseAdminDto;
import com.bluemoon.dto.IncidentResponseUserDto;
import com.bluemoon.dto.mapper.IncidentMapper;
import com.bluemoon.dto.request.IncidentRequestDto;
import com.bluemoon.model.Incident;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;
    private final IncidentMapper incidentMapper;
    private final ResidentAccessService residentAccessService;

    public IncidentController(
            IncidentService incidentService,
            IncidentMapper incidentMapper,
            ResidentAccessService residentAccessService
    ) {
        this.incidentService = incidentService;
        this.incidentMapper = incidentMapper;
        this.residentAccessService = residentAccessService;
    }

    @GetMapping("/pending")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<List<IncidentResponseAdminDto>> getPending() {
        return ResponseEntity.ok(incidentMapper.toAdminDtoList(incidentService.getPendingIncidents()));
    }

    @GetMapping("/apartment/{apartmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<List<IncidentResponseAdminDto>> getByApartment(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(incidentMapper.toAdminDtoList(incidentService.getIncidentsByApartment(apartmentId)));
    }

    @GetMapping("/apartment/{apartmentId}/my")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<IncidentResponseUserDto>> getByApartmentForResident(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(incidentMapper.toUserDtoList(incidentService.getIncidentsByApartment(apartmentId)));
    }

    @PostMapping("/apartment/{apartmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<IncidentResponseUserDto> report(
            @PathVariable Long apartmentId,
            @Valid @RequestBody IncidentRequestDto requestDto,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        Incident incident = incidentMapper.toEntity(requestDto);
        Incident saved = incidentService.reportIncident(apartmentId, incident);
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentMapper.toUserDto(saved));
    }

    @PatchMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<IncidentResponseAdminDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        Incident updated = incidentService.updateIncidentStatus(id, status);
        return ResponseEntity.ok(incidentMapper.toAdminDto(updated));
    }
}
