package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Fee;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.service.FeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class FeeServiceImpl implements FeeService {

    private final FeeRepository feeRepository;
    private final ApartmentRepository apartmentRepository;

    public FeeServiceImpl(FeeRepository feeRepository, ApartmentRepository apartmentRepository) {
        this.feeRepository = feeRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    @Transactional
    public Fee createFee(Long apartmentId, Fee fee) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy căn hộ!"));

        fee.setApartment(apartment);
        fee.setPaid(false); // Mặc định khi tạo mới là chưa thanh toán
        return feeRepository.save(fee);
    }

    @Override
    public List<Fee> getFeesByApartment(Long apartmentId) {
        return feeRepository.findByApartmentId(apartmentId);
    }

    @Override
    public List<Fee> getUnpaidFees(Long apartmentId) {
        return feeRepository.findByApartmentIdAndPaid(apartmentId, false);
    }

    @Override
    public Fee getFeeById(Long id) {
        return feeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản phí!"));
    }

    @Override
    @Transactional
    public Fee updateFeeStatus(Long feeId, Boolean isPaid) {
        Fee fee = getFeeById(feeId);
        fee.setPaid(isPaid);
        return feeRepository.save(fee);
    }
    @Override
    @Transactional
    public List<Fee> createFeeForAllApartments(Fee feeBase) {
        // 1. Lấy danh sách TẤT CẢ căn hộ có người ở
        List<Apartment> apartments =apartmentRepository.findByStatus("OCCUPIED");

        if (apartments.isEmpty()) {
            throw new RuntimeException("Không có căn hộ nào trong hệ thống để tạo phí!");
        }

        // 2. Khởi tạo danh sách các khoản phí cần lưu
        List<Fee> feesToSave = new ArrayList<>();

        for (Apartment apartment : apartments) {
            // Tạo một Object Fee mới cho từng căn hộ dựa trên thông tin gốc (feeBase)
            Fee newFee = new Fee();
            newFee.setApartment(apartment);
            newFee.setName(feeBase.getName());
            newFee.setDescription(feeBase.getDescription());
            newFee.setAmount(feeBase.getAmount());
            newFee.setType(feeBase.getType());
            newFee.setDueDate(feeBase.getDueDate());
            newFee.setPaid(false); // Mặc định là chưa thanh toán

            feesToSave.add(newFee);
        }

        // 3. Dùng saveAll() để lưu toàn bộ danh sách xuống Database cùng một lúc
        return feeRepository.saveAll(feesToSave);
    }
}