package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.RecordStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record SupplierDto(
        Long id,
        String code,
        String name,
        Long groupId,
        String groupName,
        String tenVietTat,
        String taxCode,
        String phone,
        String email,
        String website,
        String address,
        String tinhThanh,
        String contactPerson,
        String chucVuNguoiLH,
        String dienThoaiNguoiLH,
        String emailNguoiLH,
        String soTaiKhoanNH,
        String tenNganHang,
        String chiNhanhNH,
        BigDecimal currentDebt,
        BigDecimal creditLimit,
        int paymentTermsDays,
        String phuongThucTT,
        Short rating,
        String notes,
        RecordStatus status,
        OffsetDateTime createdAt
) {
    public static SupplierDto from(Supplier s) {
        return new SupplierDto(
                s.getId(), s.getCode(), s.getName(),
                s.getGroup() != null ? s.getGroup().getId() : null,
                s.getGroup() != null ? s.getGroup().getName() : null,
                s.getTenVietTat(),
                s.getTaxCode(), s.getPhone(), s.getEmail(), s.getWebsite(),
                s.getAddress(), s.getTinhThanh(), s.getContactPerson(),
                s.getChucVuNguoiLH(), s.getDienThoaiNguoiLH(), s.getEmailNguoiLH(),
                s.getSoTaiKhoanNH(), s.getTenNganHang(), s.getChiNhanhNH(),
                s.getCurrentDebt(), s.getCreditLimit(),
                s.getPaymentTermsDays(), s.getPhuongThucTT(),
                s.getRating(), s.getNotes(), s.getStatus(), s.getCreatedAt()
        );
    }
}
