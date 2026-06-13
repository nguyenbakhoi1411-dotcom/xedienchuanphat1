package com.chuanphat.warranty.auth.dto;

import com.chuanphat.warranty.auth.entity.UserBranchAccess;

public record UserBranchAccessDto(Long branchId, String accessLevel) {
    public static UserBranchAccessDto from(UserBranchAccess access) {
        return new UserBranchAccessDto(access.getBranchId(), access.getAccessLevel().name());
    }
}
