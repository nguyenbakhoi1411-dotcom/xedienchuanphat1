package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.InvoiceDtos.*;
import com.chuanphat.warranty.accounting.entity.Invoice;
import com.chuanphat.warranty.accounting.entity.InvoiceInput;
import com.chuanphat.warranty.accounting.repository.InvoiceInputRepository;
import com.chuanphat.warranty.accounting.repository.InvoiceRepository;
import com.chuanphat.warranty.common.security.BranchSecurity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VATReportService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceInputRepository invoiceInputRepository;
    private final BranchSecurity branchSecurity;

    public VATReportService(InvoiceRepository invoiceRepository, InvoiceInputRepository invoiceInputRepository, BranchSecurity branchSecurity) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceInputRepository = invoiceInputRepository;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public VatReportResponse generateVatReport(Long branchId, int year, int month) {
        
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        List<Invoice> outputInvoicesEntity = invoiceRepository.findAll()
                .stream()
                .filter(inv -> {
                    if (branchId != null && inv.getOrder() != null && !branchId.equals(inv.getOrder().getBranchId())) return false;
                    return "ISSUED".equals(inv.getTrangThai()) && 
                           inv.getNgayXuat() != null && 
                           !inv.getNgayXuat().isBefore(startOfMonth) && 
                           !inv.getNgayXuat().isAfter(endOfMonth);
                })
                .collect(Collectors.toList());
        
        List<VatReportItem> outputInvoices = outputInvoicesEntity.stream()
                .map(inv -> new VatReportItem(
                        inv.getSoHoaDon(), inv.getKyHieu(), inv.getNgayXuat(), inv.getTenNguoiMua(), inv.getMaSoThueNguoiMua(),
                        inv.getTongTienTruocThue(), inv.getTongThueGtgt(), "OUTPUT"
                )).collect(Collectors.toList());
                
        BigDecimal totalOutputVat = outputInvoices.stream().map(VatReportItem::vatAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOutputTaxBase = outputInvoices.stream().map(VatReportItem::taxBaseAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<InvoiceInput> inputInvoicesEntity = invoiceInputRepository.findAll()
                .stream()
                .filter(inv -> "APPROVED".equals(inv.getTrangThai()) && 
                        inv.getNgayHoaDon() != null && 
                        !inv.getNgayHoaDon().isBefore(startOfMonth) && 
                        !inv.getNgayHoaDon().isAfter(endOfMonth))
                .collect(Collectors.toList());
                
        List<VatReportItem> inputInvoices = inputInvoicesEntity.stream()
                .map(inv -> new VatReportItem(
                        inv.getSoHoaDonNcc(), inv.getKyHieuNcc(), inv.getNgayHoaDon(), 
                        inv.getSupplier() != null ? inv.getSupplier().getName() : "", 
                        inv.getSupplier() != null ? inv.getSupplier().getTaxCode() : "",
                        inv.getTongTienHang(), inv.getTongThueGtgt(), "INPUT"
                )).collect(Collectors.toList());

        BigDecimal totalInputVat = inputInvoices.stream().map(VatReportItem::vatAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalInputTaxBase = inputInvoices.stream().map(VatReportItem::taxBaseAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netVatPayable = totalOutputVat.subtract(totalInputVat);

        return new VatReportResponse(year, month, branchId, outputInvoices, totalOutputVat, totalOutputTaxBase,
                inputInvoices, totalInputVat, totalInputTaxBase, netVatPayable);
    }
}
