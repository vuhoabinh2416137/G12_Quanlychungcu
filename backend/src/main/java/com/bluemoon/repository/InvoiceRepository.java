package com.bluemoon.repository;

import com.bluemoon.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByApartmentId(Long apartmentId);
    Optional<Invoice> findByApartmentIdAndStatus(Long apartmentId, String status);
}
