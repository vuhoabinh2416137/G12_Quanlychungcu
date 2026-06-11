package com.bluemoon.controller;

import com.bluemoon.dto.ResidentResponseAdminDto;
import com.bluemoon.dto.ResidentResponseUserDto;
import com.bluemoon.dto.mapper.ResidentMapper;
import com.bluemoon.dto.request.ResidentRequestDto;
import com.bluemoon.model.Resident;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.ResidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

    private final ResidentService residentService;
    private final ResidentMapper residentMapper;
    private final ResidentAccessService residentAccessService;

    public ResidentController(
            ResidentService residentService,
            ResidentMapper residentMapper,
            ResidentAccessService residentAccessService
    ) {
        this.residentService = residentService;
        this.residentMapper = residentMapper;
        this.residentAccessService = residentAccessService;
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<List<ResidentResponseAdminDto>> getAll(Authentication auth) {
        List<Resident> list;
        if (residentAccessService.isResident(auth)) {
            Long apartmentId = residentAccessService.getResidentApartmentId(auth);
            list = residentService.getResidentsByApartmentId(apartmentId);
        } else {
            list = residentService.getAllResidents();
        }
        return ResponseEntity.ok(residentMapper.toAdminDtoList(list));
    }

    @GetMapping("/apartment/{apartmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<List<ResidentResponseAdminDto>> getByApartment(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(residentMapper.toAdminDtoList(residentService.getResidentsByApartmentId(apartmentId)));
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<ResidentResponseAdminDto> getById(
            @PathVariable Long id,
            Authentication auth
    ) {
        Resident resident = residentService.getResidentById(id);
        if (residentAccessService.isResident(auth)) {
            Long apartmentId = resident.getApartment() != null ? resident.getApartment().getId() : null;
            residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        }
        return ResponseEntity.ok(residentMapper.toAdminDto(resident));
    }

    @GetMapping("/apartment/{apartmentId}/members")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<ResidentResponseUserDto>> getMembersForResident(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(residentMapper.toUserDtoList(residentService.getResidentsByApartmentId(apartmentId)));
    }

    @PostMapping("/apartment/{apartmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResidentResponseAdminDto> addToApartment(
            @PathVariable Long apartmentId,
            @Valid @RequestBody ResidentRequestDto requestDto
    ) {
        Resident resident = residentMapper.toEntity(requestDto);
        Resident saved = residentService.addResidentToApartment(apartmentId, resident);
        return ResponseEntity.status(HttpStatus.CREATED).body(residentMapper.toAdminDto(saved));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResidentResponseAdminDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ResidentRequestDto requestDto
    ) {
        Resident existing = residentService.getResidentById(id);
        residentMapper.updateEntityFromDto(requestDto, existing);
        Resident updated = residentService.updateResident(id, existing);
        return ResponseEntity.ok(residentMapper.toAdminDto(updated));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        residentService.deleteResident(id);
        return ResponseEntity.noContent().build();
    }
}
