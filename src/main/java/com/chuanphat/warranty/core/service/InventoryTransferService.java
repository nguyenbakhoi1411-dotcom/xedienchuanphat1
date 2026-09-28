package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.accounting.service.AccountingPeriodService;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.InventoryTransferRequest;
import com.chuanphat.warranty.core.dto.InventoryTransferResponse;
import com.chuanphat.warranty.core.entity.InventoryTransfer;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.enums.TransferStatus;
import com.chuanphat.warranty.core.repository.InventoryTransferRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryTransferService {
    private static final String ENTITY_TYPE = "InventoryTransfer";
    private static final String SERIAL_RESERVATION_PREFIX = "TRANSFER:";

    private final InventoryTransferRepository transferRepository;
    private final ProductSerialRepository serialRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductService productService;
    private final BranchSecurity branchSecurity;
    private final WarehouseAccessService warehouseAccessService;
    private final InventoryService inventoryService;
    private final SerialService serialService;
    private final AccountingPeriodService accountingPeriodService;
    private final AuditLogService auditLogService;

    public InventoryTransferService(
            InventoryTransferRepository transferRepository,
            ProductSerialRepository serialRepository,
            WarehouseRepository warehouseRepository,
            ProductService productService,
            BranchSecurity branchSecurity,
            WarehouseAccessService warehouseAccessService,
            InventoryService inventoryService,
            SerialService serialService,
            AccountingPeriodService accountingPeriodService,
            AuditLogService auditLogService
    ) {
        this.transferRepository = transferRepository;
        this.serialRepository = serialRepository;
        this.warehouseRepository = warehouseRepository;
        this.productService = productService;
        this.branchSecurity = branchSecurity;
        this.warehouseAccessService = warehouseAccessService;
        this.inventoryService = inventoryService;
        this.serialService = serialService;
        this.accountingPeriodService = accountingPeriodService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public InventoryTransferResponse create(InventoryTransferRequest request) {
        branchSecurity.requireBranchAccess(request.fromBranchId());
        branchSecurity.requireBranchAccess(request.toBranchId());
        Warehouse from = requireWarehouse(request.fromBranchId(), request.fromWarehouseId());
        Warehouse to = requireWarehouse(request.toBranchId(), request.toWarehouseId());
        if (from.getId().equals(to.getId())) {
            throw new BusinessException("Kho nguồn và kho đích phải khác nhau");
        }
        warehouseAccessService.requireOperate(from.getId());
        warehouseAccessService.requireOperate(to.getId());
        Product product = productService.get(request.productId());
        ProductSerial serial = request.serialId() == null ? null
                : serialService.validateTransferCandidate(request.serialId(), product.getId(), from.getId());
        if (product.getCategory() == ProductCategory.ELECTRIC_MOTORBIKE && serial == null) {
            throw new BusinessException("Cần chọn serial cụ thể cho xe máy điện");
        }
        if (serial != null && (request.quantity() != 1 || !serial.getProduct().getId().equals(product.getId())
                || !serial.getBranchId().equals(from.getBranchId()))) {
            throw new BusinessException("Serial không thuộc sản phẩm/kho nguồn hoặc không khả dụng");
        }

        InventoryTransfer transfer = new InventoryTransfer();
        transfer.setTransferNo("TR-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        transfer.setTransferDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
        transfer.setFromBranchId(request.fromBranchId());
        transfer.setToBranchId(request.toBranchId());
        transfer.setFromWarehouse(from);
        transfer.setToWarehouse(to);
        transfer.setProduct(product);
        transfer.setQuantity(request.quantity());
        transfer.setNote(request.note());
        transfer.setSerial(serial);
        transfer.setApprovalRequired(true);
        transfer.setCreatedBy(actor());
        InventoryTransfer saved = transferRepository.save(transfer);
        audit(saved, "", TransferStatus.DRAFT.name(), null);
        return InventoryTransferResponse.from(saved);
    }

    @Transactional
    public InventoryTransferResponse submit(Long id) {
        InventoryTransfer transfer = locked(id);
        requireCreator(transfer);
        requireStatus(transfer, TransferStatus.DRAFT);
        if (transfer.getSerial() != null) {
            serialService.reserveForTransfer(transfer.getSerial().getId(), reservationKey(transfer),
                    transfer.getFromWarehouse().getId(), transfer.getProduct().getId());
        }
        transfer.setStatus(TransferStatus.PENDING_APPROVAL);
        audit(transfer, TransferStatus.DRAFT.name(), TransferStatus.PENDING_APPROVAL.name(), null);
        return InventoryTransferResponse.from(transfer);
    }

    @Transactional
    public InventoryTransferResponse createAndSubmit(InventoryTransferRequest request) {
        InventoryTransferResponse draft = create(request);
        return submit(draft.id());
    }

    @Transactional(readOnly = true)
    public List<InventoryTransferResponse> list() {
        List<Long> accessible = warehouseAccessService.currentAccessibleWarehouseIds(null);
        if (warehouseAccessService.isPrivileged()) {
            return transferRepository.findAll().stream().map(InventoryTransferResponse::from).toList();
        }
        if (accessible.isEmpty()) return List.of();
        return transferRepository.findByFromWarehouse_IdInOrToWarehouse_IdInOrderByCreatedAtDesc(accessible, accessible)
                .stream().map(InventoryTransferResponse::from).toList();
    }

    @Transactional
    public InventoryTransferResponse approve(Long id) {
        InventoryTransfer transfer = locked(id);
        String username = actor();
        if (username.equalsIgnoreCase(transfer.getCreatedBy())) {
            throw new AccessDeniedException("Người tạo không được tự duyệt phiếu chuyển kho");
        }
        warehouseAccessService.requireManage(transfer.getFromWarehouse().getId());
        warehouseAccessService.requireManage(transfer.getToWarehouse().getId());
        if (transfer.getStatus() == TransferStatus.APPROVED) return InventoryTransferResponse.from(transfer);
        requireStatus(transfer, TransferStatus.PENDING_APPROVAL);
        accountingPeriodService.assertPeriodNotLocked(transfer.getTransferDate(), transfer.getFromBranchId());
        if (transfer.getSerial() != null) {
            serialService.validatePendingTransfer(transfer.getSerial().getId(), reservationKey(transfer),
                    transfer.getFromWarehouse().getId(), transfer.getProduct().getId());
        }

        inventoryService.applyApprovedTransfer(transfer, username);
        if (transfer.getSerial() != null) {
            serialService.completeApprovedTransfer(transfer.getSerial().getId(), reservationKey(transfer),
                    transfer.getToWarehouse(), transfer.getFromWarehouse().getId(), transfer.getProduct().getId(),
                    transfer.getFromBranchId(), transfer.getToBranchId());
        }
        transfer.setStatus(TransferStatus.APPROVED);
        transfer.setApprovedBy(username);
        transfer.setApprovedAt(OffsetDateTime.now());
        transfer.setShippedAt(transfer.getApprovedAt());
        transfer.setReceivedAt(transfer.getApprovedAt());
        audit(transfer, TransferStatus.PENDING_APPROVAL.name(), TransferStatus.APPROVED.name(), null);
        return InventoryTransferResponse.from(transfer);
    }

    @Transactional
    public InventoryTransferResponse reject(Long id, String reason) {
        InventoryTransfer transfer = locked(id);
        requireStatus(transfer, TransferStatus.PENDING_APPROVAL);
        requireIndependentApprover(transfer);
        warehouseAccessService.requireManage(transfer.getFromWarehouse().getId());
        warehouseAccessService.requireManage(transfer.getToWarehouse().getId());
        releaseSerial(transfer);
        transfer.setStatus(TransferStatus.REJECTED);
        transfer.setRejectedBy(actor());
        transfer.setRejectedAt(OffsetDateTime.now());
        transfer.setRejectionReason(reason);
        audit(transfer, TransferStatus.PENDING_APPROVAL.name(), TransferStatus.REJECTED.name(), reason);
        return InventoryTransferResponse.from(transfer);
    }

    @Transactional
    public InventoryTransferResponse cancel(Long id) {
        InventoryTransfer transfer = locked(id);
        requireCreator(transfer);
        if (transfer.getStatus() != TransferStatus.DRAFT && transfer.getStatus() != TransferStatus.PENDING_APPROVAL) {
            throw new BusinessException("Chỉ có thể hủy phiếu nháp hoặc đang chờ duyệt");
        }
        TransferStatus previous = transfer.getStatus();
        releaseSerial(transfer);
        transfer.setStatus(TransferStatus.CANCELLED);
        transfer.setCancelledBy(actor());
        transfer.setCancelledAt(OffsetDateTime.now());
        audit(transfer, previous.name(), TransferStatus.CANCELLED.name(), null);
        return InventoryTransferResponse.from(transfer);
    }

    @Transactional
    public InventoryTransferResponse transferSerial(Long serialId, Long toBranchId, Long toWarehouseId, String note) {
        ProductSerial serial = serialRepository.findWithLockById(serialId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy serial"));
        if (serial.getStatus() != SerialStatus.IN_STOCK || serial.getWarehouse() == null) {
            throw new BusinessException("Serial không khả dụng để tạo phiếu chuyển");
        }
        Warehouse destination = requireWarehouse(toBranchId, toWarehouseId);
        return createAndSubmit(new InventoryTransferRequest(serial.getBranchId(), serial.getWarehouse().getId(),
                toBranchId, destination.getId(), serial.getProduct().getId(), 1, LocalDate.now(), note, serialId));
    }

    private Warehouse requireWarehouse(Long branchId, Long warehouseId) {
        Warehouse warehouse = warehouseId == null
                ? warehouseRepository.findByBranchIdAndTypeAndStatus(branchId,
                        com.chuanphat.warranty.core.enums.WarehouseType.MAIN,
                        com.chuanphat.warranty.core.enums.RecordStatus.ACTIVE)
                        .orElseThrow(() -> new BusinessException("Không tìm thấy kho chính"))
                : warehouseRepository.findById(warehouseId).orElseThrow(() -> new BusinessException("Không tìm thấy kho"));
        if (!branchId.equals(warehouse.getBranchId())) throw new BusinessException("Kho không thuộc chi nhánh đã chọn");
        return warehouse;
    }

    private InventoryTransfer locked(Long id) {
        return transferRepository.findWithLockById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy phiếu chuyển kho"));
    }

    private void requireStatus(InventoryTransfer transfer, TransferStatus expected) {
        if (transfer.getStatus() != expected) throw new BusinessException("Trạng thái phiếu phải là " + expected);
    }

    private void requireCreator(InventoryTransfer transfer) {
        if (!actor().equalsIgnoreCase(transfer.getCreatedBy())) {
            throw new AccessDeniedException("Chỉ người tạo được thực hiện thao tác này");
        }
    }

    private void requireIndependentApprover(InventoryTransfer transfer) {
        if (actor().equalsIgnoreCase(transfer.getCreatedBy())) {
            throw new AccessDeniedException("Người tạo không được tự duyệt hoặc từ chối phiếu");
        }
    }

    private void releaseSerial(InventoryTransfer transfer) {
        if (transfer.getStatus() == TransferStatus.PENDING_APPROVAL && transfer.getSerial() != null) {
            serialService.releaseTransferReservation(transfer.getSerial().getId(), reservationKey(transfer));
        }
    }

    private String reservationKey(InventoryTransfer transfer) {
        return SERIAL_RESERVATION_PREFIX + transfer.getTransferNo();
    }

    private String actor() {
        return branchSecurity.currentUser().getUsername();
    }

    private void audit(InventoryTransfer transfer, String oldValue, String newValue, String detail) {
        auditLogService.record(new CreateAuditLogRequest(actor(), AuditAction.TRANSFER_STOCK, AuditModule.INVENTORY,
                ENTITY_TYPE, transfer.getId() == null ? transfer.getTransferNo() : transfer.getId().toString(),
                oldValue, newValue + (detail == null ? "" : ": " + detail), null, null));
    }
}
