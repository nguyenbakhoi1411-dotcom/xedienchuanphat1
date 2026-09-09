package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record SupplierRequest(
        String code,               // Co the null -> server tu sinh
        @NotBlank String name,
        Long groupId,
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
        BigDecimal creditLimit,
        int paymentTermsDays,
        String phuongThucTT,       // CASH | BANK | BOTH
        Short rating,
        String notes
) {}
