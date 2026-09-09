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
        RecordStatus status,
        boolean isOrganization,
        boolean isSupplier,
        boolean isInternal,
        String taxUnitCode,
        String website,
        String customerGroup,
        String salesEmployee,
        String contactTitle,
        String contactName,
        String contactEmail,
        String contactMobilePhone,
        String legalRepresentative,
        String invoiceRecipientName,
        String invoiceRecipientEmail,
        String invoiceRecipientPhone,
        String bankAccountNumber,
        String bankName,
        String bankBranch
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
                customer.getStatus(),
                customer.isOrganization(),
                customer.isSupplier(),
                customer.isInternal(),
                customer.getTaxUnitCode(),
                customer.getWebsite(),
                customer.getCustomerGroup(),
                customer.getSalesEmployee(),
                customer.getContactTitle(),
                customer.getContactName(),
                customer.getContactEmail(),
                customer.getContactMobilePhone(),
                customer.getLegalRepresentative(),
                customer.getInvoiceRecipientName(),
                customer.getInvoiceRecipientEmail(),
                customer.getInvoiceRecipientPhone(),
                customer.getBankAccountNumber(),
                customer.getBankName(),
                customer.getBankBranch()
        );
    }
}
