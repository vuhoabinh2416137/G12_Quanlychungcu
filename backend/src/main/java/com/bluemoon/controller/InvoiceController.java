package com.bluemoon.controller;

import com.bluemoon.dto.InvoiceResponseDto;
import com.bluemoon.dto.mapper.InvoiceMapper;
import com.bluemoon.model.Invoice;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoiceMapper invoiceMapper;
    private final ResidentAccessService residentAccessService;

    public InvoiceController(
            InvoiceService invoiceService,
            InvoiceMapper invoiceMapper,
            ResidentAccessService residentAccessService
    ) {
        this.invoiceService = invoiceService;
        this.invoiceMapper = invoiceMapper;
        this.residentAccessService = residentAccessService;
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<InvoiceResponseDto>> getAllInvoices() {
        return ResponseEntity.ok(invoiceMapper.toDtoList(invoiceService.getAllInvoices()));
    }

    @GetMapping("/apartment/{apartmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<List<InvoiceResponseDto>> getInvoicesByApartment(
            @PathVariable Long apartmentId,
            Authentication auth
    ) {
        residentAccessService.ensureResidentApartmentAccess(auth, apartmentId);
        return ResponseEntity.ok(invoiceMapper.toDtoList(invoiceService.getInvoicesByApartment(apartmentId)));
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RESIDENT')")
    public ResponseEntity<InvoiceResponseDto> getInvoiceById(
            @PathVariable Long id,
            Authentication auth
    ) {
        Invoice invoice = invoiceService.getInvoiceById(id);
        residentAccessService.ensureResidentInvoiceAccess(auth, invoice);
        return ResponseEntity.ok(invoiceMapper.toDto(invoice));
    }

    @PatchMapping("/{id}/payment")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InvoiceResponseDto> updateInvoicePayment(
            @PathVariable Long id,
            @RequestParam Long paymentId
    ) {
        return ResponseEntity.ok(invoiceMapper.toDto(invoiceService.updateInvoicePayment(id, paymentId)));
    }
}
