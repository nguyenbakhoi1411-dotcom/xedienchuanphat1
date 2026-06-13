package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.InventoryExportRequest;
import com.chuanphat.warranty.core.dto.InventoryImportRequest;
import com.chuanphat.warranty.core.dto.InventoryStockDto;
import com.chuanphat.warranty.core.dto.InventoryStocktakeRequest;
import com.chuanphat.warranty.core.dto.InventoryTransactionDto;
import com.chuanphat.warranty.core.dto.InventoryTransferRequest;
import com.chuanphat.warranty.core.dto.WarehouseDto;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private final InventoryStockRepository stockRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final InventoryAverageCostRepository averageCostRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductService productService;
    private final BranchSecurity branchSecurity;

    public InventoryService(
            InventoryStockRepository stockRepository,
            InventoryTransactionRepository transactionRepository,
            InventoryAverageCostRepository averageCostRepository,
            WarehouseRepository warehouseRepository,
            ProductService productService,
            BranchSecurity branchSecurity
    ) {
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
        this.averageCostRepository = averageCostRepository;
        this.warehouseRepository = warehouseRepository;
        this.productService = productService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryStockDto> list(Long branchId, Long warehouseId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (warehouseId != null) {
            Warehouse warehouse = warehouseRepository.findById(warehouseId).orElseThrow(() -> new BusinessException("Warehouse not found"));
            branchSecurity.requireBranchAccess(warehouse.getBranchId());
            return PageResponse.from(stockRepository.findByWarehouse_Id(warehouseId, PageRequest.of(page, pageSize)).map(this::stockDto));
        }
        if (scopedBranchId == null) {
            return PageResponse.from(stockRepository.findAll(PageRequest.of(page, pageSize)).map(this::stockDto));
        }
        return PageResponse.from(stockRepository.findByBranchId(scopedBranchId, PageRequest.of(page, pageSize)).map(this::stockDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<WarehouseDto> warehouses(Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        PageRequest pageRequest = PageRequest.of(page, pageSize);
        if (scopedBranchId == null) {
            return PageResponse.from(warehouseRepository.findByStatusNot(RecordStatus.DELETED, pageRequest).map(WarehouseDto::from));
        }
        return PageResponse.from(warehouseRepository.findByBranchId(scopedBranchId, pageRequest).map(WarehouseDto::from));
    }

    @Transactional
    public InventoryStockDto upsert(InventoryStockDto request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Product product = productService.get(request.productId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        InventoryStock stock = stockRepository.findByBranchIdAndWarehouseIdAndProductId(request.branchId(), warehouse.getId(), request.productId()).orElseGet(InventoryStock::new);
        stock.setBranchId(request.branchId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(request.quantityOnHand());
        stock.setReservedQuantity(request.reservedQuantity());
        stock.setMinQuantity(request.minQuantity());
        stock.setMaxStockLevel(request.maxQuantity());
        return stockDto(stockRepository.save(stock));
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryTransactionDto> transactions(Long branchId, InventoryTransactionType type, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(page, pageSize);
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
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
        BigDecimal averageCost = increase(request.branchId(), warehouse, product, request.quantity(), request.unitCost());
        return InventoryTransactionDto.from(record(
                InventoryTransactionType.IMPORT,
                product,
                null,
                request.branchId(),
                null,
                warehouse.getId(),
                request.quantity(),
                averageCost,
                request.transactionDate(),
                request.note()
        ));
    }

    @Transactional
    public InventoryTransactionDto exportStock(InventoryExportRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Product product = productService.get(request.productId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        BigDecimal averageCost = averageCost(request.branchId(), warehouse.getId(), request.productId());
        decrease(request.branchId(), warehouse.getId(), request.productId(), request.quantity());
        return InventoryTransactionDto.from(record(
                InventoryTransactionType.EXPORT,
                product,
                request.branchId(),
                null,
                warehouse.getId(),
                null,
                request.quantity(),
                averageCost,
                request.transactionDate(),
                request.note()
        ));
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
        BigDecimal movingCost = averageCost(request.fromBranchId(), fromWarehouse.getId(), request.productId());
        decrease(request.fromBranchId(), fromWarehouse.getId(), request.productId(), request.quantity());
        increase(request.toBranchId(), toWarehouse, product, request.quantity(), movingCost);
        record(InventoryTransactionType.TRANSFER_OUT, product, request.fromBranchId(), request.toBranchId(), fromWarehouse.getId(), toWarehouse.getId(), request.quantity(), movingCost, request.transactionDate(), request.note());
        record(InventoryTransactionType.TRANSFER_IN, product, request.fromBranchId(), request.toBranchId(), fromWarehouse.getId(), toWarehouse.getId(), request.quantity(), movingCost, request.transactionDate(), request.note());
    }

    @Transactional
    public InventoryTransactionDto stocktake(InventoryStocktakeRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Product product = productService.get(request.productId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        InventoryStock stock = stockRepository.findByBranchIdAndWarehouseIdAndProductId(request.branchId(), warehouse.getId(), request.productId()).orElseGet(InventoryStock::new);
        int currentQuantity = stock.getQuantityOnHand();
        stock.setBranchId(request.branchId());
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(request.countedQuantity());
        stockRepository.save(stock);
        InventoryTransactionType type = request.countedQuantity() >= currentQuantity ? InventoryTransactionType.ADJUSTMENT_IN : InventoryTransactionType.ADJUSTMENT_OUT;
        return InventoryTransactionDto.from(record(type, product, null, request.branchId(), null, warehouse.getId(), Math.abs(request.countedQuantity() - currentQuantity), averageCost(request.branchId(), warehouse.getId(), request.productId()), request.transactionDate(), request.note()));
    }

    @Transactional
    public void decrease(Long branchId, Long productId, int quantity) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        decrease(branchId, warehouse.getId(), productId, quantity);
    }

    @Transactional
    public void decrease(Long branchId, Long warehouseId, Long productId, int quantity) {
        InventoryStock stock = stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(branchId, warehouseId, productId)
                .orElseThrow(() -> new BusinessException("Product is out of stock"));
        if (stock.getAvailableQuantity() < quantity) {
            throw new BusinessException("Not enough stock");
        }
        stock.setQuantityOnHand(stock.getQuantityOnHand() - quantity);
        stockRepository.save(stock);
        decreaseAverageCostQuantity(branchId, warehouseId, productId, quantity);
    }

    @Transactional
    public void recordSale(Long branchId, Product product, int quantity, String orderNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        recordSale(branchId, warehouse.getId(), product, quantity, orderNo);
    }

    @Transactional
    public void recordSale(Long branchId, Long warehouseId, Product product, int quantity, String orderNo) {
        record(InventoryTransactionType.SALE, product, branchId, null, warehouseId, null, quantity, averageCost(branchId, warehouseId, product.getId()), LocalDate.now(), "Sale order " + orderNo);
    }

    @Transactional
    public void returnStock(Long branchId, Product product, int quantity, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        increase(branchId, warehouse, product, quantity, averageCost(branchId, warehouse.getId(), product.getId()));
        record(InventoryTransactionType.RETURN, product, null, branchId, null, warehouse.getId(), quantity, averageCost(branchId, warehouse.getId(), product.getId()), LocalDate.now(), "Sales return " + returnNo);
    }

    @Transactional
    public void increaseForReturn(Long branchId, Product product, int quantity, String returnNo) {
        Warehouse warehouse = resolveWarehouse(branchId, null);
        BigDecimal averageCost = increase(branchId, warehouse, product, quantity, averageCost(branchId, warehouse.getId(), product.getId()));
        record(InventoryTransactionType.RETURN, product, null, branchId, null, warehouse.getId(), quantity, averageCost, LocalDate.now(), "Sales return " + returnNo);
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
        InventoryStock stock = stockRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(branchId, warehouse.getId(), product.getId()).orElseGet(InventoryStock::new);
        stock.setBranchId(branchId);
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(stock.getQuantityOnHand() + quantity);
        if (stock.getMinQuantity() == 0) {
            stock.setMinQuantity(1);
        }
        stockRepository.save(stock);
        return updateAverageCost(branchId, warehouse, product, quantity, unitCost);
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

    private BigDecimal updateAverageCost(Long branchId, Warehouse warehouse, Product product, int importQuantity, BigDecimal importUnitCost) {
        BigDecimal unitCost = importUnitCost == null ? product.getImportPrice() : importUnitCost;
        InventoryAverageCost cost = averageCostRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(branchId, warehouse.getId(), product.getId()).orElseGet(InventoryAverageCost::new);
        int oldQuantity = cost.getQuantity();
        BigDecimal oldValue = cost.getAverageCost().multiply(BigDecimal.valueOf(oldQuantity));
        BigDecimal importValue = unitCost.multiply(BigDecimal.valueOf(importQuantity));
        int newQuantity = oldQuantity + importQuantity;
        cost.setBranchId(branchId);
        cost.setWarehouse(warehouse);
        cost.setProduct(product);
        cost.setQuantity(newQuantity);
        cost.setAverageCost(newQuantity == 0 ? BigDecimal.ZERO : oldValue.add(importValue).divide(BigDecimal.valueOf(newQuantity), 2, RoundingMode.HALF_UP));
        averageCostRepository.save(cost);
        return cost.getAverageCost();
    }

    private void decreaseAverageCostQuantity(Long branchId, Long warehouseId, Long productId, int quantity) {
        averageCostRepository.findWithLockByBranchIdAndWarehouseIdAndProductId(branchId, warehouseId, productId).ifPresent(cost -> {
            cost.setQuantity(Math.max(0, cost.getQuantity() - quantity));
            averageCostRepository.save(cost);
        });
    }

    private BigDecimal averageCost(Long branchId, Long warehouseId, Long productId) {
        return averageCostRepository.findByBranchIdAndWarehouseIdAndProductId(branchId, warehouseId, productId)
                .map(InventoryAverageCost::getAverageCost)
                .orElse(BigDecimal.ZERO);
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
        return transactionRepository.save(transaction);
    }
}
