package com.bluemoon.controller;

import com.bluemoon.dto.ResidentResponseAdminDto;
import com.bluemoon.dto.ResidentResponseUserDto;
import com.bluemoon.dto.mapper.ResidentMapper;
import com.bluemoon.dto.request.ResidentRequestDto;
import com.bluemoon.model.Resident;
import com.bluemoon.service.ResidentService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

    private final ResidentService residentService;
    private final ResidentMapper residentMapper;

    public ResidentController(ResidentService residentService, ResidentMapper residentMapper) {
        this.residentService = residentService;
        this.residentMapper = residentMapper;
    }

    // ADMIN + MANAGER: xem toàn bộ cư dân, đầy đủ thông tin (có CCCD, email)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ResidentResponseAdminDto>> getAll() {
        return ResponseEntity.ok(residentMapper.toAdminDtoList(residentService.getAllResidents()));
    }

    // ADMIN + MANAGER: xem cư dân theo căn hộ
    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ResidentResponseAdminDto>> getByApartment(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(
                residentMapper.toAdminDtoList(residentService.getResidentsByApartmentId(apartmentId)));
    }

    // ADMIN + MANAGER: xem chi tiết 1 cư dân
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResidentResponseAdminDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(residentMapper.toAdminDto(residentService.getResidentById(id)));
    }

    // RESIDENT: xem danh sách thành viên trong căn hộ (ẩn CCCD, email, ngày sinh)
    @GetMapping("/apartment/{apartmentId}/members")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<ResidentResponseUserDto>> getMembersForResident(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(
                residentMapper.toUserDtoList(residentService.getResidentsByApartmentId(apartmentId)));
    }

    // ADMIN: thêm cư dân vào căn hộ
    @PostMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResidentResponseAdminDto> addToApartment(
            @PathVariable Long apartmentId,
            @Valid @RequestBody ResidentRequestDto requestDto) {
        Resident resident = residentMapper.toEntity(requestDto);
        Resident saved = residentService.addResidentToApartment(apartmentId, resident);
        return ResponseEntity.status(HttpStatus.CREATED).body(residentMapper.toAdminDto(saved));
    }

    // ADMIN: cập nhật thông tin cư dân
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResidentResponseAdminDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ResidentRequestDto requestDto) {
        Resident existing = residentService.getResidentById(id);
        residentMapper.updateEntityFromDto(requestDto, existing); // idCard tự động bị ignore trong mapper
        Resident updated = residentService.updateResident(id, existing);
        return ResponseEntity.ok(residentMapper.toAdminDto(updated));
    }

    // ADMIN: xóa cư dân
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        residentService.deleteResident(id);
        return ResponseEntity.noContent().build();
    }
}
