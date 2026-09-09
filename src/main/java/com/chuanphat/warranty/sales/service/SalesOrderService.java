package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesOrderItemRepository;
import com.chuanphat.warranty.core.repository.SalesPaymentRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductBatchRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.InventoryReservationRepository;
import com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@Transactional
public class SalesOrderService {
    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;
    private final CustomerRepository customerRepository;
    private final SalesPaymentRepository salesPaymentRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository batchRepository;
    private final ProductSerialRepository serialRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryStockRepository stockRepository;
    private final InventoryReservationRepository reservationRepository;
    private final EmployeeWarehouseRepository employeeWarehouseRepository;

    public SalesOrderService(SalesOrderRepository salesOrderRepository, SalesOrderItemRepository salesOrderItemRepository, CustomerRepository customerRepository, SalesPaymentRepository salesPaymentRepository, ProductRepository productRepository, ProductBatchRepository batchRepository, ProductSerialRepository serialRepository, WarehouseRepository warehouseRepository, InventoryStockRepository stockRepository, InventoryReservationRepository reservationRepository, EmployeeWarehouseRepository employeeWarehouseRepository) {
        this.salesOrderRepository = salesOrderRepository;
        this.salesOrderItemRepository = salesOrderItemRepository;
        this.customerRepository = customerRepository;
        this.salesPaymentRepository = salesPaymentRepository;
        this.productRepository = productRepository;
        this.batchRepository = batchRepository;
        this.serialRepository = serialRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockRepository = stockRepository;
        this.reservationRepository = reservationRepository;
        this.employeeWarehouseRepository = employeeWarehouseRepository;
    }

    public Page<SalesOrder> listOrders(Long branchId, String keyword, String status, LocalDate from, LocalDate to, Pageable pageable) {
        return salesOrderRepository.findByBranchId(branchId, pageable);
    }

    public SalesOrder getById(Long id) {
        return salesOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    public SalesOrder createOrder(Map<String, Object> req, String createdBy, Long branchId) {
        SalesOrder order = new SalesOrder();
        order.setOrderNo("DH" + branchId + "-" + System.currentTimeMillis());
        order.setBranchId(branchId);
        order.setCustomerId(Long.valueOf(req.getOrDefault("customerId", 1L).toString()));
        order.setEmployeeId(1L);
        order.setOrderDate(LocalDate.now());
        order.setStatus(SalesOrderStatus.DRAFT);
        order.setVoucherCode("");
        
        // order no longer has warehouse, it's stored on items
        
        salesOrderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        if (req.containsKey("items")) {
            java.util.List<Map<String, Object>> items = (java.util.List<Map<String, Object>>) req.get("items");
            for (Map<String, Object> itemMap : items) {
                com.chuanphat.warranty.core.entity.SalesOrderItem item = new com.chuanphat.warranty.core.entity.SalesOrderItem();
                item.setOrder(order);
                item.setQuantity(itemMap.containsKey("quantity") ? Integer.parseInt(itemMap.get("quantity").toString()) : 1);
                
                BigDecimal unitPrice = itemMap.containsKey("unitPrice") ? new BigDecimal(itemMap.get("unitPrice").toString()) : BigDecimal.ZERO;
                item.setUnitPrice(unitPrice);
                total = total.add(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())));

                if (itemMap.containsKey("productId")) {
                    productRepository.findById(Long.valueOf(itemMap.get("productId").toString())).ifPresent(item::setProduct);
                }
                
                if (itemMap.containsKey("batchId") && itemMap.get("batchId") != null) {
                    batchRepository.findById(Long.valueOf(itemMap.get("batchId").toString())).ifPresent(item::setBatch);
                }
                
                if (itemMap.containsKey("serialId") && itemMap.get("serialId") != null) {
                    serialRepository.findById(Long.valueOf(itemMap.get("serialId").toString())).ifPresent(item::setSerial);
                }
                
                // Override warehouse at item level if specified
                if (itemMap.containsKey("warehouseId") && itemMap.get("warehouseId") != null) {
                    warehouseRepository.findById(Long.valueOf(itemMap.get("warehouseId").toString())).ifPresent(item::setWarehouse);
                }

                // VALIDATION: Check stock at resolved warehouse
                com.chuanphat.warranty.core.entity.Warehouse resolvedWarehouse = item.getWarehouse();
                if (resolvedWarehouse == null) {
                    if (req.containsKey("warehouseId")) {
                        resolvedWarehouse = warehouseRepository.findById(Long.valueOf(req.get("warehouseId").toString())).orElse(null);
                        item.setWarehouse(resolvedWarehouse);
                    }
                }
                if (resolvedWarehouse == null) {
                    throw new IllegalArgumentException("Không xác định được Kho xuất hàng cho sản phẩm " + item.getProduct().getProductName());
                }

                if (item.getProduct().getCategory() != com.chuanphat.warranty.core.enums.ProductCategory.SERVICE) {
                    // 1. Calculate Available Stock at resolved warehouse
                    java.util.Optional<com.chuanphat.warranty.core.entity.InventoryStock> stockOpt = stockRepository.findByBranchIdAndWarehouseIdAndProductId(
                        order.getBranchId(), resolvedWarehouse.getId(), item.getProduct().getId());
                    int ledgerStock = stockOpt.map(com.chuanphat.warranty.core.entity.InventoryStock::getQuantity).orElse(0);
                    int reservedStock = reservationRepository.sumReservedQuantityByWarehouseAndProduct(resolvedWarehouse.getId(), item.getProduct().getId());
                    int availableStock = ledgerStock - reservedStock;
                    
                    if (availableStock < item.getQuantity()) {
                        // 2. Fetch RBAC for current user
                        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                        String username = auth != null ? auth.getName() : "system";
                        boolean hasCrossView = auth != null && auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_CHIEF_ACCOUNTANT"));
                            
                        java.util.List<Long> allowedWarehouses = new java.util.ArrayList<>();
                        if (!hasCrossView) {
                            allowedWarehouses = employeeWarehouseRepository.findByUsername(username).stream()
                                .map(ew -> ew.getWarehouse().getId())
                                .collect(java.util.stream.Collectors.toList());
                        }

                        // 3. Find suggestions across other warehouses
                        java.util.Optional<com.chuanphat.warranty.core.entity.InventoryStock> allStockOpt = stockRepository.findByBranchIdAndProductId(order.getBranchId(), item.getProduct().getId());
                        java.util.List<com.chuanphat.warranty.core.entity.InventoryStock> allStocks = allStockOpt.map(java.util.Collections::singletonList).orElse(java.util.Collections.emptyList());
                        StringBuilder suggestion = new StringBuilder();
                        
                        // Grouping logic by warehouse
                        java.util.Map<Long, Integer> whLedger = new java.util.HashMap<>();
                        java.util.Map<Long, String> whNames = new java.util.HashMap<>();
                        for (com.chuanphat.warranty.core.entity.InventoryStock s : allStocks) {
                            if (!s.getWarehouse().getId().equals(resolvedWarehouse.getId())) {
                                whLedger.put(s.getWarehouse().getId(), whLedger.getOrDefault(s.getWarehouse().getId(), 0) + s.getQuantity());
                                whNames.put(s.getWarehouse().getId(), s.getWarehouse().getWarehouseName());
                            }
                        }
                        
                        java.util.List<java.util.Map<String, Object>> suggestionList = new java.util.ArrayList<>();
                        
                        for (java.util.Map.Entry<Long, Integer> entry : whLedger.entrySet()) {
                            Long wId = entry.getKey();
                            int wReserved = reservationRepository.sumReservedQuantityByWarehouseAndProduct(wId, item.getProduct().getId());
                            int wAvailable = entry.getValue() - wReserved;
                            
                            if (wAvailable > 0) {
                                boolean canAccess = hasCrossView || allowedWarehouses.contains(wId);
                                java.util.Map<String, Object> sugMap = new java.util.HashMap<>();
                                sugMap.put("warehouseId", wId);
                                sugMap.put("warehouseName", whNames.get(wId));
                                sugMap.put("availableStock", wAvailable);
                                sugMap.put("isWithinScope", canAccess);
                                suggestionList.add(sugMap);
                                
                                suggestion.append(String.format("Kho %s hiện có %d đơn vị %s; ", 
                                    whNames.get(wId), 
                                    wAvailable, 
                                    canAccess ? "" : "(Ngoài phạm vi, vui lòng yêu cầu chuyển kho)"));
                            }
                        }
                        
                        String errorMsg = String.format("Kho [%s] không đủ tồn kho KHẢ DỤNG cho sản phẩm %s (yêu cầu: %d, thực tế có thể dùng: %d). %s Vui lòng chọn lại kho xuất hoặc tách dòng.",
                                resolvedWarehouse.getWarehouseName(), item.getProduct().getProductName(), item.getQuantity(), availableStock,
                                suggestion.length() > 0 ? "Gợi ý: " + suggestion.toString() : "Hiện không có kho nào khác còn hàng.");
                        
                        throw new com.chuanphat.warranty.core.exception.InsufficientStockException(errorMsg, item.getProduct().getProductName(), item.getQuantity(), availableStock, suggestionList);
                    }
                }

                salesOrderItemRepository.save(item);
                order.getItems().add(item);
            }
        }
        
        order.setSubtotal(total);
        order.setTotalAmount(total);
        return salesOrderRepository.save(order);
    }

    public SalesOrder confirmOrder(Long id, String confirmedBy) {
        SalesOrder order = getById(id);
        order.setStatus(SalesOrderStatus.CONFIRMED);
        return salesOrderRepository.save(order);
    }

    public SalesOrder cancelOrder(Long id, String reason) {
        SalesOrder order = getById(id);
        order.setStatus(SalesOrderStatus.CANCELLED);
        order.setNote(reason);
        
        // Release reservation immediately
        java.util.List<com.chuanphat.warranty.core.entity.InventoryReservation> reservations = reservationRepository.findBySalesOrderNoAndStatus(
            order.getOrderNo(), com.chuanphat.warranty.core.enums.InventoryReservationStatus.ACTIVE);
            
        for (com.chuanphat.warranty.core.entity.InventoryReservation r : reservations) {
            r.setStatus(com.chuanphat.warranty.core.enums.InventoryReservationStatus.CANCELLED);
            r.setReservationNo(r.getReservationNo() + "_cancelled"); // Optional to avoid unique constraint if we reuse
            reservationRepository.save(r);
        }
        
        return salesOrderRepository.save(order);
    }
}

