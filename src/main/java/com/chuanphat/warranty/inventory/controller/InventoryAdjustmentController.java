package com.chuanphat.warranty.inventory.controller;

import com.chuanphat.warranty.core.entity.InventoryAdjustment;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.ProductBatch;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.repository.InventoryAdjustmentRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.ProductBatchRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/adjustments")
@PreAuthorize("hasAnyRole('ADMIN')")
public class InventoryAdjustmentController {

    private final InventoryAdjustmentRepository adjustmentRepo;
    private final InventoryStockRepository stockRepo;
    private final InventoryTransactionRepository transactionRepo;
    private final ProductRepository productRepo;
    private final ProductBatchRepository batchRepo;
    private final ProductSerialRepository serialRepo;
    private final WarehouseRepository warehouseRepo;

    public InventoryAdjustmentController(
            InventoryAdjustmentRepository adjustmentRepo,
            InventoryStockRepository stockRepo,
            InventoryTransactionRepository transactionRepo,
            ProductRepository productRepo,
            ProductBatchRepository batchRepo,
            ProductSerialRepository serialRepo,
            WarehouseRepository warehouseRepo) {
        this.adjustmentRepo = adjustmentRepo;
        this.stockRepo = stockRepo;
        this.transactionRepo = transactionRepo;
        this.productRepo = productRepo;
        this.batchRepo = batchRepo;
        this.serialRepo = serialRepo;
        this.warehouseRepo = warehouseRepo;
    }

    @PostMapping
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CREATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryAdjustment")
    public ResponseEntity<?> createAdjustment(@RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            InventoryAdjustment adj = new InventoryAdjustment();
            adj.setAdjustmentNo("ADJ" + System.currentTimeMillis());
            
            Long branchId = Long.valueOf(payload.get("branchId").toString());
            Long warehouseId = Long.valueOf(payload.get("warehouseId").toString());
            Long productId = Long.valueOf(payload.get("productId").toString());
            
            adj.setBranchId(branchId);
            warehouseRepo.findById(warehouseId).ifPresent(adj::setWarehouse);
            productRepo.findById(productId).ifPresent(adj::setProduct);

            if (payload.containsKey("batchId") && payload.get("batchId") != null) {
                batchRepo.findById(Long.valueOf(payload.get("batchId").toString())).ifPresent(adj::setBatch);
            }
            if (payload.containsKey("serialId") && payload.get("serialId") != null) {
                serialRepo.findById(Long.valueOf(payload.get("serialId").toString())).ifPresent(adj::setSerial);
            }

            if (payload.containsKey("originalTransactionId") && payload.get("originalTransactionId") != null) {
                transactionRepo.findById(Long.valueOf(payload.get("originalTransactionId").toString()))
                    .ifPresent(adj::setOriginalTransaction);
            }
            
            adj.setOldQuantity(Integer.parseInt(payload.get("oldQuantity").toString()));
            adj.setNewQuantity(Integer.parseInt(payload.get("newQuantity").toString()));
            adj.setReason(payload.get("reason").toString());
            
            adj.setCreatedBy(auth != null ? auth.getName() : "system");

            return ResponseEntity.ok(adjustmentRepo.save(adj));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.APPROVE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryAdjustment")
    @Transactional
    public ResponseEntity<?> approveAdjustment(@PathVariable Long id, Authentication auth) {
        return adjustmentRepo.findById(id).map(adj -> {
            if (!"DRAFT".equals(adj.getStatus())) {
                throw new IllegalStateException("Chỉ duyệt phiếu Nháp");
            }
            String currentUser = auth != null ? auth.getName() : "system";
            boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && adj.getCreatedBy() != null && adj.getCreatedBy().equals(currentUser)) {
                throw new IllegalStateException("Lỗi phân quyền: Người tạo phiếu không được phép tự duyệt phiếu (Maker-Checker)");
            }

            int diff = adj.getNewQuantity() - adj.getOldQuantity();
            if (diff == 0) {
                adj.setStatus("APPROVED");
                return ResponseEntity.ok(adjustmentRepo.save(adj));
            }

            // Lock and update stock
            InventoryStock stock;
            if (adj.getSerial() != null) {
                stock = stockRepo.findWithLockByBranchIdAndWarehouseIdAndProductIdAndSerialId(
                        adj.getBranchId(), adj.getWarehouse().getId(), adj.getProduct().getId(), adj.getSerial().getId()
                ).orElseThrow(() -> new IllegalStateException("Không tìm thấy tồn kho"));
            } else if (adj.getBatch() != null) {
                stock = stockRepo.findWithLockByBranchIdAndWarehouseIdAndProductIdAndBatchId(
                        adj.getBranchId(), adj.getWarehouse().getId(), adj.getProduct().getId(), adj.getBatch().getId()
                ).orElseThrow(() -> new IllegalStateException("Không tìm thấy tồn kho"));
            } else {
                stock = stockRepo.findWithLockByBranchIdAndProductId(adj.getBranchId(), adj.getProduct().getId())
                        .orElseThrow(() -> new IllegalStateException("Không tìm thấy tồn kho"));
            }

            // Note: oldQuantity is what the user *thought* it was, but we apply the diff to actual current quantity.
            int finalQty = stock.getQuantity() + diff;
            if (finalQty < 0) {
                throw new IllegalStateException("Tồn kho sau điều chỉnh bị âm!");
            }
            stock.setQuantity(finalQty);
            stockRepo.save(stock);

            // Log Transaction
            InventoryTransaction tr = new InventoryTransaction();
            tr.setType(diff > 0 ? InventoryTransactionType.ADJUSTMENT_IN : InventoryTransactionType.ADJUSTMENT_OUT);
            tr.setTransactionNo(adj.getAdjustmentNo());
            tr.setTransactionDate(LocalDate.now());
            tr.setProduct(adj.getProduct());
            tr.setBatch(adj.getBatch());
            tr.setSerial(adj.getSerial());
            tr.setFromBranchId(adj.getBranchId());
            tr.setFromWarehouseId(adj.getWarehouse().getId());
            tr.setQuantity(Math.abs(diff));
            
            if (adj.getOriginalTransaction() != null) {
                tr.setUnitCost(adj.getOriginalTransaction().getUnitCost());
                tr.setTotalCost(adj.getOriginalTransaction().getUnitCost().multiply(BigDecimal.valueOf(Math.abs(diff))));
            } else {
                tr.setUnitCost(BigDecimal.ZERO);
            }
            tr.setCreatedBy(currentUser);
            transactionRepo.save(tr);

            adj.setStatus("APPROVED");
            return ResponseEntity.ok(adjustmentRepo.save(adj));
        }).orElse(ResponseEntity.notFound().build());
    }
}

