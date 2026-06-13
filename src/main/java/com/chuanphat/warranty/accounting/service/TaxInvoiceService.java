package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.TaxInvoiceDtos;
import com.chuanphat.warranty.accounting.entity.TaxInvoice;
import com.chuanphat.warranty.accounting.repository.TaxInvoiceRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * TaxInvoiceService — Quản lý hóa đơn VAT đầu vào / đầu ra.
 *
 * Thiết kế mở rộng: khi cần tích hợp e-invoice (MISA/VIETTEL/VNPT),
 * chỉ cần implement EInvoiceGateway interface và inject vào service này.
 */
@Service
public class TaxInvoiceService {
    private final TaxInvoiceRepository taxInvoiceRepository;
    private final BranchSecurity branchSecurity;

    public TaxInvoiceService(TaxInvoiceRepository taxInvoiceRepository, BranchSecurity branchSecurity) {
        this.taxInvoiceRepository = taxInvoiceRepository;
        this.branchSecurity = branchSecurity;
    }

    // ── Queries ──

    @Transactional(readOnly = true)
    public PageResponse<TaxInvoiceDtos.TaxInvoiceResponse> listOutput(Long branchId, String status, int page, int pageSize) {
        Long scopedBranch = branchSecurity.scopedBranchId(branchId);
        Page<TaxInvoice> result = (status == null || "ALL".equals(status))
                ? taxInvoiceRepository.findByInvoiceTypeAndBranchId("OUTPUT", scopedBranch == null ? 1L : scopedBranch, PageRequest.of(page, pageSize))
                : taxInvoiceRepository.findByInvoiceTypeAndBranchIdAndStatus("OUTPUT", scopedBranch == null ? 1L : scopedBranch, status, PageRequest.of(page, pageSize));
        return PageResponse.from(result.map(TaxInvoiceDtos.TaxInvoiceResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<TaxInvoiceDtos.TaxInvoiceResponse> listInput(Long branchId, String status, int page, int pageSize) {
        Long scopedBranch = branchSecurity.scopedBranchId(branchId);
        Page<TaxInvoice> result = (status == null || "ALL".equals(status))
                ? taxInvoiceRepository.findByInvoiceTypeAndBranchId("INPUT", scopedBranch == null ? 1L : scopedBranch, PageRequest.of(page, pageSize))
                : taxInvoiceRepository.findByInvoiceTypeAndBranchIdAndStatus("INPUT", scopedBranch == null ? 1L : scopedBranch, status, PageRequest.of(page, pageSize));
        return PageResponse.from(result.map(TaxInvoiceDtos.TaxInvoiceResponse::from));
    }

    // ── Tạo hóa đơn ──

    /**
     * Tạo hóa đơn bán ra (OUTPUT).
     * Gọi từ SalesService sau khi xuất hóa đơn.
     */
    @Transactional
    public TaxInvoiceDtos.TaxInvoiceResponse createOutputInvoice(TaxInvoiceDtos.CreateTaxInvoiceRequest request) {
        return create("OUTPUT", request);
    }

    /**
     * Ghi nhận hóa đơn mua vào (INPUT).
     * Gọi từ PurchaseService khi nhập hàng.
     */
    @Transactional
    public TaxInvoiceDtos.TaxInvoiceResponse createInputInvoice(TaxInvoiceDtos.CreateTaxInvoiceRequest request) {
        return create("INPUT", request);
    }

    private TaxInvoiceDtos.TaxInvoiceResponse create(String type, TaxInvoiceDtos.CreateTaxInvoiceRequest request) {
        TaxInvoice invoice = new TaxInvoice();
        invoice.setInvoiceCode(request.invoiceCode());
        invoice.setInvoiceSerial(request.invoiceSerial());
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setInvoiceType(type);
        invoice.setStatus("DRAFT");
        invoice.setCustomerId(request.customerId());
        invoice.setSupplierId(request.supplierId());
        invoice.setTaxBaseAmount(request.taxBaseAmount());
        invoice.setVatRate(request.vatRate());
        // Tính VAT nếu chưa có
        BigDecimal vatAmount = request.vatAmount() != null
                ? request.vatAmount()
                : request.taxBaseAmount().multiply(request.vatRate()).divide(BigDecimal.valueOf(100));
        invoice.setVatAmount(vatAmount);
        invoice.setTotalAmount(request.taxBaseAmount().add(vatAmount));
        invoice.setRelatedOrderNo(request.relatedOrderNo());
        invoice.setRelatedReturnNo(request.relatedReturnNo());
        invoice.setBranchId(request.branchId());
        invoice.setNote(request.note());
        invoice.setCreatedBy(branchSecurity.currentUser().getUsername());
        return TaxInvoiceDtos.TaxInvoiceResponse.from(taxInvoiceRepository.save(invoice));
    }

    /**
     * Phát hành hóa đơn (DRAFT → ISSUED).
     * Hook điểm để gọi e-invoice API trong tương lai.
     */
    @Transactional
    public TaxInvoiceDtos.TaxInvoiceResponse issue(Long invoiceId) {
        TaxInvoice invoice = getEntity(invoiceId);
        if (!"DRAFT".equals(invoice.getStatus())) {
            throw new BusinessException("Only DRAFT invoices can be issued");
        }
        invoice.setStatus("ISSUED");
        invoice.setIssuedAt(OffsetDateTime.now());
        // TODO: gọi eInvoiceGateway.issue(invoice) khi tích hợp e-invoice
        return TaxInvoiceDtos.TaxInvoiceResponse.from(invoice);
    }

    /**
     * Hủy hóa đơn.
     */
    @Transactional
    public TaxInvoiceDtos.TaxInvoiceResponse cancel(Long invoiceId, String reason) {
        TaxInvoice invoice = getEntity(invoiceId);
        if ("CANCELLED".equals(invoice.getStatus())) {
            throw new BusinessException("Invoice already cancelled");
        }
        invoice.setStatus("CANCELLED");
        invoice.setCancelledAt(OffsetDateTime.now());
        invoice.setCancelledBy(branchSecurity.currentUser().getUsername());
        if (reason != null) {
            invoice.setNote((invoice.getNote() == null ? "" : invoice.getNote() + " | ") + "Cancelled: " + reason);
        }
        return TaxInvoiceDtos.TaxInvoiceResponse.from(invoice);
    }

    /**
     * Tạo hóa đơn điều chỉnh (hóa đơn cũ → ADJUSTED, tạo hóa đơn mới).
     */
    @Transactional
    public TaxInvoiceDtos.TaxInvoiceResponse adjust(Long originalInvoiceId, TaxInvoiceDtos.CreateTaxInvoiceRequest adjustRequest) {
        TaxInvoice original = getEntity(originalInvoiceId);
        if (!"ISSUED".equals(original.getStatus())) {
            throw new BusinessException("Only ISSUED invoices can be adjusted");
        }
        original.setStatus("ADJUSTED");

        // Tạo hóa đơn điều chỉnh
        TaxInvoice adjusted = new TaxInvoice();
        adjusted.setInvoiceCode(adjustRequest.invoiceCode());
        adjusted.setInvoiceDate(adjustRequest.invoiceDate() != null ? adjustRequest.invoiceDate() : LocalDate.now());
        adjusted.setInvoiceType(original.getInvoiceType());
        adjusted.setStatus("ISSUED");
        adjusted.setIssuedAt(OffsetDateTime.now());
        adjusted.setCustomerId(original.getCustomerId());
        adjusted.setSupplierId(original.getSupplierId());
        adjusted.setAdjustedInvoiceId(original.getId());
        adjusted.setTaxBaseAmount(adjustRequest.taxBaseAmount());
        adjusted.setVatRate(original.getVatRate());
        BigDecimal vatAmount = adjustRequest.taxBaseAmount().multiply(original.getVatRate()).divide(BigDecimal.valueOf(100));
        adjusted.setVatAmount(vatAmount);
        adjusted.setTotalAmount(adjustRequest.taxBaseAmount().add(vatAmount));
        adjusted.setBranchId(original.getBranchId());
        adjusted.setNote(adjustRequest.note());
        adjusted.setCreatedBy(branchSecurity.currentUser().getUsername());
        return TaxInvoiceDtos.TaxInvoiceResponse.from(taxInvoiceRepository.save(adjusted));
    }

    // ── Báo cáo thuế ──

    /**
     * Báo cáo VAT tổng hợp theo tháng.
     */
    @Transactional(readOnly = true)
    public TaxInvoiceDtos.VatReportResponse vatReport(int year, int month, Long branchId) {
        Long scopedBranch = branchSecurity.scopedBranchId(branchId);
        Long effectiveBranch = scopedBranch == null ? 1L : scopedBranch;

        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());

        List<TaxInvoice> outputs = taxInvoiceRepository.findByInvoiceDateBetweenAndBranchIdAndInvoiceType(from, to, effectiveBranch, "OUTPUT");
        List<TaxInvoice> inputs = taxInvoiceRepository.findByInvoiceDateBetweenAndBranchIdAndInvoiceType(from, to, effectiveBranch, "INPUT");

        BigDecimal outputBase = outputs.stream().filter(i -> !"CANCELLED".equals(i.getStatus()))
                .map(TaxInvoice::getTaxBaseAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outputVat = outputs.stream().filter(i -> !"CANCELLED".equals(i.getStatus()))
                .map(TaxInvoice::getVatAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal inputBase = inputs.stream().filter(i -> !"CANCELLED".equals(i.getStatus()))
                .map(TaxInvoice::getTaxBaseAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal inputVat = inputs.stream().filter(i -> !"CANCELLED".equals(i.getStatus()))
                .map(TaxInvoice::getVatAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal vatPayable = outputVat.subtract(inputVat).max(BigDecimal.ZERO);
        BigDecimal vatRefundable = inputVat.subtract(outputVat).max(BigDecimal.ZERO);

        return new TaxInvoiceDtos.VatReportResponse(
                year, month, effectiveBranch,
                outputBase, outputVat,
                inputBase, inputVat,
                vatPayable, vatRefundable,
                outputs.stream().filter(i -> !"CANCELLED".equals(i.getStatus())).map(TaxInvoiceDtos.TaxInvoiceResponse::from).toList(),
                inputs.stream().filter(i -> !"CANCELLED".equals(i.getStatus())).map(TaxInvoiceDtos.TaxInvoiceResponse::from).toList()
        );
    }

    private TaxInvoice getEntity(Long id) {
        return taxInvoiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tax invoice not found: " + id));
    }
}
