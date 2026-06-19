package com.bluemoon.service.impl;

import com.bluemoon.model.SystemConfig;
import com.bluemoon.repository.SystemConfigRepository;
import com.bluemoon.service.SystemConfigService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    // Các key cấu hình phí cố định
    public static final String KEY_MANAGEMENT_FEE_PER_SQM = "fee.management_per_sqm";
    public static final String KEY_MOTORBIKE_FEE = "fee.motorbike";
    public static final String KEY_CAR_FEE = "fee.car";
    public static final String KEY_ELECTRICITY_FEE_PER_KWH = "fee.electricity_per_kwh";
    public static final String KEY_WATER_FEE_PER_M3 = "fee.water_per_m3";
    public static final String KEY_SERVICE_FEE_PER_PERSON = "fee.service_per_person";
    public static final String KEY_DUE_DAY_OF_MONTH = "fee.due_day_of_month";

    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigServiceImpl(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemConfig getByKey(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình: " + key));
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getDecimalValue(String key, BigDecimal defaultValue) {
        return systemConfigRepository.findByConfigKey(key)
                .map(c -> {
                    try {
                        return new BigDecimal(c.getConfigValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    @Override
    @Transactional
    public SystemConfig upsert(String key, String value, String description) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElseGet(() -> {
                    SystemConfig c = new SystemConfig();
                    c.setConfigKey(key);
                    return c;
                });
        config.setConfigValue(value);
        if (description != null) {
            config.setDescription(description);
        }
        return systemConfigRepository.save(config);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getFeeConfigs() {
        Map<String, String> map = new LinkedHashMap<>();
        map.put(KEY_MANAGEMENT_FEE_PER_SQM,
                getDecimalValue(KEY_MANAGEMENT_FEE_PER_SQM, new BigDecimal("10000")).toPlainString());
        map.put(KEY_MOTORBIKE_FEE,
                getDecimalValue(KEY_MOTORBIKE_FEE, new BigDecimal("150000")).toPlainString());
        map.put(KEY_CAR_FEE,
                getDecimalValue(KEY_CAR_FEE, new BigDecimal("1000000")).toPlainString());
        map.put(KEY_ELECTRICITY_FEE_PER_KWH,
                getDecimalValue(KEY_ELECTRICITY_FEE_PER_KWH, new BigDecimal("3500")).toPlainString());
        map.put(KEY_WATER_FEE_PER_M3,
                getDecimalValue(KEY_WATER_FEE_PER_M3, new BigDecimal("15000")).toPlainString());
        map.put(KEY_SERVICE_FEE_PER_PERSON,
                getDecimalValue(KEY_SERVICE_FEE_PER_PERSON, new BigDecimal("100000")).toPlainString());
        map.put(KEY_DUE_DAY_OF_MONTH,
                getDecimalValue(KEY_DUE_DAY_OF_MONTH, new BigDecimal("15")).toPlainString());
        return map;
    }

    @Override
    @Transactional
    public void updateFeeConfigs(Map<String, String> configs) {
        if (configs.containsKey(KEY_MANAGEMENT_FEE_PER_SQM)) {
            upsert(KEY_MANAGEMENT_FEE_PER_SQM, configs.get(KEY_MANAGEMENT_FEE_PER_SQM),
                    "Đơn giá phí quản lý (VNĐ/m²)");
        }
        if (configs.containsKey(KEY_MOTORBIKE_FEE)) {
            upsert(KEY_MOTORBIKE_FEE, configs.get(KEY_MOTORBIKE_FEE),
                    "Đơn giá gửi xe máy (VNĐ/xe/tháng)");
        }
        if (configs.containsKey(KEY_CAR_FEE)) {
            upsert(KEY_CAR_FEE, configs.get(KEY_CAR_FEE),
                    "Đơn giá gửi ô tô (VNĐ/xe/tháng)");
        }
        if (configs.containsKey(KEY_ELECTRICITY_FEE_PER_KWH)) {
            upsert(KEY_ELECTRICITY_FEE_PER_KWH, configs.get(KEY_ELECTRICITY_FEE_PER_KWH),
                    "Đơn giá điện (VNĐ/kWh)");
        }
        if (configs.containsKey(KEY_WATER_FEE_PER_M3)) {
            upsert(KEY_WATER_FEE_PER_M3, configs.get(KEY_WATER_FEE_PER_M3),
                    "Đơn giá nước (VNĐ/m³)");
        }
        if (configs.containsKey(KEY_SERVICE_FEE_PER_PERSON)) {
            upsert(KEY_SERVICE_FEE_PER_PERSON, configs.get(KEY_SERVICE_FEE_PER_PERSON),
                    "Phí dịch vụ (VNĐ/người/tháng)");
        }
        if (configs.containsKey(KEY_DUE_DAY_OF_MONTH)) {
            upsert(KEY_DUE_DAY_OF_MONTH, configs.get(KEY_DUE_DAY_OF_MONTH),
                    "Ngày hạn nộp hàng tháng");
        }
    }
}
