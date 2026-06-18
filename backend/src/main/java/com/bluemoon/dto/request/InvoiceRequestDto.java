package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class InvoiceRequestDto {
    @NotNull(message = "Fee ID không được để trống")
    private Long feeId;

    private Long paymentId; // Có thể null nếu hóa đơn chưa được thanh toán

    @NotNull(message = "Tổng tiền không được để trống")
    private BigDecimal totalAmount;

    public Long getFeeId() {
        return feeId;
    }

    public void setFeeId(Long feeId) {
        this.feeId = feeId;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
