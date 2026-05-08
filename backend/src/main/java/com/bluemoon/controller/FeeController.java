package com.bluemoon.controller;

import com.bluemoon.dto.FeeResponseAdminDto;
import com.bluemoon.dto.FeeResponseUserDto;
import com.bluemoon.dto.mapper.FeeMapper;
import com.bluemoon.dto.request.FeeRequestDto;
import com.bluemoon.model.Fee;
import com.bluemoon.service.FeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;
    private final FeeMapper feeMapper;

    public FeeController(FeeService feeService, FeeMapper feeMapper) {
        this.feeService = feeService;
        this.feeMapper = feeMapper;
    }

    // ADMIN + MANAGER: xem tất cả phí của 1 căn hộ (có type, apartmentNumber)
    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<FeeResponseAdminDto>> getByApartment(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(feeMapper.toAdminDtoList(feeService.getFeesByApartment(apartmentId)));
    }

    // RESIDENT: xem phí của căn hộ mình (ẩn type)
    @GetMapping("/apartment/{apartmentId}/my")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<FeeResponseUserDto>> getByApartmentForResident(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(feeMapper.toUserDtoList(feeService.getFeesByApartment(apartmentId)));
    }

    // RESIDENT: xem các phí chưa thanh toán của căn hộ mình
    @GetMapping("/apartment/{apartmentId}/unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<List<FeeResponseUserDto>> getUnpaid(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(feeMapper.toUserDtoList(feeService.getUnpaidFees(apartmentId)));
    }

    // ADMIN + MANAGER: xem chi tiết 1 khoản phí
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FeeResponseAdminDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(feeMapper.toAdminDto(feeService.getFeeById(id)));
    }

    // ADMIN: tạo phí cho 1 căn hộ cụ thể
    @PostMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeResponseAdminDto> createForApartment(
            @PathVariable Long apartmentId,
            @Valid @RequestBody FeeRequestDto requestDto) {
        Fee fee = feeMapper.toEntity(requestDto);
        Fee saved = feeService.createFee(apartmentId, fee);
        return ResponseEntity.status(HttpStatus.CREATED).body(feeMapper.toAdminDto(saved));
    }

    // ADMIN: tạo phí hàng loạt cho tất cả căn hộ OCCUPIED
    @PostMapping("/all-apartments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeResponseAdminDto>> createForAllApartments(
            @Valid @RequestBody FeeRequestDto requestDto) {
        Fee feeBase = feeMapper.toEntity(requestDto);
        List<Fee> saved = feeService.createFeeForAllApartments(feeBase);
        return ResponseEntity.status(HttpStatus.CREATED).body(feeMapper.toAdminDtoList(saved));
    }

    // ADMIN + MANAGER: cập nhật trạng thái thanh toán
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FeeResponseAdminDto> updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean paid) {
        Fee updated = feeService.updateFeeStatus(id, paid);
        return ResponseEntity.ok(feeMapper.toAdminDto(updated));
    }

    // ADMIN: cập nhật thông tin khoản phí
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeResponseAdminDto> update(
            @PathVariable Long id,
            @Valid @RequestBody FeeRequestDto requestDto) {
        Fee existing = feeService.getFeeById(id);
        feeMapper.updateEntityFromDto(requestDto, existing); // paid và apartment giữ nguyên
        Fee updated = feeService.createFee(existing.getApartment().getId(), existing);
        return ResponseEntity.ok(feeMapper.toAdminDto(updated));
    }
}
