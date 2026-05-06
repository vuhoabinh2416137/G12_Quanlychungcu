package com.bluemoon.controller;

import com.bluemoon.dto.ApartmentResponseAdminDto;
import com.bluemoon.dto.ApartmentResponseUserDto;
import com.bluemoon.dto.mapper.ApartmentMapper;
import com.bluemoon.dto.request.ApartmentRequestDto;
import com.bluemoon.model.Apartment;
import com.bluemoon.service.ApartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartments")
public class ApartmentController {

    private final ApartmentService apartmentService;
    private final ApartmentMapper apartmentMapper;

    public ApartmentController(ApartmentService apartmentService, ApartmentMapper apartmentMapper) {
        this.apartmentService = apartmentService;
        this.apartmentMapper = apartmentMapper;
    }

    // ADMIN + MANAGER: xem toàn bộ danh sách, đầy đủ thông tin
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ApartmentResponseAdminDto>> getAll() {
        List<Apartment> apartments = apartmentService.getAllApartments();
        return ResponseEntity.ok(apartmentMapper.toAdminDtoList(apartments));
    }

    // ADMIN + MANAGER: xem chi tiết 1 căn hộ
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApartmentResponseAdminDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(apartmentMapper.toAdminDto(apartmentService.getApartmentById(id)));
    }

    // RESIDENT: xem thông tin căn hộ của mình (ít field hơn)
    @GetMapping("/{id}/info")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApartmentResponseUserDto> getInfoForResident(@PathVariable Long id) {
        return ResponseEntity.ok(apartmentMapper.toUserDto(apartmentService.getApartmentById(id)));
    }

    // ADMIN: tạo căn hộ mới
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApartmentResponseAdminDto> create(@Valid @RequestBody ApartmentRequestDto requestDto) {
        Apartment apartment = apartmentMapper.toEntity(requestDto);
        Apartment saved = apartmentService.createApartment(apartment);
        return ResponseEntity.status(HttpStatus.CREATED).body(apartmentMapper.toAdminDto(saved));
    }

    // ADMIN: cập nhật căn hộ
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApartmentResponseAdminDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ApartmentRequestDto requestDto) {
        Apartment existing = apartmentService.getApartmentById(id);
        apartmentMapper.updateEntityFromDto(requestDto, existing); // mapper ghi đè, giữ apartmentNumber
        Apartment updated = apartmentService.updateApartment(id, existing);
        return ResponseEntity.ok(apartmentMapper.toAdminDto(updated));
    }

    // ADMIN: xóa căn hộ
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }
}
