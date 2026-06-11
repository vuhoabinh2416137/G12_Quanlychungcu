package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Fee;
import com.bluemoon.model.Invoice;
import com.bluemoon.model.Payment;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.InvoiceRepository;
import com.bluemoon.repository.PaymentRepository;
import com.bluemoon.service.InvoiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;
    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              ApartmentRepository apartmentRepository,
                              PaymentRepository paymentRepository,
                              FeeRepository feeRepository) {
        this.invoiceRepository = invoiceRepository;
        this.apartmentRepository = apartmentRepository;
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
    }

    @Override
    public void addFeeToCurrentInvoice(Long apartmentId, Fee fee) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with id: " + apartmentId));

        // Find current UNPAID invoice or create a new one
        Optional<Invoice> currentInvoiceOpt = invoiceRepository.findByApartmentIdAndStatus(apartmentId, "UNPAID");
        Invoice invoice;

        if (currentInvoiceOpt.isPresent()) {
            invoice = currentInvoiceOpt.get();
        } else {
            invoice = new Invoice();
            invoice.setApartment(apartment);
            invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            invoice.setIssuedDate(Instant.now());
            invoice.setStatus("UNPAID");
            invoice.setTotalAmount(BigDecimal.ZERO);
            invoice = invoiceRepository.save(invoice);
        }

        // Link the fee to the invoice
        fee.setInvoice(invoice);
        
        // Update total amount
        BigDecimal newTotal = invoice.getTotalAmount().add(fee.getAmount());
        invoice.setTotalAmount(newTotal);

        invoiceRepository.save(invoice);
    }

    @Override
    public Invoice updateInvoicePayment(Long invoiceId, Long paymentId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        invoice.setPaymentId(paymentId);
        invoice.setStatus("PAID");
        
        // Mark all fees as paid
        for (Fee fee : invoice.getFees()) {
            fee.setPaid(true);
            feeRepository.save(fee);
        }

        return invoiceRepository.save(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByApartment(Long apartmentId) {
        return invoiceRepository.findByApartmentId(apartmentId);
    }
}
