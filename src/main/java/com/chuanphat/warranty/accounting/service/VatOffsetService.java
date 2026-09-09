package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.*;
import com.chuanphat.warranty.accounting.entity.Invoice;
import com.chuanphat.warranty.accounting.entity.VatOffsetRun;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.repository.InvoiceRepository;
import com.chuanphat.warranty.accounting.repository.VatOffsetRunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class VatOffsetService {

    private final VatOffsetRunRepository offsetRunRepository;
    private final InvoiceRepository invoiceRepository;
    private final AccountingLedgerService ledgerService;

    public VatOffsetService(VatOffsetRunRepository offsetRunRepository,
                            InvoiceRepository invoiceRepository,
                            AccountingLedgerService ledgerService) {
        this.offsetRunRepository = offsetRunRepository;
        this.invoiceRepository = invoiceRepository;
        this.ledgerService = ledgerService;
    }

    public VatOffsetPreviewDto previewOffset(Integer month, Integer year, Long branchId) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        List<Invoice> outputInvoices = invoiceRepository.findByLoaiHoaDonAndNgayXuatBetweenAndChiNhanhId("OUTPUT", startOfMonth, endOfMonth, branchId);
        List<Invoice> inputInvoices = invoiceRepository.findByLoaiHoaDonAndNgayXuatBetweenAndChiNhanhId("INPUT", startOfMonth, endOfMonth, branchId);

        BigDecimal outputVat = outputInvoices.stream()
                .map(i -> i.getTongThueGtgt() != null ? i.getTongThueGtgt() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal inputVat = inputInvoices.stream()
                .map(i -> i.getTongThueGtgt() != null ? i.getTongThueGtgt() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal offsetAmount = inputVat.min(outputVat);
        BigDecimal payableAmount = BigDecimal.ZERO;
        BigDecimal carriedForward = BigDecimal.ZERO;

        if (outputVat.compareTo(inputVat) > 0) {
            payableAmount = outputVat.subtract(inputVat);
        } else if (inputVat.compareTo(outputVat) > 0) {
            carriedForward = inputVat.subtract(outputVat);
        }

        return new VatOffsetPreviewDto(inputVat, outputVat, offsetAmount, payableAmount, carriedForward);
    }

    @Transactional
    public VatOffsetRunDto runOffset(RunVatOffsetRequest request, String user) {
        // Idempotent check
        if (offsetRunRepository.findByPeriodMonthAndPeriodYearAndBranchId(request.getMonth(), request.getYear(), request.getBranchId())
                .filter(run -> !run.getStatus().equals("CANCELLED"))
                .isPresent()) {
            throw new IllegalStateException("Thuế GTGT kỳ này đã được khấu trừ. Vui lòng hủy lần chạy cũ nếu muốn chạy lại.");
        }

        VatOffsetPreviewDto preview = previewOffset(request.getMonth(), request.getYear(), request.getBranchId());

        VatOffsetRun run = new VatOffsetRun();
        run.setRunCode("VO-" + request.getYear() + "-" + String.format("%02d", request.getMonth()) + "-" + System.currentTimeMillis());
        run.setPeriodMonth(request.getMonth());
        run.setPeriodYear(request.getYear());
        run.setBranchId(request.getBranchId());
        run.setInputVatAmount(preview.getInputVatAmount());
        run.setOutputVatAmount(preview.getOutputVatAmount());
        run.setOffsetAmount(preview.getOffsetAmount());
        run.setPayableAmount(preview.getPayableAmount());
        run.setCarriedForward(preview.getCarriedForward());
        run.setStatus("POSTED");
        run.setCreatedBy(user);
        run.setPostedAt(OffsetDateTime.now());

        // Create Journal Entry
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        // Nợ 33311 / Có 1331 : offsetAmount
        if (preview.getOffsetAmount().compareTo(BigDecimal.ZERO) > 0) {
            lines.add(new JournalEntryLineRequest("33311", preview.getOffsetAmount(), BigDecimal.ZERO, "Kết chuyển VAT được khấu trừ"));
            lines.add(new JournalEntryLineRequest("1331", BigDecimal.ZERO, preview.getOffsetAmount(), "Kết chuyển VAT được khấu trừ"));
        }

        if (!lines.isEmpty()) {
            JournalEntryRequest jeReq = new JournalEntryRequest(
                LocalDate.of(request.getYear(), request.getMonth(), 1).plusMonths(1).minusDays(1),
                JournalReferenceType.MANUAL,
                run.getRunCode(),
                "Khấu trừ thuế GTGT cuối kỳ " + request.getMonth() + "/" + request.getYear(),
                lines
            );
            JournalEntryResponse jeRes = ledgerService.createJournalEntry(jeReq);
            run.setJournalEntryId(jeRes.id());
        }

        run = offsetRunRepository.save(run);
        return mapToDto(run);
    }

    private VatOffsetRunDto mapToDto(VatOffsetRun entity) {
        VatOffsetRunDto dto = new VatOffsetRunDto();
        dto.setId(entity.getId());
        dto.setRunCode(entity.getRunCode());
        dto.setPeriodMonth(entity.getPeriodMonth());
        dto.setPeriodYear(entity.getPeriodYear());
        dto.setBranchId(entity.getBranchId());
        dto.setInputVatAmount(entity.getInputVatAmount());
        dto.setOutputVatAmount(entity.getOutputVatAmount());
        dto.setOffsetAmount(entity.getOffsetAmount());
        dto.setPayableAmount(entity.getPayableAmount());
        dto.setCarriedForward(entity.getCarriedForward());
        dto.setJournalEntryId(entity.getJournalEntryId());
        dto.setStatus(entity.getStatus());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setPostedAt(entity.getPostedAt());
        return dto;
    }
}
