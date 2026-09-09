package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.GenerateTaxDeclarationRequest;
import com.chuanphat.warranty.accounting.dto.TaxDeclarationDto;
import com.chuanphat.warranty.accounting.dto.TaxDeclarationLineDto;
import com.chuanphat.warranty.accounting.entity.Invoice;
import com.chuanphat.warranty.accounting.entity.TaxDeclaration;
import com.chuanphat.warranty.accounting.entity.TaxDeclarationLine;
import com.chuanphat.warranty.accounting.repository.InvoiceRepository;
import com.chuanphat.warranty.accounting.repository.TaxDeclarationLineRepository;
import com.chuanphat.warranty.accounting.repository.TaxDeclarationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaxDeclarationService {

    private final TaxDeclarationRepository declarationRepository;
    private final TaxDeclarationLineRepository lineRepository;
    private final InvoiceRepository invoiceRepository;

    public TaxDeclarationService(TaxDeclarationRepository declarationRepository,
                                 TaxDeclarationLineRepository lineRepository,
                                 InvoiceRepository invoiceRepository) {
        this.declarationRepository = declarationRepository;
        this.lineRepository = lineRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public TaxDeclarationDto generateDeclaration(GenerateTaxDeclarationRequest request) {
        // Find existing draft
        TaxDeclaration declaration = declarationRepository.findByBranchIdAndMonthAndYear(
                request.getBranchId(), request.getMonth(), request.getYear()
        ).orElseGet(() -> {
            TaxDeclaration newDecl = new TaxDeclaration();
            newDecl.setDeclarationCode("TAX-" + request.getYear() + "-" + String.format("%02d", request.getMonth()));
            newDecl.setMonth(request.getMonth());
            newDecl.setYear(request.getYear());
            newDecl.setQuarter((request.getMonth() - 1) / 3 + 1);
            newDecl.setBranchId(request.getBranchId());
            newDecl.setDeclarationType("MONTHLY");
            newDecl.setStatus("DRAFT");
            newDecl.setDueDate(LocalDate.of(request.getYear(), request.getMonth(), 1).plusMonths(1).withDayOfMonth(20));
            return declarationRepository.save(newDecl);
        });

        if (!"DRAFT".equals(declaration.getStatus())) {
            throw new IllegalStateException("Tax declaration for this period is already submitted.");
        }

        // Clean up old lines
        List<TaxDeclarationLine> oldLines = lineRepository.findByTaxDeclarationId(declaration.getId());
        lineRepository.deleteAll(oldLines);

        // Fetch all invoices for the period
        // Note: Mocking invoice fetch for this period and branch
        LocalDate startOfMonth = LocalDate.of(request.getYear(), request.getMonth(), 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);
        
        List<Invoice> outputInvoices = invoiceRepository.findByLoaiHoaDonAndNgayXuatBetweenAndChiNhanhId("OUTPUT", startOfMonth, endOfMonth, request.getBranchId());
        List<Invoice> inputInvoices = invoiceRepository.findByLoaiHoaDonAndNgayXuatBetweenAndChiNhanhId("INPUT", startOfMonth, endOfMonth, request.getBranchId());

        BigDecimal outputBase = BigDecimal.ZERO;
        BigDecimal outputVat = BigDecimal.ZERO;
        BigDecimal inputBase = BigDecimal.ZERO;
        BigDecimal inputVat = BigDecimal.ZERO;

        List<TaxDeclarationLine> newLines = new ArrayList<>();

        for (Invoice inv : outputInvoices) {
            TaxDeclarationLine line = new TaxDeclarationLine();
            line.setTaxDeclaration(declaration);
            line.setTaxInvoice(inv);
            line.setLineType("OUTPUT");
            line.setTaxBaseAmount(inv.getTongTienTruocThue() != null ? inv.getTongTienTruocThue() : BigDecimal.ZERO);
            line.setVatAmount(inv.getTongThueGtgt() != null ? inv.getTongThueGtgt() : BigDecimal.ZERO);
            newLines.add(line);
            outputBase = outputBase.add(line.getTaxBaseAmount());
            outputVat = outputVat.add(line.getVatAmount());
        }

        for (Invoice inv : inputInvoices) {
            TaxDeclarationLine line = new TaxDeclarationLine();
            line.setTaxDeclaration(declaration);
            line.setTaxInvoice(inv);
            line.setLineType("INPUT");
            line.setTaxBaseAmount(inv.getTongTienTruocThue() != null ? inv.getTongTienTruocThue() : BigDecimal.ZERO);
            line.setVatAmount(inv.getTongThueGtgt() != null ? inv.getTongThueGtgt() : BigDecimal.ZERO);
            newLines.add(line);
            inputBase = inputBase.add(line.getTaxBaseAmount());
            inputVat = inputVat.add(line.getVatAmount());
        }

        lineRepository.saveAll(newLines);

        declaration.setOutputTaxBase(outputBase);
        declaration.setOutputVatAmount(outputVat);
        declaration.setInputTaxBase(inputBase);
        declaration.setInputVatAmount(inputVat);
        declaration.setVatPayable(outputVat.subtract(inputVat));

        declaration = declarationRepository.save(declaration);

        return mapToDto(declaration, newLines);
    }

    public TaxDeclarationDto getDeclaration(Long id) {
        TaxDeclaration declaration = declarationRepository.findById(id).orElseThrow();
        List<TaxDeclarationLine> lines = lineRepository.findByTaxDeclarationId(id);
        return mapToDto(declaration, lines);
    }

    @Transactional
    public TaxDeclarationDto submitDeclaration(Long id, String user) {
        TaxDeclaration declaration = declarationRepository.findById(id).orElseThrow();
        if (!"DRAFT".equals(declaration.getStatus())) {
            throw new IllegalStateException("Only DRAFT declarations can be submitted.");
        }
        declaration.setStatus("SUBMITTED");
        declaration.setSubmittedDate(LocalDate.now());
        declaration.setSubmittedBy(user);
        declaration = declarationRepository.save(declaration);
        return mapToDto(declaration, List.of());
    }

    private TaxDeclarationDto mapToDto(TaxDeclaration entity, List<TaxDeclarationLine> lines) {
        TaxDeclarationDto dto = new TaxDeclarationDto();
        dto.setId(entity.getId());
        dto.setDeclarationCode(entity.getDeclarationCode());
        dto.setMonth(entity.getMonth());
        dto.setYear(entity.getYear());
        dto.setQuarter(entity.getQuarter());
        dto.setDeclarationType(entity.getDeclarationType());
        dto.setBranchId(entity.getBranchId());
        dto.setOutputTaxBase(entity.getOutputTaxBase());
        dto.setOutputVatAmount(entity.getOutputVatAmount());
        dto.setInputTaxBase(entity.getInputTaxBase());
        dto.setInputVatAmount(entity.getInputVatAmount());
        dto.setVatPayable(entity.getVatPayable());
        dto.setStatus(entity.getStatus());
        dto.setDueDate(entity.getDueDate());
        dto.setSubmittedDate(entity.getSubmittedDate());
        dto.setSubmittedBy(entity.getSubmittedBy());
        dto.setNote(entity.getNote());
        dto.setCreatedAt(entity.getCreatedAt());

        if (lines != null && !lines.isEmpty()) {
            dto.setLines(lines.stream().map(l -> {
                TaxDeclarationLineDto ldto = new TaxDeclarationLineDto();
                ldto.setId(l.getId());
                ldto.setTaxInvoiceId(l.getTaxInvoice().getId());
                ldto.setInvoiceNo(l.getTaxInvoice().getSoHoaDon());
                ldto.setLineType(l.getLineType());
                ldto.setTaxBaseAmount(l.getTaxBaseAmount());
                ldto.setVatAmount(l.getVatAmount());
                ldto.setNote(l.getNote());
                return ldto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
