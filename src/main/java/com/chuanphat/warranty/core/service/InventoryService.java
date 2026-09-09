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
    private final com.chuanphat.warranty.accounting.service.AccountingLedgerService ledgerService;

    public InventoryService(
            InventoryStockRepository stockRepository,
            InventoryTransactionRepository transactionRepository,
            InventoryAverageCostRepository averageCostRepository,
            WarehouseRepository warehouseRepository,
            ProductService productService,
            BranchSecurity branchSecurity,
            com.chuanphat.warranty.accounting.service.AccountingLedgerService ledgerService
    ) {
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
        this.averageCostRepository = averageCostRepository;
        this.warehouseRepository = warehouseRepository;
        this.productService = productService;
        this.branchSecurity = branchSecurity;
        this.ledgerService = ledgerService;
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
            return PageResponse.from(stockRepository.findAllNonService(PageRequest.of(page, pageSize)).map(this::stockDto));
        }
        return PageResponse.from(stockRepository.findByBranchId(scopedBranchId, PageRequest.of(page, pageSize)).map(this::stockDto));
    }

    @Transactional(readOnly = true)
    public com.chuanphat.warranty.core.dto.InventorySummaryDTO getSummary(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        java.util.List<InventoryStock> stocks;
        if (scopedBranchId == null) {
            stocks = stockRepository.findAll();
        } else {
            stocks = stockRepository.findByBranchId(scopedBranchId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        }
        
        long tongSanPham = stocks.stream()
                .filter(s -> s.getProduct().getCategory() != com.chuanphat.warranty.core.enums.ProductCategory.SERVICE)
                .map(s -> s.getProduct().getId())
                .distinct()
                .count();
                
        long soSanPhamHetHang = stocks.stream()
                .filter(s -> s.getProduct().getCategory() != com.chuanphat.warranty.core.enums.ProductCategory.SERVICE)
                .filter(s -> s.getQuantityOnHand() == 0)
                .count();
                
        long soSanPhamSapHet = stocks.stream()
                .filter(s -> s.getProduct().getCategory() != com.chuanphat.warranty.core.enums.ProductCategory.SERVICE)
                .filter(s -> s.getQuantityOnHand() > 0 && s.getQuantityOnHand() <= s.getMinQuantity())
                .count();
                
        BigDecimal tongGiaTri = stocks.stream()
                .filter(s -> s.getProduct().getCategory() != com.chuanphat.warranty.core.enums.ProductCategory.SERVICE)
                .map(s -> {
                    BigDecimal cost = s.getWarehouse() == null ? BigDecimal.ZERO : averageCost(s.getBranchId(), s.getWarehouse().getId(), s.getProduct().getId());
                    return cost.multiply(BigDecimal.valueOf(s.getQuantityOnHand()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        return new com.chuanphat.warranty.core.dto.InventorySummaryDTO(tongSanPham, tongGiaTri, soSanPhamHetHang, soSanPhamSapHet);
    }

    @Transactional(readOnly = true)
    public InventoryStockDto getInventoryDetail(Long productId, Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (scopedBranchId == null) {
            scopedBranchId = branchSecurity.currentUser().getBranchId(); // default to user's branch
        }
        InventoryStock stock = stockRepository.findByBranchIdAndProductId(scopedBranchId, productId)
                .orElseThrow(() -> new BusinessException("Inventory not found for product"));
        return stockDto(stock);
    }

    @Transactional
    public void updateThreshold(Long productId, Long branchId, int threshold) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (scopedBranchId == null) {
            scopedBranchId = branchSecurity.currentUser().getBranchId();
        }
        InventoryStock stock = stockRepository.findByBranchIdAndProductId(scopedBranchId, productId)
                .orElseThrow(() -> new BusinessException("Inventory not found for product"));
        stock.setMinQuantity(threshold);
        stockRepository.save(stock);
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryTransactionDto> getProductHistory(Long productId, Long branchId, InventoryTransactionType type, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        PageRequest pageRequest = PageRequest.of(page, pageSize, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        
        org.springframework.data.domain.Page<InventoryTransaction> transactions;
        if (scopedBranchId == null) {
            if (type != null) {
                transactions = transactionRepository.findByProductIdAndType(productId, type, pageRequest);
            } else {
                transactions = transactionRepository.findByProductId(productId, pageRequest);
            }
        } else {
            if (type != null) {
                transactions = transactionRepository.findByProductIdAndTypeAndFromBranchIdOrTypeAndToBranchId(productId, type, scopedBranchId, type, scopedBranchId, pageRequest);
            } else {
                transactions = transactionRepository.findByProductIdAndFromBranchIdOrToBranchId(productId, scopedBranchId, scopedBranchId, pageRequest);
            }
        }
        return PageResponse.from(transactions.map(InventoryTransactionDto::from));
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
    public void importStock(InventoryImportRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        BigDecimal totalValue = BigDecimal.ZERO;
        String transactionNo = "IMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        for (com.chuanphat.warranty.core.dto.InventoryImportItemRequest item : request.items()) {
            Product product = productService.get(item.productId());
            if (product.getCategory() == com.chuanphat.warranty.core.enums.ProductCategory.SERVICE) {
                throw new BusinessException("Cannot import SERVICE products");
            }
            BigDecimal unitCost = item.unitCost() != null ? item.unitCost() : product.getImportPrice();
            BigDecimal averageCost = increase(request.branchId(), warehouse, product, item.quantity(), unitCost);
            
            BigDecimal itemTotal = unitCost.multiply(BigDecimal.valueOf(item.quantity()));
            totalValue = totalValue.add(itemTotal);
            
            InventoryTransaction tx = new InventoryTransaction();
            tx.setType(InventoryTransactionType.IMPORT);
            tx.setTransactionNo(transactionNo);
            tx.setTransactionDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
            tx.setProduct(product);
            tx.setFromBranchId(null);
            tx.setToBranchId(request.branchId());
            tx.setFromWarehouseId(null);
            tx.setToWarehouseId(warehouse.getId());
            tx.setQuantity(item.quantity());
            tx.setUnitCost(averageCost);
            tx.setTotalCost(itemTotal);
            tx.setNote(request.note());
            tx.setCreatedBy("system");
            transactionRepository.save(tx);
        }
        
        // Post journal entry
        if ("ADJUSTMENT".equals(request.nguonNhap())) {
            ledgerService.postInventoryAdjustment(transactionNo, request.transactionDate() == null ? LocalDate.now() : request.transactionDate(), totalValue, true, request.lyDo() != null ? request.lyDo() : "Điều chỉnh tăng kho", "6318");
        } else if ("PURCHASE".equals(request.nguonNhap())) {
            ledgerService.postInventoryAdjustment(transactionNo, request.transactionDate() == null ? LocalDate.now() : request.transactionDate(), totalValue, true, request.note() != null ? request.note() : "Nhập mua ngoài", "331");
        } else {
            ledgerService.postInventoryAdjustment(transactionNo, request.transactionDate() == null ? LocalDate.now() : request.transactionDate(), totalValue, true, request.note() != null ? request.note() : "Nhập kho khác", "338");
        }
    }

    @Transactional
    public void exportStock(InventoryExportRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Warehouse warehouse = resolveWarehouse(request.branchId(), request.warehouseId());
        BigDecimal totalValue = BigDecimal.ZERO;
        String transactionNo = "EXP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        for (com.chuanphat.warranty.core.dto.InventoryExportItemRequest item : request.items()) {
            Product product = productService.get(item.productId());
            if (product.getCategory() == com.chuanphat.warranty.core.enums.ProductCategory.SERVICE) {
                throw new BusinessException("Cannot export SERVICE products");
            }
            BigDecimal averageCost = averageCost(request.branchId(), warehouse.getId(), item.productId());
            decrease(request.branchId(), warehouse.getId(), item.productId(), item.quantity());
            
            BigDecimal itemTotal = averageCost.multiply(BigDecimal.valueOf(item.quantity()));
            totalValue = totalValue.add(itemTotal);
            
            InventoryTransaction tx = new InventoryTransaction();
            tx.setType(InventoryTransactionType.EXPORT);
            tx.setTransactionNo(transactionNo);
            tx.setTransactionDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
            tx.setProduct(product);
            tx.setFromBranchId(request.branchId());
            tx.setToBranchId(null);
            tx.setFromWarehouseId(warehouse.getId());
            tx.setToWarehouseId(null);
            tx.setQuantity(item.quantity());
            tx.setUnitCost(averageCost);
            tx.setTotalCost(itemTotal);
            tx.setNote(request.note());
            tx.setCreatedBy("system");
            transactionRepository.save(tx);
        }
        
        // Post journal entry
        if ("ADJUSTMENT".equals(request.lyDoXuat())) {
            ledgerService.postInventoryAdjustment(transactionNo, request.transactionDate() == null ? LocalDate.now() : request.transactionDate(), totalValue, false, request.ghiChu() != null ? request.ghiChu() : "Điều chỉnh giảm kho", "6318");
        } else if ("INTERNAL_USE".equals(request.lyDoXuat())) {
            ledgerService.postInventoryAdjustment(transactionNo, request.transactionDate() == null ? LocalDate.now() : request.transactionDate(), totalValue, false, request.ghiChu() != null ? request.ghiChu() : "Xuất sử dụng nội bộ", "642");
        } else if ("DAMAGED".equals(request.lyDoXuat())) {
            ledgerService.postInventoryAdjustment(transactionNo, request.transactionDate() == null ? LocalDate.now() : request.transactionDate(), totalValue, false, request.ghiChu() != null ? request.ghiChu() : "Xuất hủy hàng hỏng", "632");
        } else {
            ledgerService.postInventoryAdjustment(transactionNo, request.transactionDate() == null ? LocalDate.now() : request.transactionDate(), totalValue, false, request.ghiChu() != null ? request.ghiChu() : "Xuất kho khác", "811");
        }
    }

    @Transactional
    public void transfer(InventoryTransferRequest request) {
        if (request.fromBranchId().equals(request.toBranchId())) {
            throw new BusinessException("fromBranchId and toBranchId must be different");
        }
        branchSecurity.requireBranchAccess(request.fromBranchId());
        branchSecurity.requireBranchAccess(request.toBranchId());
        Warehouse fromWarehouse = resolveWarehouse(request.fromBranchId(), request.fromWarehouseId());
        Warehouse toWarehouse = resolveWarehouse(request.toBranchId(), request.toWarehouseId());
        String transactionNo = "TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        for (com.chuanphat.warranty.core.dto.InventoryTransferItemRequest item : request.items()) {
            Product product = productService.get(item.productId());
            if (product.getCategory() == com.chuanphat.warranty.core.enums.ProductCategory.SERVICE) {
                throw new BusinessException("Cannot transfer SERVICE products");
            }
            BigDecimal movingCost = averageCost(request.fromBranchId(), fromWarehouse.getId(), item.productId());
            decrease(request.fromBranchId(), fromWarehouse.getId(), item.productId(), item.quantity());
            increase(request.toBranchId(), toWarehouse, product, item.quantity(), movingCost);
            
            // Transfer OUT
            InventoryTransaction txOut = new InventoryTransaction();
            txOut.setType(InventoryTransactionType.TRANSFER_OUT);
            txOut.setTransactionNo(transactionNo);
            txOut.setTransactionDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
            txOut.setProduct(product);
            txOut.setFromBranchId(request.fromBranchId());
            txOut.setToBranchId(request.toBranchId());
            txOut.setFromWarehouseId(fromWarehouse.getId());
            txOut.setToWarehouseId(toWarehouse.getId());
            txOut.setQuantity(item.quantity());
            txOut.setUnitCost(movingCost);
            txOut.setTotalCost(movingCost.multiply(BigDecimal.valueOf(item.quantity())));
            txOut.setNote(request.note());
            txOut.setCreatedBy("system");
            transactionRepository.save(txOut);

            // Transfer IN
            InventoryTransaction txIn = new InventoryTransaction();
            txIn.setType(InventoryTransactionType.TRANSFER_IN);
            txIn.setTransactionNo(transactionNo);
            txIn.setTransactionDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
            txIn.setProduct(product);
            txIn.setFromBranchId(request.fromBranchId());
            txIn.setToBranchId(request.toBranchId());
            txIn.setFromWarehouseId(fromWarehouse.getId());
            txIn.setToWarehouseId(toWarehouse.getId());
            txIn.setQuantity(item.quantity());
            txIn.setUnitCost(movingCost);
            txIn.setTotalCost(movingCost.multiply(BigDecimal.valueOf(item.quantity())));
            txIn.setNote(request.note());
            txIn.setCreatedBy("system");
            transactionRepository.save(txIn);
        }
    }

    @Transactional
    public InventoryTransactionDto stocktake(InventoryStocktakeRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Product product = productService.get(request.productId());
        if (product.getCategory() == com.chuanphat.warranty.core.enums.ProductCategory.SERVICE) {
            throw new BusinessException("Cannot stocktake SERVICE products");
        }
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

    public Warehouse getWarehouse(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Warehouse not found"));
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

    public BigDecimal getAverageCost(Long branchId, Long warehouseId, Long productId) {
        return averageCost(branchId, warehouseId, productId);
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
        transaction.setCreatedBy("system");
        return transactionRepository.save(transaction);
    }
}
