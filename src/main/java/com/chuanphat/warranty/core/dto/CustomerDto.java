package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.crm.enums.CustomerTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CustomerDto(
        Long id,
        @NotBlank String phone,
        @NotBlank String fullName,
        String email,
        String address,
        String source,
        @NotNull Long branchId,
        Long assignedTo,
        String birthday,
        CustomerTier tier,
        RecordStatus status
) {
    public static CustomerDto from(Customer customer) {
        return new CustomerDto(
                customer.getId(),
                customer.getPhone(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getSource(),
                customer.getBranchId(),
                customer.getAssignedTo(),
                customer.getBirthday(),
                customer.getTier(),
                customer.getStatus()
        );
    }
}
