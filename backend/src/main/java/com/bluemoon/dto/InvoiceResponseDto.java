package com.bluemoon.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * DTO for {@link com.bluemoon.model.Invoice}
 */
public record InvoiceResponseDto(
        Long id,
        String invoiceNumber,
        Long apartmentId,
        String apartmentNumber,
        Long paymentId,
        BigDecimal totalAmount,
        Instant issuedDate,
        String status,
        List<FeeResponseUserDto> fees
) implements Serializable {
}
