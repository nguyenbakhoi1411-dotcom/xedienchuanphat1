package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.CreateSerialRequest;
import com.chuanphat.warranty.core.dto.ProductSerialDto;
import com.chuanphat.warranty.core.dto.ProductSerialHistoryDto;
import com.chuanphat.warranty.core.dto.TransferSerialRequest;
import com.chuanphat.warranty.core.dto.UpdateSerialStatusRequest;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.service.SerialService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * SerialController — Quan ly toan bo vong doi serial xe dien.
 *
 * Endpoint prefix: /api/serials
 *
 * GET  /                        — Tim kiem / danh sach (keyword, branchId, warehouseId, productId, status)
 * GET  /lookup?q={identifier}   — Tim theo so khung, so pin, so may, serialNumber
 * GET  /{id}                    — Chi tiet serial
 * GET  /{id}/history            — Timeline lich su thay doi
 * POST /                        — Tao serial moi (nhap hang)
 * PATCH /{id}/status            — Cap nhat trang thai
 * POST /{id}/transfer           — Chuyen kho/chi nhanh
 * POST /{id}/mark-defective     — Danh dau xe loi
 * POST /{id}/send-to-warranty   — Dua vao bao hanh
 * POST /{id}/send-to-repair     — Dua vao sua chua
 * POST /{id}/return-from-repair — Hoan tra sau sua chua
 */
@RestController
@RequestMapping("/api/serials")
public class SerialController {

    private final SerialService serialService;

    public SerialController(SerialService serialService) {
        this.serialService = serialService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public PageResponse<ProductSerialDto> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) SerialStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int pageSize
    ) {
        return serialService.search(keyword, branchId, warehouseId, productId, status, page, pageSize);
    }

    @GetMapping("/lookup")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ProductSerialDto lookup(@RequestParam String q) {
        return serialService.findByIdentifier(q);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ProductSerialDto get(@PathVariable Long id) {
        return serialService.get(id);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public List<ProductSerialHistoryDto> history(@PathVariable Long id) {
        return serialService.getHistory(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    @Audited(action = AuditAction.CREATE_PRODUCT, module = AuditModule.INVENTORY, entityType = "ProductSerial")
    public ProductSerialDto create(@Valid @RequestBody CreateSerialRequest request) {
        return serialService.create(request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Audited(action = AuditAction.UPDATE_SERIAL_STATUS, module = AuditModule.INVENTORY, entityType = "ProductSerial", entityIdParam = "id")
    public ProductSerialDto updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSerialStatusRequest request
    ) {
        return serialService.updateStatus(id, request);
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasAuthority('INVENTORY_TRANSFER')")
    @Audited(action = AuditAction.TRANSFER_SERIAL, module = AuditModule.INVENTORY, entityType = "ProductSerial", entityIdParam = "id")
    public ProductSerialDto transfer(
            @PathVariable Long id,
            @Valid @RequestBody TransferSerialRequest request
    ) {
        return serialService.transfer(id, request);
    }

    @PostMapping("/{id}/mark-defective")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Audited(action = AuditAction.MARK_SERIAL_DEFECTIVE, module = AuditModule.INVENTORY, entityType = "ProductSerial", entityIdParam = "id")
    public ProductSerialDto markDefective(
            @PathVariable Long id,
            @RequestBody(required = false) MarkDefectiveRequest body
    ) {
        String reason = body != null ? body.reason() : null;
        return serialService.markDefective(id, reason);
    }

    @PostMapping("/{id}/send-to-warranty")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Audited(action = AuditAction.SEND_TO_WARRANTY, module = AuditModule.INVENTORY, entityType = "ProductSerial", entityIdParam = "id")
    public ProductSerialDto sendToWarranty(
            @PathVariable Long id,
            @RequestBody(required = false) SourceDocRequest body
    ) {
        String docType = body != null ? body.sourceDocumentType() : "MANUAL";
        String docId = body != null ? body.sourceDocumentId() : null;
        return serialService.sendToWarranty(id, docType, docId);
    }

    @PostMapping("/{id}/send-to-repair")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Audited(action = AuditAction.SEND_TO_REPAIR, module = AuditModule.INVENTORY, entityType = "ProductSerial", entityIdParam = "id")
    public ProductSerialDto sendToRepair(
            @PathVariable Long id,
            @RequestBody(required = false) RepairRequest body
    ) {
        String ticketNo = body != null ? body.ticketNo() : null;
        return serialService.sendToRepair(id, ticketNo);
    }

    @PostMapping("/{id}/return-from-repair")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    @Audited(action = AuditAction.RETURN_FROM_REPAIR, module = AuditModule.INVENTORY, entityType = "ProductSerial", entityIdParam = "id")
    public ProductSerialDto returnFromRepair(
            @PathVariable Long id,
            @RequestBody(required = false) NoteRequest body
    ) {
        String note = body != null ? body.note() : null;
        return serialService.returnFromRepair(id, note);
    }

    // ── Inner request records ──
    record MarkDefectiveRequest(String reason) {}
    record SourceDocRequest(String sourceDocumentType, String sourceDocumentId) {}
    record RepairRequest(String ticketNo) {}
    record NoteRequest(String note) {}
}
