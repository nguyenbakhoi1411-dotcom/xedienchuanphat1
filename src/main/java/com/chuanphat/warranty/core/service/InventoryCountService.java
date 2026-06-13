package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.InventoryCountDto;
import com.chuanphat.warranty.core.dto.InventoryCountItemSubmit;
import com.chuanphat.warranty.core.dto.InventoryCountRequest;
import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * InventoryCountService — Quan ly phieu kiem ke ton kho.
 *
 * Luong:
 *   1. create() → DRAFT + snapshot systemQuantity tu InventoryStock
 *   2. startCounting() → COUNTING
 *   3. submitCounts() → cap nhat counted/variance cho tung mat hang
 *   4. requestApproval() → PENDING_APPROVAL
 *   5. approve() → APPROVED + apply dieu chinh kho
 *   6. cancel() → CANCELLED (chi khi chua APPROVED)
 */
@Service
@Transactional
public class InventoryCountService {

    private final InventoryCountRepository countRepo;
    private final ProductRepository productRepo;
    private final WarehouseRepository warehouseRepo;
    private final InventoryStockRepository stockRepo;
    private final InventoryService inventoryService;
    private final BranchSecurity branchSecurity;

    public InventoryCountService(
            InventoryCountRepository countRepo,
            ProductRepository productRepo,
            WarehouseRepository warehouseRepo,
            InventoryStockRepository stockRepo,
            InventoryService inventoryService,
            BranchSecurity branchSecurity
    ) {
        this.countRepo = countRepo;
        this.productRepo = productRepo;
        this.warehouseRepo = warehouseRepo;
        this.stockRepo = stockRepo;
        this.inventoryService = inventoryService;
        this.branchSecurity = branchSecurity;
    }

    // ──────────────────────────────────────────────
    // QUERY
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<InventoryCountDto> list(Long branchId, InventoryCountStatus status, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (scopedBranchId == null) {
            if (status != null) return PageResponse.from(countRepo.findByStatus(status, pageable).map(InventoryCountDto::from));
            return PageResponse.from(countRepo.findAll(pageable).map(InventoryCountDto::from));
        }
        if (status != null) return PageResponse.from(countRepo.findByBranchIdAndStatus(scopedBranchId, status, pageable).map(InventoryCountDto::from));
        return PageResponse.from(countRepo.findByBranchId(scopedBranchId, pageable).map(InventoryCountDto::from));
    }

    @Transactional(readOnly = true)
    public InventoryCountDto get(Long id) {
        return InventoryCountDto.from(findById(id));
    }

    // ──────────────────────────────────────────────
    // CREATE — snapshot ton kho hien tai
    // ──────────────────────────────────────────────

    public InventoryCountDto create(InventoryCountRequest req) {
        branchSecurity.requireBranchAccess(req.branchId());

        Warehouse warehouse = null;
        Long warehouseId = req.warehouseId();
        if (warehouseId != null) {
            warehouse = warehouseRepo.findById(warehouseId)
                    .orElseThrow(() -> new BusinessException("Khong tim thay kho: " + warehouseId));
        }

        InventoryCount count = new InventoryCount();
        count.setCountNo(generateCountNo());
        count.setBranchId(req.branchId());
        count.setWarehouse(warehouse);
        count.setCountDate(req.countDate() != null ? req.countDate() : LocalDate.now());
        count.setNote(req.note());
        count.setCreatedBy(currentUsername());
        count.setStatus(InventoryCountStatus.DRAFT);

        // Snapshot ton kho hien tai
        List<InventoryStock> stocks;
        final Long finalWarehouseId = warehouseId;
        if (finalWarehouseId != null) {
            stocks = stockRepo.findAll().stream()
                    .filter(s -> finalWarehouseId.equals(s.getWarehouse() != null ? s.getWarehouse().getId() : null))
                    .toList();
        } else {
            stocks = stockRepo.findAll().stream()
                    .filter(s -> req.branchId().equals(s.getBranchId()))
                    .toList();
        }

        // Filter theo product neu co
        List<Long> productFilter = req.productIds();
        if (productFilter != null && !productFilter.isEmpty()) {
            stocks = stocks.stream()
                    .filter(s -> productFilter.contains(s.getProduct().getId()))
                    .toList();
        }

        for (InventoryStock stock : stocks) {
            InventoryCountItem item = new InventoryCountItem();
            item.setProduct(stock.getProduct());
            item.setSystemQuantity(stock.getQuantityOnHand());
            count.addItem(item);
        }

        return InventoryCountDto.from(countRepo.save(count));
    }

    // ──────────────────────────────────────────────
    // START COUNTING
    // ──────────────────────────────────────────────

    public InventoryCountDto startCounting(Long id) {
        InventoryCount count = findById(id);
        branchSecurity.requireBranchAccess(count.getBranchId());
        if (count.getStatus() != InventoryCountStatus.DRAFT) {
            throw new BusinessException("Chi chuyen trang thai tu DRAFT");
        }
        count.setStatus(InventoryCountStatus.COUNTING);
        return InventoryCountDto.from(countRepo.save(count));
    }

    // ──────────────────────────────────────────────
    // SUBMIT COUNTS — nhap so luong thuc te
    // ──────────────────────────────────────────────

    public InventoryCountDto submitCounts(Long id, List<InventoryCountItemSubmit> submissions) {
        InventoryCount count = findById(id);
        branchSecurity.requireBranchAccess(count.getBranchId());
        if (count.getStatus() != InventoryCountStatus.COUNTING
                && count.getStatus() != InventoryCountStatus.DRAFT) {
            throw new BusinessException("Chi nhap so luong khi phieu o trang thai DRAFT/COUNTING");
        }

        for (InventoryCountItemSubmit sub : submissions) {
            count.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(sub.productId()))
                    .findFirst()
                    .ifPresent(item -> {
                        item.setCountedQuantity(sub.countedQuantity());
                        item.setVarianceReason(sub.varianceReason());
                        item.setNote(sub.note());
                    });
        }

        if (count.getStatus() == InventoryCountStatus.DRAFT) {
            count.setStatus(InventoryCountStatus.COUNTING);
        }
        return InventoryCountDto.from(countRepo.save(count));
    }

    // ──────────────────────────────────────────────
    // REQUEST APPROVAL
    // ──────────────────────────────────────────────

    public InventoryCountDto requestApproval(Long id) {
        InventoryCount count = findById(id);
        branchSecurity.requireBranchAccess(count.getBranchId());
        if (count.getStatus() != InventoryCountStatus.COUNTING) {
            throw new BusinessException("Phai o trang thai COUNTING truoc khi gui duyet");
        }
        boolean allCounted = count.getItems().stream()
                .allMatch(item -> item.getCountedQuantity() != null);
        if (!allCounted) {
            throw new BusinessException("Con mat hang chua nhap so luong thuc te");
        }
        count.setStatus(InventoryCountStatus.PENDING_APPROVAL);
        return InventoryCountDto.from(countRepo.save(count));
    }

    // ──────────────────────────────────────────────
    // APPROVE — dieu chinh kho
    // ──────────────────────────────────────────────

    public InventoryCountDto approve(Long id) {
        InventoryCount count = findById(id);
        branchSecurity.requireBranchAccess(count.getBranchId());
        if (count.getStatus() != InventoryCountStatus.PENDING_APPROVAL) {
            throw new BusinessException("Phai o trang thai PENDING_APPROVAL de duyet");
        }

        Long warehouseId = count.getWarehouse() != null ? count.getWarehouse().getId() : null;

        for (InventoryCountItem item : count.getItems()) {
            if (item.getCountedQuantity() == null || item.isAdjustmentApplied()) continue;
            int variance = item.getVarianceQty();
            if (variance == 0) { item.setAdjustmentApplied(true); continue; }

            Product product = item.getProduct();

            if (variance > 0) {
                // Thua: tang kho
                inventoryService.increase(count.getBranchId(),
                        count.getWarehouse() != null ? count.getWarehouse()
                                : resolveMainWarehouse(count.getBranchId()),
                        product, variance, BigDecimal.ZERO);
            } else {
                // Thieu: giam kho (kiem tra khong am)
                if (warehouseId != null) {
                    inventoryService.decrease(count.getBranchId(), warehouseId, product.getId(), -variance);
                } else {
                    inventoryService.decrease(count.getBranchId(), product.getId(), -variance);
                }
            }
            item.setAdjustmentApplied(true);
        }

        count.setStatus(InventoryCountStatus.APPROVED);
        count.setApprovedBy(currentUsername());
        count.setApprovedAt(OffsetDateTime.now());
        return InventoryCountDto.from(countRepo.save(count));
    }

    // ──────────────────────────────────────────────
    // CANCEL
    // ──────────────────────────────────────────────

    public InventoryCountDto cancel(Long id) {
        InventoryCount count = findById(id);
        branchSecurity.requireBranchAccess(count.getBranchId());
        if (count.getStatus() == InventoryCountStatus.APPROVED) {
            throw new BusinessException("Khong the huy phieu kiem ke da duyet");
        }
        count.setStatus(InventoryCountStatus.CANCELLED);
        return InventoryCountDto.from(countRepo.save(count));
    }

    // ──────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────

    private InventoryCount findById(Long id) {
        return countRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay phieu kiem ke: " + id));
    }

    private String generateCountNo() {
        int seq = countRepo.findMaxCountSeq() + 1;
        return String.format("KKE%05d", seq);
    }

    private String currentUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception e) { return "SYSTEM"; }
    }

    private Warehouse resolveMainWarehouse(Long branchId) {
        return warehouseRepo.findByBranchIdAndTypeAndStatus(branchId,
                        com.chuanphat.warranty.core.enums.WarehouseType.MAIN,
                        com.chuanphat.warranty.core.enums.RecordStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("Khong tim thay kho chinh cho chi nhanh: " + branchId));
    }
}
