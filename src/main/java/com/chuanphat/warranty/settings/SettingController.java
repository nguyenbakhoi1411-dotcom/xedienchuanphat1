package com.chuanphat.warranty.settings;

import com.chuanphat.warranty.settings.dto.SystemSettingsRequest;
import com.chuanphat.warranty.settings.dto.SystemSettingsResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasAnyRole('ADMIN')")
public class SettingController {
    private final SettingService service;

    public SettingController(SettingService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SETTING_MANAGE')")
    public SystemSettingsResponse getSettings() {
        return service.getSettings();
    }

    @PutMapping
    @PreAuthorize("hasAuthority('SETTING_MANAGE')")
    public SystemSettingsResponse updateSettings(@Valid @RequestBody SystemSettingsRequest request) {
        return service.updateSettings(request);
    }
}

