package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.InventoryExportRequest;
import com.chuanphat.warranty.core.dto.InventoryImportRequest;
import com.chuanphat.warranty.core.dto.InventoryStockDto;
import com.chuanphat.warranty.core.dto.InventoryStocktakeRequest;
import com.chuanphat.warranty.core.dto.InventoryTransactionDto;
import com.chuanphat.warranty.core.dto.InventoryMutationRequest;
import com.chuanphat.warranty.core.dto.InventoryStockConfigurationRequest;
import com.chuanphat.warranty.core.dto.InventoryTransferRequest;
import com.chuanphat.warranty.core.dto.WarehouseDto;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.InventoryMutationType;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private final InventoryTransactionRepository transactionRepository;
    private final InventoryAverageCostRepository averageCostRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductService productService;
    private final BranchSecurity branchSecurity;
    private final WarehouseAccessService warehouseAccessService;
    private final InventoryMutationService mutationService;

    public InventoryService(
            InventoryTransactionRepository transactionRepository,
            InventoryAverageCostRepository averageCostRepository,
            WarehouseRepository warehouseRepository,
            ProductService productService,
            BranchSecurity branchSecurity,
            WarehouseAccessService warehouseAccessService,
            InventoryMutationService mutationService
    ) {
        this.transactionRepository = transactionRepository;
        this.averageCostRepository = averageCostRepository;
        this.warehouseRepository = warehouseRepository;
        this.productService = productService;
        this.branchSecurity = branchSecurity;
        this.warehouseAccessService = warehouseAccessService;
        this.mutationService = mutationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryStockDto> list(Long branchId, Long warehouseId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        PageRequest pageRequest = PageRequest.of(page, pageSize);
        if (warehouseId != null) {
            Warehouse warehouse = warehouseRepository.findById(warehouseId).orElseThrow(() -> new BusinessException("Warehouse not found"));
            branchSecurity.requireBranchAccess(warehouse.getBranchId());
            warehouseAccessService.requireView(warehouseId);
            return PageResponse.from(mutationService.findByWarehouseId(warehouseId, pageRequest).map(this::stockDto));
        }
        if (warehouseAccessService.isPrivileged()) {
            if (scopedBranchId == null) {
                return PageResponse.from(mutationService.findAll(pageRequest).map(this::stockDto));
            }
            return PageResponse.from(mutationService.findByBranchId(scopedBranchId, pageRequest).map(this::stockDto));
        }
        List<Long> warehouseIds = warehouseAccessService.currentAccessibleWarehouseIds(scopedBranchId);
        return PageResponse.from(warehouseIds.isEmpty()
                ? Page.<InventoryStock>empty(pageRequest).map(this::stockDto)
                : mutationService.findByWarehouseIds(warehouseIds, pageRequest).map(this::stockDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<WarehouseDto> warehouses(Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        PageRequest pageRequest = PageRequest.of(page, pageSize);
        if (warehouseAccessService.isPrivileged()) {
            if (scopedBranchId == null) {
                return PageResponse.from(warehouseRepository.findByStatusNot(RecordStatus.DELETED, pageRequest).map(WarehouseDto::from));
            }
            return PageResponse.from(warehouseRepository.findByBranchId(scopedBranchId, pageRequest).map(WarehouseDto::from));
        }
        List<Long> warehouseIds = warehouseAccessService.currentAccessibleWarehouseIds(scopedBranchId);
        return PageResponse.from(warehouseIds.isEmpty()
                ? Page.<Warehouse>empty(pageRequest).map(WarehouseDto::from)
                : warehouseRepository.findByIdIn(warehouseIds, pageRequest).map(WarehouseDto::from));
    }

    @Transactional
    public InventoryStockDto upsert(InventoryStockDto request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        warehouseAccessService.requireOperate(warehouse.getId());
        return stockDto(mutationService.configure(new InventoryStockConfigurationRequest(
                request.branchId(), warehouse.getId(), request.productId(), request.quantityOnHand(),
                request.reservedQuantity(), request.minQuantity(), request.maxQuantity()), currentUsername()));
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryTransactionDto> transactions(Long branchId, InventoryTransactionType type, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(page, pageSize);
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (!warehouseAccessService.isPrivileged()) {
            List<Long> warehouseIds = warehouseAccessService.currentAccessibleWarehouseIds(scopedBranchId);
            return PageResponse.from(warehouseIds.isEmpty()
                    ? Page.<InventoryTransaction>empty(pageRequest).map(InventoryTransactionDto::from)
                    : transactionRepository.findAccessible(warehouseIds, type, pageRequest).map(InventoryTransactionDto::from));
        }
        if (type != null) {
            if (scopedBranchId != null) {
                return PageResponse.from(transactionRepository
                        .findByTypeAndFromBranchIdOrTypeAndToBranchId(type, scopedBranchId, type, scopedBranchId, pageRequest)
                        .map(InventoryTransactionDto::from));
            }
            return PageResponse.from(transactionRepository.findByType(type, pageRequest).map(InventoryTransactionDto::from));
        }
        if (scopedBranchId == null) {
            return PageResponse.from(transactionRepository.findAll(pageRequest).map(InventoryTransactionDto::from));
        }
        return PageResponse.from(transactionRepository.findByFromBranchIdOrToBranchId(scopedBranchId, scopedBranchId, pageRequest).map(InventoryTransactionDto::from));
    }

    @Transactional
    public InventoryTransactionDto importStock(InventoryImportRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Product product = productService.get(request.productId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        warehouseAccessService.requireOperate(warehouse.getId());
        return InventoryTransactionDto.from(mutate(warehouse.getId(), product.getId(), request.quantity(),
                InventoryMutationType.IMPORT, request.note(), "INVENTORY_IMPORT", null,
                request.note(), currentUsername(), request.transactionDate(), request.unitCost()));
    }

    @Transactional
    public InventoryTransaction importOpeningBalance(Long branchId, Long productId, int targetQuantity,
                                                      int minQuantity, BigDecimal unitCost, String importRef) {
        branchSecurity.requireBranchAccess(branchId);
        Warehouse warehouse = resolveWarehouse(branchId, null);
        warehouseAccessService.requireOperate(warehouse.getId());
        return mutationService.setQuantity(new InventoryMutationRequest(
                warehouse.getId(), productId, 0, InventoryMutationType.OPENING_BALANCE,
                "Opening balance import", "DATA_IO_IMPORT", importRef, importRef,
                currentUsername(), LocalDate.now(), unitCost), targetQuantity, minQuantity);
    }

    @Transactional
    public InventoryTransaction issueSalesOrder(Long branchId, Long warehouseId, Product product, int quantity,
                                               Long orderId, String orderNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        return mutate(warehouse.getId(), product.getId(), -quantity, InventoryMutationType.SALES_ISSUE,
                "Sale order " + orderNo, "SALES_ORDER", String.valueOf(orderId), orderNo,
                currentUsername(), LocalDate.now(), null);
    }

    @Transactional
    public InventoryTransaction issueGoodsItem(Long branchId, Long warehouseId, Product product, int quantity,
                                               String issueType, Long issueId, String issueNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        InventoryMutationType type = switch (issueType) {
            case "WRITE_OFF" -> InventoryMutationType.WRITE_OFF;
            case "SALE" -> InventoryMutationType.SALES_ISSUE;
            default -> InventoryMutationType.GOODS_ISSUE;
        };
        return mutate(warehouse.getId(), product.getId(), -quantity, type,
                "Goods issue " + issueNo, "GOODS_ISSUE", String.valueOf(issueId), issueNo,
                currentUsername(), LocalDate.now(), null);
    }

    @Transactional
    public InventoryTransaction receivePurchaseReceiptItem(Long branchId, Warehouse warehouse, Product product,
                                                           int quantity, BigDecimal unitCost, Long receiptId,
                                                           String receiptNo) {
        return mutate(warehouse.getId(), product.getId(), quantity, InventoryMutationType.PURCHASE_RECEIPT,
                "Purchase receipt " + receiptNo, "PURCHASE_RECEIPT", String.valueOf(receiptId), receiptNo,
                currentUsername(), LocalDate.now(), unitCost);
    }

    @Transactional
    public InventoryTransaction adjustInventoryCount(Long branchId, Long warehouseId, Product product, int delta,
                                                     Long countId, String countNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        return mutate(warehouse.getId(), product.getId(), delta, InventoryMutationType.COUNT_ADJUSTMENT,
                "Inventory count " + countNo, "INVENTORY_COUNT", String.valueOf(countId), countNo,
                currentUsername(), LocalDate.now(), null);
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> stockSnapshotForWarehouse(Long warehouseId) {
        return mutationService.snapshotForWarehouse(warehouseId);
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> stockSnapshotForBranch(Long branchId) {
        return mutationService.snapshotForBranch(branchId);
    }

    @Transactional
    public InventoryTransaction issuePurchaseReturn(Long branchId, Long warehouseId, Product product, int quantity,
                                                    Long returnId, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        return mutate(warehouse.getId(), product.getId(), -quantity, InventoryMutationType.PURCHASE_RETURN,
                "Purchase return " + returnNo, "PURCHASE_RETURN", String.valueOf(returnId), returnNo,
                currentUsername(), LocalDate.now(), null);
    }

    @Transactional
    public InventoryTransaction processSalesReturn(Long branchId, Long warehouseId, Product product, int quantity,
                                                   Long returnId, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        return mutate(warehouse.getId(), product.getId(), quantity, InventoryMutationType.SALES_RETURN,
                "Sales return " + returnNo, "SALES_RETURN", String.valueOf(returnId), returnNo,
                currentUsername(), LocalDate.now(), averageCost(branchId, warehouse.getId(), product.getId()));
    }

    @Transactional
    public InventoryTransaction writeOffSalesReturn(Long branchId, Long warehouseId, Product product, int quantity,
                                                   Long returnId, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        return record(InventoryTransactionType.WRITE_OFF, product, branchId, null,
                warehouse.getId(), null, quantity, averageCost(branchId, warehouse.getId(), product.getId()),
                LocalDate.now(), "Sales return write-off " + returnNo, "SALES_RETURN", String.valueOf(returnId));
    }

    @Transactional
    public InventoryTransactionDto exportStock(InventoryExportRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Product product = productService.get(request.productId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        warehouseAccessService.requireOperate(warehouse.getId());
        return InventoryTransactionDto.from(mutate(warehouse.getId(), product.getId(), -request.quantity(),
                InventoryMutationType.EXPORT, request.note(), "INVENTORY_EXPORT", null,
                request.note(), currentUsername(), request.transactionDate(), null));
    }

    @Transactional
    public void transfer(InventoryTransferRequest request) {
        if (request.fromBranchId().equals(request.toBranchId())) {
            throw new BusinessException("fromBranchId and toBranchId must be different");
        }
        branchSecurity.requireBranchAccess(request.fromBranchId());
        branchSecurity.requireBranchAccess(request.toBranchId());
        Product product = productService.get(request.productId());
        Warehouse fromWarehouse = resolveWarehouse(request.fromBranchId(), request.fromWarehouseId());
        Warehouse toWarehouse = resolveWarehouse(request.toBranchId(), request.toWarehouseId());
        warehouseAccessService.requireOperate(fromWarehouse.getId());
        warehouseAccessService.requireOperate(toWarehouse.getId());
        BigDecimal movingCost = averageCost(request.fromBranchId(), fromWarehouse.getId(), request.productId());
        String transferRef = UUID.randomUUID().toString();
        mutate(fromWarehouse.getId(), product.getId(), -request.quantity(), InventoryMutationType.TRANSFER_OUT,
                request.note(), "INVENTORY_TRANSFER", transferRef, request.note(), currentUsername(), request.transactionDate(), movingCost);
        mutate(toWarehouse.getId(), product.getId(), request.quantity(), InventoryMutationType.TRANSFER_IN,
                request.note(), "INVENTORY_TRANSFER", transferRef, request.note(), currentUsername(), request.transactionDate(), movingCost);
    }

    @Transactional
    public InventoryTransactionDto stocktake(InventoryStocktakeRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Product product = productService.get(request.productId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        warehouseAccessService.requireOperate(warehouse.getId());
        InventoryTransaction transaction = mutationService.setQuantity(new InventoryMutationRequest(
                warehouse.getId(), product.getId(), 0, InventoryMutationType.COUNT_ADJUSTMENT,
                request.note() == null ? "Inventory stocktake" : request.note(), "STOCKTAKE", null,
                request.note(), currentUsername(), request.transactionDate(), null), request.countedQuantity());
        if (transaction == null) {
            return InventoryTransactionDto.from(record(InventoryTransactionType.STOCKTAKE, product, null,
                    request.branchId(), null, warehouse.getId(), 0,
                    averageCost(request.branchId(), warehouse.getId(), request.productId()), request.transactionDate(), request.note()));
        }
        return InventoryTransactionDto.from(transaction);
    }

    @Transactional
    public void decrease(Long branchId, Long productId, int quantity) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        decrease(branchId, warehouse.getId(), productId, quantity);
    }

    @Transactional
    public void decrease(Long branchId, Long warehouseId, Long productId, int quantity) {
        mutate(warehouseId, productId, -quantity, InventoryMutationType.MANUAL_CORRECTION,
                "Inventory decrease", "MANUAL_INVENTORY_MUTATION", null, null, currentUsername(), LocalDate.now(), null);
    }

    @Transactional
    public void recordSale(Long branchId, Product product, int quantity, String orderNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        recordSale(branchId, warehouse.getId(), product, quantity, orderNo);
    }

    @Transactional
    public void recordSale(Long branchId, Long warehouseId, Product product, int quantity, String orderNo) {
        mutate(warehouseId, product.getId(), -quantity, InventoryMutationType.SALES_ISSUE,
                "Sale order " + orderNo, "SALES_ORDER", orderNo, orderNo, currentUsername(), LocalDate.now(), null);
    }

    @Transactional
    public void recordPurchaseReturn(Long branchId, Long warehouseId, Product product, int quantity, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        mutate(warehouse.getId(), product.getId(), -quantity, InventoryMutationType.PURCHASE_RETURN,
                "Purchase return " + returnNo, "PURCHASE_RETURN", returnNo, returnNo, currentUsername(), LocalDate.now(), null);
    }

    @Transactional
    public void returnStock(Long branchId, Product product, int quantity, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        processSalesReturn(branchId, warehouse.getId(), product, quantity, returnNo);
    }

    @Transactional
    public void processSalesReturn(Long branchId, Long warehouseId, Product product, int quantity, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        mutate(warehouse.getId(), product.getId(), quantity, InventoryMutationType.SALES_RETURN,
                "Sales return " + returnNo, "SALES_RETURN", returnNo, returnNo, currentUsername(), LocalDate.now(), averageCost(branchId, warehouse.getId(), product.getId()));
    }

    @Transactional
    public void recordWriteOff(Long branchId, Long warehouseId, Product product, int quantity, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, warehouseId);
        record(InventoryTransactionType.WRITE_OFF, product, branchId, null, warehouse.getId(), null, quantity,
                averageCost(branchId, warehouse.getId(), product.getId()), LocalDate.now(), "Sales return write-off " + returnNo);
    }

    @Transactional
    public void increaseForReturn(Long branchId, Product product, int quantity, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        processSalesReturn(branchId, warehouse.getId(), product, quantity, returnNo);
    }

    @Transactional
    public void recordReservation(Long branchId, Product product, int quantity, String orderNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        record(InventoryTransactionType.RESERVE, product, branchId, null, warehouse.getId(), null, quantity, averageCost(branchId, warehouse.getId(), product.getId()), LocalDate.now(), "Reserve for sales order " + orderNo);
    }

    @Transactional
    public void recordReservationRelease(Long branchId, Product product, int quantity, String orderNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        record(InventoryTransactionType.RELEASE_RESERVATION, product, null, branchId, null, warehouse.getId(), quantity, averageCost(branchId, warehouse.getId(), product.getId()), LocalDate.now(), "Release reservation " + orderNo);
    }

    public void increase(Long branchId, Product product, int quantity) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        increase(branchId, warehouse, product, quantity, product.getImportPrice());
    }

    public BigDecimal increase(Long branchId, Warehouse warehouse, Product product, int quantity, BigDecimal unitCost) {
        InventoryTransaction transaction = mutate(warehouse.getId(), product.getId(), quantity,
                InventoryMutationType.MANUAL_CORRECTION, "Inventory increase", "MANUAL_INVENTORY_MUTATION",
                null, null, currentUsername(), LocalDate.now(), unitCost);
        return transaction.getUnitCost();
    }

    private InventoryStockDto stockDto(InventoryStock stock) {
        BigDecimal averageCost = stock.getWarehouse() == null ? BigDecimal.ZERO : averageCost(stock.getBranchId(), stock.getWarehouse().getId(), stock.getProduct().getId());
        return InventoryStockDto.from(stock, averageCost);
    }

    private Warehouse resolveWarehouse(Long branchId, Long warehouseId) {
        if (warehouseId != null) {
            Warehouse warehouse = warehouseRepository.findById(warehouseId).orElseThrow(() -> new BusinessException("Warehouse not found"));
            if (!warehouse.getBranchId().equals(branchId)) {
                throw new BusinessException("Warehouse belongs to another branch");
            }
            return warehouse;
        }
        return warehouseRepository.findByBranchIdAndTypeAndStatus(branchId, WarehouseType.MAIN, RecordStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("Main warehouse is required for branch " + branchId));
    }

    private BigDecimal averageCost(Long branchId, Long warehouseId, Long productId) {
        return averageCostRepository.findByBranchIdAndWarehouseIdAndProductId(branchId, warehouseId, productId)
                .map(InventoryAverageCost::getAverageCost)
                .orElse(BigDecimal.ZERO);
    }

    private InventoryTransaction mutate(Long warehouseId, Long productId, int delta,
                                        InventoryMutationType type, String reason, String referenceType,
                                        String referenceId, String referenceNo, String actor,
                                        LocalDate date, BigDecimal unitCost) {
        return mutationService.apply(new InventoryMutationRequest(warehouseId, productId, delta, type,
                reason == null || reason.isBlank() ? type.name() : reason,
                referenceType, referenceId, referenceNo, actor, date, unitCost));
    }

    private String currentUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception exception) { return "system"; }
    }

    private InventoryTransaction record(
            InventoryTransactionType type,
            Product product,
            Long fromBranchId,
            Long toBranchId,
            Long fromWarehouseId,
            Long toWarehouseId,
            int quantity,
            BigDecimal unitCost,
            LocalDate transactionDate,
            String note
    ) {
        return record(type, product, fromBranchId, toBranchId, fromWarehouseId, toWarehouseId, quantity,
                unitCost, transactionDate, note, "INVENTORY_OPERATION", UUID.randomUUID().toString());
    }

    private InventoryTransaction record(
            InventoryTransactionType type,
            Product product,
            Long fromBranchId,
            Long toBranchId,
            Long fromWarehouseId,
            Long toWarehouseId,
            int quantity,
            BigDecimal unitCost,
            LocalDate transactionDate,
            String note,
            String referenceType,
            String referenceId
    ) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setType(type);
        transaction.setTransactionNo(type.name() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transaction.setTransactionDate(transactionDate == null ? LocalDate.now() : transactionDate);
        transaction.setProduct(product);
        transaction.setFromBranchId(fromBranchId);
        transaction.setToBranchId(toBranchId);
        transaction.setFromWarehouseId(fromWarehouseId);
        transaction.setToWarehouseId(toWarehouseId);
        transaction.setQuantity(quantity);
        transaction.setUnitCost(unitCost);
        transaction.setTotalCost((unitCost == null ? BigDecimal.ZERO : unitCost).multiply(BigDecimal.valueOf(quantity)));
        transaction.setNote(note);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);
        transaction.setCreatedBy(currentUsername());
        return transactionRepository.save(transaction);
    }
}
