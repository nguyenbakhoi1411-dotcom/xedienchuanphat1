package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.PayableDto;
import com.chuanphat.warranty.core.dto.PayablePayRequest;
import com.chuanphat.warranty.core.enums.PayableStatus;
import com.chuanphat.warranty.core.service.PayableService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payables")
public class PayableController {

    private final PayableService payableService;

    public PayableController(PayableService payableService) {
        this.payableService = payableService;
    }

    /** Danh sach cong no (filter theo branch, status, supplier) */
    @GetMapping
    public PageResponse<PayableDto> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) PayableStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return payableService.list(branchId, status, supplierId, page, size);
    }

    /** Chi tiet 1 cong no */
    @GetMapping("/{id}")
    public PayableDto get(@PathVariable Long id) {
        return payableService.get(id);
    }

    /** Danh sach cong no chua tra cua 1 NCC */
    @GetMapping("/supplier/{supplierId}/open")
    public List<PayableDto> getOpenBySupplier(@PathVariable Long supplierId) {
        return payableService.getOpenBySupplier(supplierId);
    }

    /** Thanh toan cong no (mot phan hoac toan bo) */
    @PostMapping("/pay")
    public PayableDto pay(@Valid @RequestBody PayablePayRequest req) {
        return payableService.pay(req);
    }

    /** Bao cao tuoi no theo chi nhanh */
    @GetMapping("/aging-report")
    public List<PayableService.AgingBucket> agingReport(
            @RequestParam(required = false) Long branchId
    ) {
        return payableService.agingReport(branchId);
    }
}
