package com.chuanphat.warranty.auth.dto;

import com.chuanphat.warranty.auth.entity.Permission;

public record PermissionDto(Long id, String code, String module, String action) {
    public static PermissionDto from(Permission permission) {
        return new PermissionDto(permission.getId(), permission.getCode(), permission.getModule(), permission.getAction());
    }
}
