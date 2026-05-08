package com.bluemoon.controller;

import com.bluemoon.dto.PaymentResponseAdminDto;
import com.bluemoon.dto.PaymentResponseUserDto;
import com.bluemoon.dto.mapper.PaymentMapper;
import com.bluemoon.dto.request.PaymentRequestDto;
import com.bluemoon.model.Payment;
import com.bluemoon.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    public PaymentController(PaymentService paymentService, PaymentMapper paymentMapper) {
        this.paymentService = paymentService;
        this.paymentMapper = paymentMapper;
    }

    // ADMIN + MANAGER: xem lịch sử thanh toán của 1 khoản phí (có note, apartmentNumber)
    // @Transactional vì Payment.fee là LAZY — cần trong session để mapper truy cập fee.name
    @GetMapping("/fee/{feeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseAdminDto>> getHistoryForAdmin(@PathVariable Long feeId) {
        return ResponseEntity.ok(
                paymentMapper.toAdminDtoList(paymentService.getPaymentHistory(feeId)));
    }

    // RESIDENT: xem lịch sử thanh toán của mình (ẩn note)
    @GetMapping("/fee/{feeId}/my")
    @PreAuthorize("hasRole('RESIDENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseUserDto>> getHistoryForResident(@PathVariable Long feeId) {
        return ResponseEntity.ok(
                paymentMapper.toUserDtoList(paymentService.getPaymentHistory(feeId)));
    }

    // ADMIN + MANAGER: thực hiện thanh toán cho 1 khoản phí
    @PostMapping("/fee/{feeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public ResponseEntity<PaymentResponseAdminDto> process(
            @PathVariable Long feeId,
            @Valid @RequestBody PaymentRequestDto requestDto) {
        Payment payment = paymentMapper.toEntity(requestDto);
        Payment saved = paymentService.processPayment(feeId, payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMapper.toAdminDto(saved));
    }
}
