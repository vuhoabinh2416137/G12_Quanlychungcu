package com.bluemoon.controller;

import com.bluemoon.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system-config")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    /**
     * Lấy cấu hình phí cố định hiện tại
     */
    @GetMapping("/fees")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<Map<String, String>> getFeeConfigs() {
        return ResponseEntity.ok(systemConfigService.getFeeConfigs());
    }

    /**
     * Cập nhật cấu hình phí cố định
     */
    @PutMapping("/fees")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<Map<String, String>> updateFeeConfigs(
            @RequestBody Map<String, String> configs
    ) {
        systemConfigService.updateFeeConfigs(configs);
        return ResponseEntity.ok(systemConfigService.getFeeConfigs());
    }
}
