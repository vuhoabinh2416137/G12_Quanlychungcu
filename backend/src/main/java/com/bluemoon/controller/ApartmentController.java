package com.bluemoon.controller;

import com.bluemoon.dto.ApartmentResponseAdminDto;
import com.bluemoon.dto.ApartmentResponseUserDto;
import com.bluemoon.dto.mapper.ApartmentMapper;
import com.bluemoon.dto.request.ApartmentRequestDto;
import com.bluemoon.model.Apartment;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.ApartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartments")
public class ApartmentController {

    private final ApartmentService apartmentService;
    private final ApartmentMapper apartmentMapper;
    private final ResidentAccessService residentAccessService;

    public ApartmentController(
            ApartmentService apartmentService,
            ApartmentMapper apartmentMapper,
            ResidentAccessService residentAccessService
    ) {
        this.apartmentService = apartmentService;
        this.apartmentMapper = apartmentMapper;
        this.residentAccessService = residentAccessService;
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<List<ApartmentResponseAdminDto>> getAll(Authentication auth) {
        List<Apartment> list = apartmentService.getAllApartments();
        if (residentAccessService.isResident(auth)) {
            Long apartmentId = residentAccessService.getResidentApartmentId(auth);
            list = list.stream().filter(a -> apartmentId.equals(a.getId())).toList();
        }
        return ResponseEntity.ok(apartmentMapper.toAdminDtoList(list));
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<ApartmentResponseAdminDto> getById(
            @PathVariable Long id,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, id);
        return ResponseEntity.ok(apartmentMapper.toAdminDto(apartmentService.getApartmentById(id)));
    }

    @GetMapping("/{id}/info")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApartmentResponseUserDto> getInfoForResident(
            @PathVariable Long id,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, id);
        return ResponseEntity.ok(apartmentMapper.toUserDto(apartmentService.getApartmentById(id)));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApartmentResponseAdminDto> create(@Valid @RequestBody ApartmentRequestDto requestDto) {
        Apartment apartment = apartmentMapper.toEntity(requestDto);
        Apartment saved = apartmentService.createApartment(apartment);
        return ResponseEntity.status(HttpStatus.CREATED).body(apartmentMapper.toAdminDto(saved));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApartmentResponseAdminDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ApartmentRequestDto requestDto
    ) {
        Apartment existing = apartmentService.getApartmentById(id);
        apartmentMapper.updateEntityFromDto(requestDto, existing);
        Apartment updated = apartmentService.updateApartment(id, existing);
        return ResponseEntity.ok(apartmentMapper.toAdminDto(updated));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }
}
