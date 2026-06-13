package com.chuanphat.warranty.auth.dto;

import com.chuanphat.warranty.auth.entity.Role;
import java.util.List;

public record RoleDto(
        String code,
        String name,
        String roleCode,
        String roleName,
        String description,
        boolean isSystemRole,
        String status,
        List<String> permissions
) {
    public static RoleDto from(Role role) {
        return new RoleDto(
                role.getCode(),
                role.getName(),
                role.getRoleCode(),
                role.getRoleName(),
                role.getDescription(),
                role.isSystemRole(),
                role.getStatus().name(),
                role.getPermissions().stream().map(permission -> permission.getCode()).sorted().toList()
        );
    }
}
