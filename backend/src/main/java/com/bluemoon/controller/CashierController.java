package com.bluemoon.controller;

import com.bluemoon.dto.PaymentResponseAdminDto;
import com.bluemoon.dto.mapper.PaymentMapper;
import com.bluemoon.model.Payment;
import com.bluemoon.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cashier")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public class CashierController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    public CashierController(PaymentService paymentService, PaymentMapper paymentMapper) {
        this.paymentService = paymentService;
        this.paymentMapper = paymentMapper;
    }

    @GetMapping("/payments/pending")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentResponseAdminDto>> getPendingPayments() {
        return ResponseEntity.ok(paymentMapper.toAdminDtoList(paymentService.getPendingPayments()));
    }

    @PostMapping("/payments/{id}/confirm")
    @Transactional
    public ResponseEntity<PaymentResponseAdminDto> confirmPayment(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload
    ) {
        BigDecimal actualAmount = payload.get("actualAmount");
        if (actualAmount == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp số tiền thực nhận (actualAmount)");
        }
        Payment confirmed = paymentService.confirmPayment(id, actualAmount);
        return ResponseEntity.ok(paymentMapper.toAdminDto(confirmed));
    }
}
