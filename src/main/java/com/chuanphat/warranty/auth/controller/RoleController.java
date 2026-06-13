package com.chuanphat.warranty.auth.controller;

import com.chuanphat.warranty.auth.dto.RoleDto;
import com.chuanphat.warranty.auth.dto.UpdateRolePermissionsRequest;
import com.chuanphat.warranty.auth.service.UserAdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final UserAdminService service;

    public RoleController(UserAdminService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_VIEW','MANAGE_PERMISSIONS')")
    public List<RoleDto> list() {
        return service.roles();
    }

    @PutMapping("/{code}/permissions")
    @PreAuthorize("hasAuthority('MANAGE_PERMISSIONS')")
    public RoleDto updatePermissions(@PathVariable String code, @Valid @RequestBody UpdateRolePermissionsRequest request) {
        return service.updateRolePermissions(code, request);
    }
}
