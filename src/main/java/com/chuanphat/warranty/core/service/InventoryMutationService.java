package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.InventoryMutationRequest;
import com.chuanphat.warranty.core.dto.InventoryStockConfigurationRequest;
import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.InventoryMutationType;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryMutationService {
    private final InventoryStockRepository stockRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final InventoryAverageCostRepository averageCostRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final BranchSecurity branchSecurity;
    private final WarehouseAccessService warehouseAccessService;

    public InventoryMutationService(
            InventoryStockRepository stockRepository,
            InventoryTransactionRepository transactionRepository,
            InventoryAverageCostRepository averageCostRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            BranchSecurity branchSecurity,
            WarehouseAccessService warehouseAccessService
    ) {
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
        this.averageCostRepository = averageCostRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.branchSecurity = branchSecurity;
        this.warehouseAccessService = warehouseAccessService;
    }

    @Transactional
    public InventoryTransaction apply(InventoryMutationRequest request) {
        validate(request);
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new BusinessException("Warehouse not found: " + request.warehouseId()));
        branchSecurity.requireBranchAccess(warehouse.getBranchId());
        warehouseAccessService.requireOperate(warehouse.getId());

        // Lock the product first so two first-time mutations cannot race to insert the unique stock row.
        Product product = productRepository.findWithLockById(request.productId())
                .orElseThrow(() -> new BusinessException("Product not found: " + request.productId()));
        InventoryStock stock = stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(
                        warehouse.getBranchId(), warehouse.getId(), product.getId())
                .orElseGet(() -> newStock(warehouse, product));
        return mutate(request, warehouse, product, stock);
    }

    @Transactional
    public InventoryTransaction setQuantity(InventoryMutationRequest request, int targetQuantity) {
        return setQuantity(request, targetQuantity, null);
    }

    @Transactional
    public InventoryTransaction setQuantity(InventoryMutationRequest request, int targetQuantity, Integer minQuantity) {
        validate(request, true);
        if (targetQuantity < 0) throw new BusinessException("Inventory quantity cannot be negative");
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new BusinessException("Warehouse not found: " + request.warehouseId()));
        branchSecurity.requireBranchAccess(warehouse.getBranchId());
        warehouseAccessService.requireOperate(warehouse.getId());
        Product product = productRepository.findWithLockById(request.productId())
                .orElseThrow(() -> new BusinessException("Product not found: " + request.productId()));
        InventoryStock stock = stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(
                        warehouse.getBranchId(), warehouse.getId(), product.getId())
                .orElseGet(() -> newStock(warehouse, product));
        if (minQuantity != null) stock.setMinQuantity(minQuantity);
        int delta = targetQuantity - stock.getQuantityOnHand();
        if (delta == 0) {
            if (minQuantity != null) stockRepository.save(stock);
            return null;
        }
        InventoryMutationRequest actual = new InventoryMutationRequest(request.warehouseId(), request.productId(), delta,
                request.transactionType(), request.reason(), request.referenceType(), request.referenceId(),
                request.referenceNo(), request.performedBy(), request.transactionDate(), request.unitCost());
        return mutate(actual, warehouse, product, stock);
    }

    @Transactional(readOnly = true)
    public Page<InventoryStock> findByWarehouseId(Long warehouseId, Pageable pageable) {
        return stockRepository.findByWarehouse_Id(warehouseId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<InventoryStock> findByWarehouseIds(List<Long> warehouseIds, Pageable pageable) {
        return stockRepository.findByWarehouse_IdIn(warehouseIds, pageable);
    }

    @Transactional(readOnly = true)
    public Page<InventoryStock> findByBranchId(Long branchId, Pageable pageable) {
        return stockRepository.findByBranchId(branchId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<InventoryStock> findAll(Pageable pageable) {
        return stockRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> snapshotForWarehouse(Long warehouseId) {
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getWarehouse() != null && warehouseId.equals(stock.getWarehouse().getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryStock> snapshotForBranch(Long branchId) {
        return stockRepository.findAll().stream().filter(stock -> branchId.equals(stock.getBranchId())).toList();
    }

    @Transactional(readOnly = true)
    public Optional<InventoryStock> findStock(Long branchId, Long warehouseId, Long productId) {
        return stockRepository.findByBranchIdAndWarehouseIdAndProductId(branchId, warehouseId, productId);
    }

    private InventoryTransaction mutate(InventoryMutationRequest request, Warehouse warehouse, Product product, InventoryStock stock) {
        int newQuantity = Math.addExact(stock.getQuantityOnHand(), request.deltaQuantity());
        if (newQuantity < 0) {
            throw new BusinessException("Inventory mutation would make stock negative");
        }
        if (request.deltaQuantity() < 0 && stock.getAvailableQuantity() < Math.abs(request.deltaQuantity())) {
            throw new BusinessException("Inventory mutation exceeds available stock");
        }

        BigDecimal unitCost = resolveUnitCost(request, warehouse, product);
        stock.setBranchId(warehouse.getBranchId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(newQuantity);
        stockRepository.save(stock);
        updateAverageCost(warehouse, product, request.deltaQuantity(), unitCost, newQuantity);

        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setType(ledgerType(request.transactionType(), request.deltaQuantity()));
        transaction.setTransactionNo("INV-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        transaction.setTransactionDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
        transaction.setProduct(product);
        transaction.setFromBranchId(request.deltaQuantity() < 0 ? warehouse.getBranchId() : null);
        transaction.setToBranchId(request.deltaQuantity() > 0 ? warehouse.getBranchId() : null);
        transaction.setFromWarehouseId(request.deltaQuantity() < 0 ? warehouse.getId() : null);
        transaction.setToWarehouseId(request.deltaQuantity() > 0 ? warehouse.getId() : null);
        transaction.setQuantity(Math.abs(request.deltaQuantity()));
        transaction.setUnitCost(unitCost);
        transaction.setTotalCost(unitCost.multiply(BigDecimal.valueOf(Math.abs(request.deltaQuantity()))));
        transaction.setReferenceType(request.referenceType().trim());
        transaction.setReferenceId(request.referenceId() == null || request.referenceId().isBlank()
                ? UUID.randomUUID().toString() : request.referenceId().trim());
        transaction.setReferenceNo(request.referenceNo());
        transaction.setNote(request.reason().trim());
        transaction.setCreatedBy(request.performedBy().trim());
        return transactionRepository.save(transaction);
    }

    @Transactional
    public InventoryStock configure(InventoryStockConfigurationRequest requested, String performedBy) {
        Warehouse warehouse = warehouseRepository.findById(requested.warehouseId())
                .orElseThrow(() -> new BusinessException("Warehouse not found"));
        if (!warehouse.getBranchId().equals(requested.branchId())) {
            throw new BusinessException("Warehouse belongs to another branch");
        }
        branchSecurity.requireBranchAccess(warehouse.getBranchId());
        warehouseAccessService.requireOperate(warehouse.getId());
        Product product = productRepository.findWithLockById(requested.productId())
                .orElseThrow(() -> new BusinessException("Product not found"));
        InventoryStock stock = stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(
                        warehouse.getBranchId(), warehouse.getId(), product.getId())
                .orElseGet(() -> newStock(warehouse, product));
        int delta = requested.quantityOnHand() - stock.getQuantityOnHand();
        stock.setMinQuantity(requested.minQuantity());
        stock.setMaxStockLevel(requested.maxQuantity());
        stock.setReservedQuantity(requested.reservedQuantity());
        if (delta != 0) {
            InventoryMutationRequest mutation = new InventoryMutationRequest(
                    warehouse.getId(), product.getId(), delta, InventoryMutationType.MANUAL_CORRECTION,
                    "Manual inventory stock correction", "INVENTORY_STOCK_UPSERT", UUID.randomUUID().toString(),
                    null, performedBy, LocalDate.now(), null);
            mutate(mutation, warehouse, product, stock);
            return stock;
        }
        return stockRepository.save(stock);
    }

    private InventoryStock newStock(Warehouse warehouse, Product product) {
        InventoryStock stock = new InventoryStock();
        stock.setBranchId(warehouse.getBranchId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        return stock;
    }

    private void updateAverageCost(Warehouse warehouse, Product product, int delta, BigDecimal unitCost, int stockQuantity) {
        InventoryAverageCost cost = averageCostRepository
                .findWithLockByBranchIdAndWarehouseIdAndProductId(warehouse.getBranchId(), warehouse.getId(), product.getId())
                .orElseGet(InventoryAverageCost::new);
        int oldQuantity = cost.getQuantity();
        int newCostQuantity = Math.max(0, oldQuantity + delta);
        BigDecimal average = cost.getAverageCost();
        if (delta > 0) {
            int basisQuantity = oldQuantity == 0 ? Math.max(0, stockQuantity - delta) : oldQuantity;
            BigDecimal basisValue = average.multiply(BigDecimal.valueOf(basisQuantity));
            newCostQuantity = basisQuantity + delta;
            average = newCostQuantity == 0 ? BigDecimal.ZERO
                    : basisValue.add(unitCost.multiply(BigDecimal.valueOf(delta)))
                            .divide(BigDecimal.valueOf(newCostQuantity), 2, RoundingMode.HALF_UP);
        } else if (newCostQuantity == 0) {
            average = BigDecimal.ZERO;
        }
        cost.setBranchId(warehouse.getBranchId());
        cost.setWarehouse(warehouse);
        cost.setProduct(product);
        cost.setQuantity(newCostQuantity);
        cost.setAverageCost(average);
        averageCostRepository.save(cost);
    }

    private BigDecimal resolveUnitCost(InventoryMutationRequest request, Warehouse warehouse, Product product) {
        if (request.unitCost() != null) return request.unitCost();
        return averageCostRepository.findByBranchIdAndWarehouseIdAndProductId(
                        warehouse.getBranchId(), warehouse.getId(), product.getId())
                .map(InventoryAverageCost::getAverageCost)
                .filter(value -> value.compareTo(BigDecimal.ZERO) > 0)
                .orElse(product.getImportPrice() == null ? BigDecimal.ZERO : product.getImportPrice());
    }

    private InventoryTransactionType ledgerType(InventoryMutationType type, int delta) {
        return switch (type) {
            case PURCHASE_RECEIPT -> InventoryTransactionType.PURCHASE_RECEIPT;
            case SALES_ISSUE -> InventoryTransactionType.SALE;
            case SALES_RETURN -> InventoryTransactionType.RETURN;
            case PURCHASE_RETURN -> InventoryTransactionType.PURCHASE_RETURN;
            case COUNT_ADJUSTMENT -> delta > 0
                    ? InventoryTransactionType.COUNT_ADJUSTMENT_IN : InventoryTransactionType.COUNT_ADJUSTMENT_OUT;
            case TRANSFER_OUT -> InventoryTransactionType.TRANSFER_OUT;
            case TRANSFER_IN -> InventoryTransactionType.TRANSFER_IN;
            case OPENING_BALANCE, IMPORT -> InventoryTransactionType.IMPORT;
            case WRITE_OFF -> InventoryTransactionType.WRITE_OFF;
            case MANUAL_CORRECTION -> delta > 0
                    ? InventoryTransactionType.ADJUSTMENT_IN : InventoryTransactionType.ADJUSTMENT_OUT;
            case GOODS_ISSUE -> InventoryTransactionType.GOODS_ISSUE;
            case SERVICE_USE -> InventoryTransactionType.SERVICE_USE;
            case EXPORT -> InventoryTransactionType.EXPORT;
        };
    }

    private void validate(InventoryMutationRequest request) {
        validate(request, false);
    }

    private void validate(InventoryMutationRequest request, boolean allowZeroDelta) {
        if (request == null || request.warehouseId() == null || request.productId() == null
                || (!allowZeroDelta && request.deltaQuantity() == 0) || request.transactionType() == null
                || request.reason() == null || request.reason().isBlank()
                || request.referenceType() == null || request.referenceType().isBlank()
                || request.performedBy() == null || request.performedBy().isBlank()) {
            throw new BusinessException("Inventory mutation requires warehouse, product, non-zero delta, type, reason, source and actor");
        }
        if (request.unitCost() != null && request.unitCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Inventory unit cost cannot be negative");
        }
        if (request.deltaQuantity() == Integer.MIN_VALUE) {
            throw new BusinessException("Inventory mutation quantity is out of range");
        }
    }
}
