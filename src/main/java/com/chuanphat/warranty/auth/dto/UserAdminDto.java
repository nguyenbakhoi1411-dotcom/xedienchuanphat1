package com.chuanphat.warranty.auth.dto;

import com.chuanphat.warranty.auth.entity.AppUser;
import java.util.List;

public record UserAdminDto(
        Long id,
        String employeeCode,
        String fullName,
        String email,
        String phone,
        List<Long> branchIds,
        List<UserBranchAccessDto> branchAccesses,
        List<String> roles,
        String status,
        String lastLoginAt
) {
    public static UserAdminDto from(AppUser user) {
        return new UserAdminDto(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getBranchAccesses().stream().map(access -> access.getBranchId()).sorted().toList(),
                user.getBranchAccesses().stream().map(UserBranchAccessDto::from).toList(),
                user.getRoles().stream().map(role -> role.getCode()).sorted().toList(),
                user.getStatus().name(),
                null
        );
    }
}
