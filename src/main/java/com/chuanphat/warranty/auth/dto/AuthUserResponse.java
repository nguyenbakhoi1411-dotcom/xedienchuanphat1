package com.chuanphat.warranty.auth.dto;

import com.chuanphat.warranty.auth.entity.AppUser;
import java.util.List;

public record AuthUserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String phone,
        Long branchId,
        String role,
        List<String> roles,
        List<Long> branchIds,
        List<String> permissions
) {
    public static AuthUserResponse from(AppUser user) {
        return new AuthUserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getBranchId(),
                user.getRole().getCode(),
                user.getRoles().stream().map(role -> role.getCode()).sorted().toList(),
                user.getBranchAccesses().stream().map(access -> access.getBranchId()).sorted().toList(),
                user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .map(permission -> permission.getCode())
                        .distinct()
                        .sorted()
                        .toList()
        );
    }
}
