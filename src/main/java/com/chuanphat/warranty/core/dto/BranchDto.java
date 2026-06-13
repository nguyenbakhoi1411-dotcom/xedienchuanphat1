package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.enums.RecordStatus;
import jakarta.validation.constraints.NotBlank;

public record BranchDto(Long id, @NotBlank String code, @NotBlank String name, @NotBlank String address, String phone, RecordStatus status) {
    public static BranchDto from(Branch branch) {
        return new BranchDto(branch.getId(), branch.getCode(), branch.getName(), branch.getAddress(), branch.getPhone(), branch.getStatus());
    }
}
