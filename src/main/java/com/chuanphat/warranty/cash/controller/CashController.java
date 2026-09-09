package com.chuanphat.warranty.cash.controller;

import com.chuanphat.warranty.cash.dto.*;
import com.chuanphat.warranty.cash.entity.PaymentType;
import com.chuanphat.warranty.cash.entity.ReceiptType;
import com.chuanphat.warranty.cash.service.CashService;
import com.chuanphat.warranty.common.dto.PageResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/cash")
@PreAuthorize("hasAnyRole('ADMIN')")
public class CashController {

    private final CashService cashService;

    public CashController(CashService cashService) {
        this.cashService = cashService;
    }

    @GetMapping("/summary")
    public CashSummaryDto getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return cashService.getSummary(date);
    }

    // ─── PHIẾU THU ──────────────────────────────────────────────────────────
    @GetMapping("/receipts")
    public PageResponse<CashReceiptDto> searchReceipts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) ReceiptType type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return cashService.searchReceipts(fromDate, toDate, type, keyword, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "receiptDate", "createdAt")));
    }

    @PostMapping("/receipts")
    public CashReceiptDto createReceipt(@RequestBody @Valid CreateReceiptRequest req) {
        return cashService.createReceipt(req);
    }

    @PutMapping("/receipts/{id}/confirm")
    public void confirmReceipt(@PathVariable Long id) {
        cashService.confirmReceipt(id);
    }

    @DeleteMapping("/receipts/{id}")
    public void cancelReceipt(@PathVariable Long id) {
        cashService.cancelReceipt(id);
    }

    // ─── PHIẾU CHI ──────────────────────────────────────────────────────────
    @GetMapping("/payments")
    public PageResponse<CashPaymentDto> searchPayments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) PaymentType type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return cashService.searchPayments(fromDate, toDate, type, keyword, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "paymentDate", "createdAt")));
    }

    @PostMapping("/payments")
    public CashPaymentDto createPayment(@RequestBody @Valid CreatePaymentRequest req) {
        return cashService.createPayment(req);
    }

    @PutMapping("/payments/{id}/confirm")
    public void confirmPayment(@PathVariable Long id) {
        cashService.confirmPayment(id);
    }

    @DeleteMapping("/payments/{id}")
    public void cancelPayment(@PathVariable Long id) {
        cashService.cancelPayment(id);
    }

    // ─── SỔ QUỸ ─────────────────────────────────────────────────────────────
    @GetMapping("/ledger")
    public CashLedgerDto getLedger(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().withDayOfMonth(1);
        if (toDate == null) toDate = LocalDate.now();
        return cashService.getLedger(fromDate, toDate);
    }
}

