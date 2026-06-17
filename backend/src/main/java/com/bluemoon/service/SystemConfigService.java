package com.bluemoon.service;

import com.bluemoon.model.SystemConfig;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface SystemConfigService {
    List<SystemConfig> getAllConfigs();

    SystemConfig getByKey(String key);

    BigDecimal getDecimalValue(String key, BigDecimal defaultValue);

    SystemConfig upsert(String key, String value, String description);

    Map<String, String> getFeeConfigs();

    void updateFeeConfigs(Map<String, String> configs);
}
