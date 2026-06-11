package com.bluemoon.service;

import com.bluemoon.model.Fee;
import com.bluemoon.model.Invoice;
import java.util.List;

public interface InvoiceService {
    // Thêm phí vào hóa đơn UNPAID hiện tại của căn hộ. Tự sinh hóa đơn nếu chưa có.
    void addFeeToCurrentInvoice(Long apartmentId, Fee fee);

    // Cập nhật hóa đơn khi có thanh toán
    Invoice updateInvoicePayment(Long invoiceId, Long paymentId);

    // Lấy thông tin hóa đơn theo ID
    Invoice getInvoiceById(Long id);

    // Lấy tất cả hóa đơn
    List<Invoice> getAllInvoices();

    // Lấy hóa đơn theo căn hộ
    List<Invoice> getInvoicesByApartment(Long apartmentId);
}
