package com.chuanphat.warranty.accounting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public class InvoiceDtos {

    // ── DTOs for Serial Config ──
    public record InvoiceSerialConfigDto(
            Long id, String mauSo, String kyHieu, Integer soBatDau, Integer soHienTai, Integer soKetThuc,
            String loaiHoaDon, Integer namSuDung, String trangThai, LocalDate ngayKyThongBao
    ) {}

    public record CreateSerialConfigRequest(
            @NotBlank String mauSo, @NotBlank String kyHieu, @NotNull Integer soBatDau, @NotNull Integer soKetThuc,
            @NotBlank String loaiHoaDon, @NotNull Integer namSuDung, LocalDate ngayKyThongBao
    ) {}

    // ── DTOs for Output Invoice (Bán hàng) ──
    public record InvoiceDto(
            Long id, String maHoaDon, String loaiHoaDon, String mauSo, String kyHieu, String soHoaDon,
            Long soHoaDonGocId, LocalDate ngayXuat, OffsetDateTime ngayKy, OffsetDateTime ngayGuiCqt,
            Long orderId, String tenNguoiBan, String diaChiNguoiBan, String maSoThueNguoiBan,
            String tenNguoiMua, String diaChiNguoiMua, String maSoThueNguoiMua, String hinhThucThanhToan,
            BigDecimal tongTienTruocThue, BigDecimal tongThueGtgt, BigDecimal tongCong,
            String trangThai, String electronicInvoiceStatus, String errorDetails, OffsetDateTime createdAt,
            List<InvoiceItemDto> items
    ) {}

    public record InvoiceItemDto(
            Long id, Long productId, String tenHangHoa, String donViTinh, Integer soLuong,
            BigDecimal donGia, BigDecimal thanhTien, BigDecimal thueSuat, BigDecimal tienThue
    ) {}

    public record CreateInvoiceRequest(
            @NotNull Long orderId,
            @NotBlank String loaiHoaDon,
            String hinhThucThanhToan,
            List<CreateInvoiceItemRequest> items
    ) {}

    public record CreateInvoiceItemRequest(
            @NotNull Long productId,
            @NotBlank String tenHangHoa,
            @NotBlank String donViTinh,
            @NotNull Integer soLuong,
            @NotNull BigDecimal donGia,
            @NotNull BigDecimal thueSuat
    ) {}

    public record IssueInvoiceRequest(
            @NotBlank String mauSo,
            @NotBlank String kyHieu
    ) {}
    
    public record AdjustInvoiceRequest(
            @NotBlank String loaiDieuChinh, // INCREASE, DECREASE, INFO
            @NotBlank String lyDo,
            List<CreateInvoiceItemRequest> items
    ) {}

    public record CancelInvoiceRequest(
            @NotBlank String lyDo
    ) {}

    // ── DTOs for Input Invoice (Mua hàng) ──
    public record InvoiceInputDto(
            Long id, String maHoaDonVao, String soHoaDonNcc, String kyHieuNcc, String mauSoNcc,
            LocalDate ngayHoaDon, Long nhaCungCapId, String tenNhaCungCap, String maSoThueNcc,
            BigDecimal tongTienHang, BigDecimal tongThueGtgt, BigDecimal tongCong, BigDecimal thueSuat,
            String trangThai, Long purchaseOrderId, String ghiChu, OffsetDateTime createdAt
    ) {}

    public record CreateInvoiceInputRequest(
            @NotBlank String soHoaDonNcc, String kyHieuNcc, String mauSoNcc, @NotNull LocalDate ngayHoaDon,
            @NotNull Long nhaCungCapId, @NotNull BigDecimal tongTienHang, @NotNull BigDecimal thueSuat,
            Long purchaseOrderId, String ghiChu
    ) {}

    // ── VAT Report DTOs ──
    public record VatReportResponse(
            Integer year, Integer month, Long branchId,
            List<VatReportItem> outputInvoices, BigDecimal totalOutputVat, BigDecimal totalOutputTaxBase,
            List<VatReportItem> inputInvoices, BigDecimal totalInputVat, BigDecimal totalInputTaxBase,
            BigDecimal netVatPayable
    ) {}

    public record VatReportItem(
            String invoiceNo, String serialNo, LocalDate date, String customerOrSupplierName, String taxCode,
            BigDecimal taxBaseAmount, BigDecimal vatAmount, String type
    ) {}
}
