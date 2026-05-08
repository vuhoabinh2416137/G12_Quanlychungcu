package com.bluemoon.service;

import com.bluemoon.model.Fee;
import java.util.List;

public interface FeeService {
    // Ban quản lý phát hành hóa đơn mới
    Fee createFee(Long apartmentId, Fee fee);

    // Cư dân xem toàn bộ hóa đơn của nhà mình
    List<Fee> getFeesByApartment(Long apartmentId);

    // Cư dân xem các hóa đơn CHƯA thanh toán
    List<Fee> getUnpaidFees(Long apartmentId);

    Fee getFeeById(Long id);

    // Cập nhật trạng thái hóa đơn (khi kế toán đối soát thủ công)
    Fee updateFeeStatus(Long feeId, Boolean isPaid);
    List<Fee> createFeeForAllApartments(Fee feeBase);

}