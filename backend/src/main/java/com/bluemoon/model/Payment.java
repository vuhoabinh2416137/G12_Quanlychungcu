package com.bluemoon.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payments")
public class Payment {

    // ==================== Fields ====================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "fee_id")
    private Fee fee;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "payer_id")
    private User payer;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @ColumnDefault("CURRENT_TIMESTAMP(6)")
    @Column(name = "payment_date")
    private Instant paymentDate;

    @Column(name = "transfer_time")
    private Instant transferTime;

    @Size(max = 50)
    @Column(name = "method", length = 50)
    private String method;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Size(max = 20)
    @ColumnDefault("'COMPLETED'")
    @Column(name = "status", length = 20)
    private String status;

    @Size(max = 50)
    @Column(name = "receipt_number", length = 50, unique = true)
    private String receiptNumber;

    @Column(name = "refund_amount", precision = 15, scale = 2)
    private BigDecimal refundAmount;

    @Size(max = 100)
    @Column(name = "refund_bank", length = 100)
    private String refundBank;

    @Size(max = 50)
    @Column(name = "refund_account_number", length = 50)
    private String refundAccountNumber;

    @Size(max = 100)
    @Column(name = "refund_account_name", length = 100)
    private String refundAccountName;

    @Size(max = 20)
    @Column(name = "refund_status", length = 20)
    private String refundStatus;

    // ==================== Getters & Setters ====================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Fee getFee() {
        return fee;
    }

    public void setFee(Fee fee) {
        this.fee = fee;
    }

    public User getPayer() {
        return payer;
    }

    public void setPayer(User payer) {
        this.payer = payer;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Instant paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Instant getTransferTime() {
        return transferTime;
    }

    public void setTransferTime(Instant transferTime) {
        this.transferTime = transferTime;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getRefundBank() {
        return refundBank;
    }

    public void setRefundBank(String refundBank) {
        this.refundBank = refundBank;
    }

    public String getRefundAccountNumber() {
        return refundAccountNumber;
    }

    public void setRefundAccountNumber(String refundAccountNumber) {
        this.refundAccountNumber = refundAccountNumber;
    }

    public String getRefundAccountName() {
        return refundAccountName;
    }

    public void setRefundAccountName(String refundAccountName) {
        this.refundAccountName = refundAccountName;
    }

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }
}
