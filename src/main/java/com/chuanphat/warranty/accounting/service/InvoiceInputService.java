package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.InvoiceDtos.*;
import com.chuanphat.warranty.accounting.entity.InvoiceInput;
import com.chuanphat.warranty.accounting.repository.InvoiceInputRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoiceInputService {

    private final InvoiceInputRepository invoiceInputRepository;
    private final SupplierRepository supplierRepository;
    private final TaxCodeLookupService taxCodeLookupService;

    public InvoiceInputService(InvoiceInputRepository invoiceInputRepository, 
                               SupplierRepository supplierRepository,
                               TaxCodeLookupService taxCodeLookupService) {
        this.invoiceInputRepository = invoiceInputRepository;
        this.supplierRepository = supplierRepository;
        this.taxCodeLookupService = taxCodeLookupService;
    }

    @Transactional(readOnly = true)
    public PageResponse<InvoiceInputDto> listInputInvoices(int page, int pageSize) {
        Page<InvoiceInput> invoices = invoiceInputRepository.findAll(PageRequest.of(page, pageSize, Sort.by("id").descending()));
        return PageResponse.from(invoices.map(this::mapToDto));
    }

    @Transactional
    public InvoiceInputDto createInputInvoice(CreateInvoiceInputRequest request) {
        Supplier supplier = supplierRepository.findById(request.nhaCungCapId()).orElseThrow(() -> new NotFoundException("Supplier not found"));

        InvoiceInput invoice = new InvoiceInput();
        invoice.setMaHoaDonVao("HDV-" + System.currentTimeMillis());
        invoice.setSoHoaDonNcc(request.soHoaDonNcc());
        invoice.setKyHieuNcc(request.kyHieuNcc());
        invoice.setMauSoNcc(request.mauSoNcc());
        invoice.setNgayHoaDon(request.ngayHoaDon());
        invoice.setSupplier(supplier);
        invoice.setTongTienHang(request.tongTienHang());
        invoice.setThueSuat(request.thueSuat());
        
        java.math.BigDecimal thue = request.tongTienHang().multiply(request.thueSuat()).divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        invoice.setTongThueGtgt(thue);
        invoice.setTongCong(request.tongTienHang().add(thue));
        
        // invoice.setPurchaseOrderId(request.purchaseOrderId());
        invoice.setGhiChu(request.ghiChu());
        // Check Tax Code
        if (supplier.getTaxCode() != null && !supplier.getTaxCode().trim().isEmpty()) {
            var lookup = taxCodeLookupService.lookupTaxCode(supplier.getTaxCode());
            if ("INACTIVE".equals(lookup.getStatus())) {
                invoice.setGhiChu(request.ghiChu() != null ? request.ghiChu() + " [CẢNH BÁO: MST ngừng hoạt động]" : "[CẢNH BÁO: MST ngừng hoạt động]");
            }
        }
        
        invoice.setTrangThai("PENDING");

        return mapToDto(invoiceInputRepository.save(invoice));
    }

    @Transactional
    public InvoiceInputDto approveInputInvoice(Long id) {
        InvoiceInput invoice = invoiceInputRepository.findById(id).orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
        invoice.setTrangThai("APPROVED");
        return mapToDto(invoiceInputRepository.save(invoice));
    }

    public InvoiceInputDto getInvoice(Long id) {
        InvoiceInput invoice = invoiceInputRepository.findById(id).orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
        return mapToDto(invoice);
    }

    private InvoiceInputDto mapToDto(InvoiceInput invoice) {
        return new InvoiceInputDto(
                invoice.getId(), invoice.getMaHoaDonVao(), invoice.getSoHoaDonNcc(), invoice.getKyHieuNcc(), invoice.getMauSoNcc(),
                invoice.getNgayHoaDon(), invoice.getSupplier() != null ? invoice.getSupplier().getId() : null,
                invoice.getSupplier() != null ? invoice.getSupplier().getName() : null,
                invoice.getSupplier() != null ? invoice.getSupplier().getTaxCode() : null,
                invoice.getTongTienHang(), invoice.getTongThueGtgt(), invoice.getTongCong(), invoice.getThueSuat(),
                invoice.getTrangThai(), invoice.getPurchaseOrder() != null ? invoice.getPurchaseOrder().getId() : null, invoice.getGhiChu(), invoice.getNgayTao()
        );
    }
}
