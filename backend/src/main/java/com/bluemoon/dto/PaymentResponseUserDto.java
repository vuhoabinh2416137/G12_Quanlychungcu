package com.bluemoon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for {@link com.bluemoon.model.Payment}
 */
public record PaymentResponseUserDto(
        Long id,  
        Long feeId,
        String feeName,
        BigDecimal amount, 
        Instant paymentDate,
        Instant transferTime,
        String method, 
        String status,
        String receiptNumber,
        BigDecimal refundAmount,
        String refundBank,
        String refundAccountNumber,
        String refundAccountName,
        String refundStatus
) implements Serializable {}