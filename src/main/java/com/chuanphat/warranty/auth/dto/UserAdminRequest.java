package com.chuanphat.warranty.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record UserAdminRequest(
        @NotBlank String employeeCode,
        @NotBlank String fullName,
        @Email @NotBlank String email,
        String phone,
        List<Long> branchIds,
        List<UserBranchAccessDto> branchAccesses,
        @NotEmpty List<String> roles,
        String status,
        String password
) {
}
