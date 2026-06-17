package com.bluemoon.controller;

import com.bluemoon.dto.PaymentResponseAdminDto;
import com.bluemoon.dto.PaymentResponseUserDto;
import com.bluemoon.dto.mapper.PaymentMapper;
import com.bluemoon.dto.request.PaymentRequestDto;
import com.bluemoon.model.Fee;
import com.bluemoon.model.Payment;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;
    private final FeeRepository feeRepository;
    private final ResidentAccessService residentAccessService;

    public PaymentController(
            PaymentService paymentService,
            PaymentMapper paymentMapper,
            FeeRepository feeRepository,
            ResidentAccessService residentAccessService
    ) {
        this.paymentService = paymentService;
        this.paymentMapper = paymentMapper;
        this.feeRepository = feeRepository;
        this.residentAccessService = residentAccessService;
    }

    @GetMapping("/fee/{feeId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseAdminDto>> getHistoryForAdmin(@PathVariable Long feeId) {
        return ResponseEntity.ok(paymentMapper.toAdminDtoList(paymentService.getPaymentHistory(feeId)));
    }

    @GetMapping("/fee/{feeId}/my")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('RESIDENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseUserDto>> getHistoryForResident(
            @PathVariable Long feeId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentFeeAccess(auth, getFeeOrThrow(feeId));
        return ResponseEntity.ok(paymentMapper.toUserDtoList(paymentService.getPaymentHistory(feeId)));
    }

    @PostMapping("/fee/{feeId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    @Transactional
    public ResponseEntity<PaymentResponseAdminDto> process(
            @PathVariable Long feeId,
            @Valid @RequestBody PaymentRequestDto requestDto,
            Authentication auth
    ) {
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RESIDENT"))) {
            residentAccessService.ensureResidentFeeAccess(auth, getFeeOrThrow(feeId));
        }
        Payment payment = paymentMapper.toEntity(requestDto);
        Payment saved = paymentService.processPayment(feeId, payment, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMapper.toAdminDto(saved));
    }

    @GetMapping("/apartment/{apartmentId}/history")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseAdminDto>> getHistoryByApartmentForAdmin(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(paymentMapper.toAdminDtoList(paymentService.getPaymentsByApartmentHistory(apartmentId)));
    }

    @GetMapping("/apartment/{apartmentId}/history/my")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('RESIDENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseUserDto>> getHistoryByApartmentForResident(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(paymentMapper.toUserDtoList(paymentService.getPaymentsByApartmentHistory(apartmentId)));
    }

    @PostMapping("/{id}/refund-info")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('RESIDENT')")
    @Transactional
    public ResponseEntity<PaymentResponseUserDto> submitRefundInfo(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload
    ) {
        String bankName = payload.get("bankName");
        String accountNumber = payload.get("accountNumber");
        String accountName = payload.get("accountName");
        
        if (bankName == null || accountNumber == null || accountName == null) {
            return ResponseEntity.badRequest().build();
        }

        Payment saved = paymentService.submitRefundInfo(id, bankName, accountNumber, accountName);
        return ResponseEntity.ok(paymentMapper.toUserDto(saved));
    }

    @PostMapping("/{id}/confirm-refund")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    @Transactional
    public ResponseEntity<PaymentResponseAdminDto> confirmRefund(@PathVariable Long id) {
        Payment saved = paymentService.confirmRefund(id);
        return ResponseEntity.ok(paymentMapper.toAdminDto(saved));
    }

    @GetMapping("/refunds")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseAdminDto>> getRefundPayments() {
        return ResponseEntity.ok(paymentMapper.toAdminDtoList(paymentService.getRefundPayments()));
    }

    private Fee getFeeOrThrow(Long feeId) {
        return feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));
    }
}
