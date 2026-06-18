package com.bluemoon.service.impl;

import com.bluemoon.model.Apartment;
import com.bluemoon.model.Fee;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.FeeRepository;
import com.bluemoon.service.FeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class FeeServiceImpl implements FeeService {

    private final FeeRepository feeRepository;
    private final ApartmentRepository apartmentRepository;
    private final com.bluemoon.repository.VehicleRepository vehicleRepository;
    private final com.bluemoon.repository.SystemConfigRepository systemConfigRepository;

    public FeeServiceImpl(FeeRepository feeRepository, 
                          ApartmentRepository apartmentRepository,
                          com.bluemoon.repository.VehicleRepository vehicleRepository,
                          com.bluemoon.repository.SystemConfigRepository systemConfigRepository) {
        this.feeRepository = feeRepository;
        this.apartmentRepository = apartmentRepository;
        this.vehicleRepository = vehicleRepository;
        this.systemConfigRepository = systemConfigRepository;
    }

    @Override
    @Transactional
    public Fee createFee(Long apartmentId, Fee fee) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy căn hộ!"));

        if (!"OCCUPIED".equalsIgnoreCase(apartment.getStatus())) {
            throw new RuntimeException("Không thể tạo phí cho căn hộ không có người ở!");
        }

        fee.setApartment(apartment);
        fee.setAmount(resolveAmount(fee, apartment));
        fee.setPaid(false); // mặc định khi tạo mới là chưa thanh toán

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
        // lấy danh sách tất cả căn hộ OCCUPIED
        List<Apartment> apartments = apartmentRepository.findByStatus("OCCUPIED");
        if (apartments.isEmpty()) {
            throw new RuntimeException("Không có căn hộ nào trong hệ thống để tạo phí!");
        }

        List<Fee> feesToSave = new ArrayList<>();
        for (Apartment apartment : apartments) {
            Fee newFee = new Fee();
            newFee.setApartment(apartment);
            newFee.setName(feeBase.getName());
            newFee.setDescription(feeBase.getDescription());
            newFee.setAmount(resolveAmount(feeBase, apartment));
            newFee.setType(feeBase.getType());
            newFee.setDueDate(feeBase.getDueDate());
            newFee.setPaid(false);
            
            feesToSave.add(newFee);
        }

        return feeRepository.saveAll(feesToSave);
    }


    private BigDecimal resolveAmount(Fee feeBaseOrFee, Apartment apartment) {
        if (feeBaseOrFee == null) return null;
        BigDecimal amount = feeBaseOrFee.getAmount();
        String type = feeBaseOrFee.getType();

        if (type != null && "QUAN_LY".equalsIgnoreCase(type)) {
            if (apartment.getArea() == null) {
                throw new RuntimeException("Căn hộ chưa có diện tích (area) để tính phí theo m²!");
            }
            if (amount == null) {
                throw new RuntimeException("Thiếu đơn giá (amount) để tính phí theo m²!");
            }
            return apartment.getArea().multiply(amount).setScale(2, RoundingMode.HALF_UP);
        }

        return amount;
    }
}
