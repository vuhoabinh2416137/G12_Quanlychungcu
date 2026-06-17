package com.bluemoon.controller;

import com.bluemoon.dto.FeeResponseAdminDto;
import com.bluemoon.dto.FeeResponseUserDto;
import com.bluemoon.dto.mapper.FeeMapper;
import com.bluemoon.dto.request.FeeRequestDto;
import com.bluemoon.model.Fee;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.FeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;
    private final FeeMapper feeMapper;
    private final ResidentAccessService residentAccessService;

    public FeeController(
            FeeService feeService,
            FeeMapper feeMapper,
            ResidentAccessService residentAccessService
    ) {
        this.feeService = feeService;
        this.feeMapper = feeMapper;
        this.residentAccessService = residentAccessService;
    }

    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<List<FeeResponseAdminDto>> getByApartment(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(feeMapper.toAdminDtoList(feeService.getFeesByApartment(apartmentId)));
    }

    @GetMapping("/apartment/{apartmentId}/my")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<FeeResponseUserDto>> getByApartmentForResident(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(feeMapper.toUserDtoList(feeService.getFeesByApartment(apartmentId)));
    }

    @GetMapping("/apartment/{apartmentId}/unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<List<FeeResponseUserDto>> getUnpaid(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(feeMapper.toUserDtoList(feeService.getUnpaidFees(apartmentId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<FeeResponseAdminDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(feeMapper.toAdminDto(feeService.getFeeById(id)));
    }

    @PostMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<FeeResponseAdminDto> createForApartment(
            @PathVariable Long apartmentId,
            @Valid @RequestBody FeeRequestDto requestDto
    ) {
        Fee fee = feeMapper.toEntity(requestDto);
        Fee saved = feeService.createFee(apartmentId, fee);
        return ResponseEntity.status(HttpStatus.CREATED).body(feeMapper.toAdminDto(saved));
    }

    @PostMapping("/all-apartments")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<List<FeeResponseAdminDto>> createForAllApartments(
            @Valid @RequestBody FeeRequestDto requestDto
    ) {
        Fee feeBase = feeMapper.toEntity(requestDto);
        List<Fee> saved = feeService.createFeeForAllApartments(feeBase);
        return ResponseEntity.status(HttpStatus.CREATED).body(feeMapper.toAdminDtoList(saved));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<FeeResponseAdminDto> updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean paid
    ) {
        Fee updated = feeService.updateFeeStatus(id, paid);
        return ResponseEntity.ok(feeMapper.toAdminDto(updated));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<FeeResponseAdminDto> update(
            @PathVariable Long id,
            @Valid @RequestBody FeeRequestDto requestDto
    ) {
        Fee existing = feeService.getFeeById(id);
        feeMapper.updateEntityFromDto(requestDto, existing);
        Fee updated = feeService.createFee(existing.getApartment().getId(), existing);
        return ResponseEntity.ok(feeMapper.toAdminDto(updated));
    }
}
