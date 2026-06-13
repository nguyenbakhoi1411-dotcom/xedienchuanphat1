package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.GoodsIssueDto;
import com.chuanphat.warranty.core.dto.GoodsIssueItemRequest;
import com.chuanphat.warranty.core.dto.GoodsIssueRequest;
import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.GoodsIssueType;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * GoodsIssueService — Quan ly phieu xuat kho.
 *
 * Luong: DRAFT → issue() → ISSUED (giam ton kho)
 *
 * Rang buoc:
 *   - Xe dien xuat phai co serialId, serial phai o trang thai phu hop
 *   - Phu tung: kiem tra ton du, khong cho am
 *   - WRITE_OFF can quyen INVENTORY_WRITE_OFF
 */
@Service
@Transactional
public class GoodsIssueService {

    private final GoodsIssueRepository issueRepo;
    private final ProductRepository productRepo;
    private final WarehouseRepository warehouseRepo;
    private final ProductSerialRepository serialRepo;
    private final InventoryService inventoryService;
    private final InventoryAverageCostRepository avgCostRepo;
    private final BranchSecurity branchSecurity;

    public GoodsIssueService(
            GoodsIssueRepository issueRepo,
            ProductRepository productRepo,
            WarehouseRepository warehouseRepo,
            ProductSerialRepository serialRepo,
            InventoryService inventoryService,
            InventoryAverageCostRepository avgCostRepo,
            BranchSecurity branchSecurity
    ) {
        this.issueRepo = issueRepo;
        this.productRepo = productRepo;
        this.warehouseRepo = warehouseRepo;
        this.serialRepo = serialRepo;
        this.inventoryService = inventoryService;
        this.avgCostRepo = avgCostRepo;
        this.branchSecurity = branchSecurity;
    }

    // ──────────────────────────────────────────────
    // QUERY
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<GoodsIssueDto> list(Long branchId, String status, GoodsIssueType type, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (scopedBranchId == null) {
            if (status != null) return PageResponse.from(issueRepo.findByStatus(status, pageable).map(GoodsIssueDto::from));
            return PageResponse.from(issueRepo.findAll(pageable).map(GoodsIssueDto::from));
        }
        if (type != null) return PageResponse.from(issueRepo.findByBranchIdAndIssueType(scopedBranchId, type, pageable).map(GoodsIssueDto::from));
        if (status != null) return PageResponse.from(issueRepo.findByBranchIdAndStatus(scopedBranchId, status, pageable).map(GoodsIssueDto::from));
        return PageResponse.from(issueRepo.findByBranchId(scopedBranchId, pageable).map(GoodsIssueDto::from));
    }

    @Transactional(readOnly = true)
    public GoodsIssueDto get(Long id) {
        return GoodsIssueDto.from(findById(id));
    }

    // ──────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────

    public GoodsIssueDto create(GoodsIssueRequest req) {
        branchSecurity.requireBranchAccess(req.branchId());

        Warehouse warehouse = null;
        if (req.warehouseId() != null) {
            warehouse = warehouseRepo.findById(req.warehouseId())
                    .orElseThrow(() -> new BusinessException("Khong tim thay kho: " + req.warehouseId()));
        }

        GoodsIssue issue = new GoodsIssue();
        issue.setIssueNo(generateIssueNo());
        issue.setBranchId(req.branchId());
        issue.setWarehouse(warehouse);
        issue.setIssueDate(req.issueDate() != null ? req.issueDate() : LocalDate.now());
        issue.setIssueType(req.issueType());
        issue.setReferenceType(req.referenceType());
        issue.setReferenceNo(req.referenceNo());
        issue.setNote(req.note());
        issue.setCreatedBy(currentUsername());

        for (GoodsIssueItemRequest itemReq : req.items()) {
            Product product = productRepo.findById(itemReq.productId())
                    .orElseThrow(() -> new BusinessException("Khong tim thay san pham: " + itemReq.productId()));

            GoodsIssueItem item = new GoodsIssueItem();
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());

            // Lay gia von hien tai
            BigDecimal cost = itemReq.unitCost() != null ? itemReq.unitCost()
                    : resolveUnitCost(req.branchId(), warehouse, product);
            item.setUnitCost(cost);

            if (itemReq.serialId() != null) {
                ProductSerial serial = serialRepo.findById(itemReq.serialId())
                        .orElseThrow(() -> new BusinessException("Khong tim thay serial: " + itemReq.serialId()));
                item.setSerial(serial);
                item.setUnitCost(serial.getPurchaseCost() != null ? serial.getPurchaseCost() : cost);
            }

            item.setNote(itemReq.note());
            issue.addItem(item);
        }

        return GoodsIssueDto.from(issueRepo.save(issue));
    }

    // ──────────────────────────────────────────────
    // ISSUE — xuat kho thuc su
    // ──────────────────────────────────────────────

    public GoodsIssueDto issue(Long id) {
        GoodsIssue issue = findById(id);
        branchSecurity.requireBranchAccess(issue.getBranchId());

        if (!"DRAFT".equals(issue.getStatus())) {
            throw new BusinessException("Chi xuat kho phieu o trang thai DRAFT");
        }

        Long warehouseId = issue.getWarehouse() != null ? issue.getWarehouse().getId() : null;

        for (GoodsIssueItem item : issue.getItems()) {
            if (item.getSerial() != null) {
                // Xe dien: doi trang thai serial
                ProductSerial serial = item.getSerial();
                validateSerialForIssue(serial, issue.getIssueType());
                serial.setStatus(mapIssueTypeToSerialStatus(issue.getIssueType()));
                serialRepo.save(serial);
                // Giam ton 1 don vi
                if (warehouseId != null) {
                    inventoryService.decrease(issue.getBranchId(), warehouseId, item.getProduct().getId(), 1);
                } else {
                    inventoryService.decrease(issue.getBranchId(), item.getProduct().getId(), 1);
                }
            } else {
                // Phu tung: giam ton theo so luong
                if (warehouseId != null) {
                    inventoryService.decrease(issue.getBranchId(), warehouseId, item.getProduct().getId(), item.getQuantity());
                } else {
                    inventoryService.decrease(issue.getBranchId(), item.getProduct().getId(), item.getQuantity());
                }
            }
        }

        issue.setStatus("ISSUED");
        issue.setIssuedBy(currentUsername());
        issue.setIssuedAt(OffsetDateTime.now());
        return GoodsIssueDto.from(issueRepo.save(issue));
    }

    // ──────────────────────────────────────────────
    // CANCEL
    // ──────────────────────────────────────────────

    public GoodsIssueDto cancel(Long id) {
        GoodsIssue issue = findById(id);
        branchSecurity.requireBranchAccess(issue.getBranchId());
        if ("ISSUED".equals(issue.getStatus())) {
            throw new BusinessException("Khong the huy phieu xuat da thuc hien. Tao phieu nhap tra kho.");
        }
        issue.setStatus("CANCELLED");
        return GoodsIssueDto.from(issueRepo.save(issue));
    }

    // ──────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────

    private void validateSerialForIssue(ProductSerial serial, GoodsIssueType type) {
        if (serial.getStatus() == SerialStatus.SOLD) {
            throw new BusinessException("Serial da duoc ban: " + serial.getSerialNumber());
        }
        if (serial.getStatus() == SerialStatus.DEFECTIVE || serial.getStatus() == SerialStatus.DAMAGED) {
            if (type != GoodsIssueType.WRITE_OFF) {
                throw new BusinessException("Serial bi loi, chi co the xuat huy (WRITE_OFF)");
            }
        }
    }

    private SerialStatus mapIssueTypeToSerialStatus(GoodsIssueType type) {
        return switch (type) {
            case SALE -> SerialStatus.SOLD;
            case WARRANTY, SERVICE -> SerialStatus.WARRANTY;
            case WRITE_OFF -> SerialStatus.DEFECTIVE;
            case TRANSFER -> SerialStatus.TRANSFERRED;
            default -> SerialStatus.SOLD;
        };
    }

    private BigDecimal resolveUnitCost(Long branchId, Warehouse warehouse, Product product) {
        if (warehouse != null) {
            return avgCostRepo.findByBranchIdAndWarehouseIdAndProductId(branchId, warehouse.getId(), product.getId())
                    .map(c -> c.getAverageCost())
                    .orElse(product.getImportPrice());
        }
        return product.getImportPrice();
    }

    private GoodsIssue findById(Long id) {
        return issueRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay phieu xuat: " + id));
    }

    private String generateIssueNo() {
        int seq = issueRepo.findMaxIssueSeq() + 1;
        return String.format("PXK%05d", seq);
    }

    private String currentUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception e) { return "SYSTEM"; }
    }
}
