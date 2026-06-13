package com.chuanphat.warranty.settings;

import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.settings.dto.SystemSettingsRequest;
import com.chuanphat.warranty.settings.dto.SystemSettingsResponse;
import com.chuanphat.warranty.settings.entity.SystemSetting;
import com.chuanphat.warranty.settings.repository.SystemSettingRepository;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingService {
    private static final SystemSettingsResponse DEFAULTS = new SystemSettingsResponse(
            "Chuan Phat",
            "TP.HCM",
            "02839010001",
            "",
            "",
            "Mau hoa don ban le",
            "Bao hanh theo thoi han tren tung san pham",
            5,
            null
    );

    private final SystemSettingRepository repository;
    private final AuditLogService auditLogService;

    public SettingService(SystemSettingRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public SystemSettingsResponse getSettings() {
        Map<String, SystemSetting> values = repository.findAll().stream()
                .collect(Collectors.toMap(SystemSetting::getSettingKey, item -> item));
        OffsetDateTime updatedAt = values.values().stream()
                .map(SystemSetting::getUpdatedAt)
                .max(OffsetDateTime::compareTo)
                .orElse(null);
        return new SystemSettingsResponse(
                value(values, "companyName", DEFAULTS.companyName()),
                value(values, "companyAddress", DEFAULTS.companyAddress()),
                value(values, "companyPhone", DEFAULTS.companyPhone()),
                value(values, "taxCode", DEFAULTS.taxCode()),
                value(values, "logoUrl", DEFAULTS.logoUrl()),
                value(values, "invoiceTemplate", DEFAULTS.invoiceTemplate()),
                value(values, "defaultWarrantyPolicy", DEFAULTS.defaultWarrantyPolicy()),
                integerValue(values, "lowStockThreshold", DEFAULTS.lowStockThreshold()),
                updatedAt
        );
    }

    @Transactional
    public SystemSettingsResponse updateSettings(SystemSettingsRequest request) {
        save("companyName", request.companyName());
        save("companyAddress", request.companyAddress());
        save("companyPhone", request.companyPhone());
        save("taxCode", request.taxCode());
        save("logoUrl", request.logoUrl());
        save("invoiceTemplate", request.invoiceTemplate());
        save("defaultWarrantyPolicy", request.defaultWarrantyPolicy());
        save("lowStockThreshold", String.valueOf(request.lowStockThreshold()));
        auditLogService.record(new CreateAuditLogRequest(
                currentActor(),
                AuditAction.UPDATE_SETTING,
                AuditModule.SYSTEM,
                "SystemSetting",
                "global",
                null,
                "settings-updated",
                null,
                null
        ));
        return getSettings();
    }

    private void save(String key, String value) {
        SystemSetting setting = repository.findBySettingKey(key).orElseGet(SystemSetting::new);
        setting.setSettingKey(key);
        setting.setSettingValue(value == null ? "" : value);
        setting.setUpdatedAt(OffsetDateTime.now());
        repository.save(setting);
    }

    private String value(Map<String, SystemSetting> values, String key, String defaultValue) {
        SystemSetting setting = values.get(key);
        return setting == null ? defaultValue : setting.getSettingValue();
    }

    private int integerValue(Map<String, SystemSetting> values, String key, int defaultValue) {
        try {
            return Integer.parseInt(value(values, key, String.valueOf(defaultValue)));
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "system";
        }
        return authentication.getName();
    }
}
