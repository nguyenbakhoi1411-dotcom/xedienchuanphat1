package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.*;
import com.chuanphat.warranty.core.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SalesReturnService {
    private final SalesReturnRepository salesReturnRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final InventoryStockRepository stockRepo;
    private final InventoryTransactionRepository transactionRepo;
    private final ProductSerialRepository serialRepo;
    private final CustomerDebtLedgerRepository debtRepo;
    private final WarehouseRepository warehouseRepo;
    private final CustomerRepository customerRepo;

    public SalesReturnService(
            SalesReturnRepository salesReturnRepository, 
            SalesOrderRepository salesOrderRepository,
            InventoryStockRepository stockRepo,
            InventoryTransactionRepository transactionRepo,
            ProductSerialRepository serialRepo,
            CustomerDebtLedgerRepository debtRepo,
            WarehouseRepository warehouseRepo,
            CustomerRepository customerRepo) {
        this.salesReturnRepository = salesReturnRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.stockRepo = stockRepo;
        this.transactionRepo = transactionRepo;
        this.serialRepo = serialRepo;
        this.debtRepo = debtRepo;
        this.warehouseRepo = warehouseRepo;
        this.customerRepo = customerRepo;
    }

    public Page<SalesReturn> listReturns(Long branchId, Pageable pageable) {
        return salesReturnRepository.findByBranchId(branchId, pageable);
    }

    public SalesReturn getById(Long id) {
        return salesReturnRepository.findById(id).orElseThrow(() -> new RuntimeException("Return not found: " + id));
    }

    public SalesReturn createReturn(Map<String, Object> payload, String user) {
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        SalesReturn ret = new SalesReturn();
        ret.setReturnNo("RET" + System.currentTimeMillis());
        ret.setOrder(order);
        ret.setBranchId(order.getBranchId());
        ret.setCustomerId(order.getCustomerId());
        ret.setReturnDate(LocalDate.now());
        
        // Handle returnType (INVENTORY or WRITEOFF)
        String returnAction = payload.containsKey("returnAction") ? payload.get("returnAction").toString() : "INVENTORY";
        
        BigDecimal refundTotal = BigDecimal.ZERO;

        if (payload.containsKey("items")) {
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            for (Map<String, Object> it : itemsList) {
                Long orderItemId = Long.valueOf(it.get("orderItemId").toString());
                int qty = Integer.parseInt(it.get("quantity").toString());
                
                SalesOrderItem orderItem = order.getItems().stream()
                        .filter(i -> i.getId().equals(orderItemId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("OrderItem not found"));
                
                SalesReturnItem retItem = new SalesReturnItem();
                retItem.setSalesReturn(ret);
                retItem.setProduct(orderItem.getProduct());
                retItem.setQuantity(qty);
                retItem.setRefundPrice(orderItem.getUnitPrice());
                retItem.setTotalRefund(retItem.getRefundPrice().multiply(BigDecimal.valueOf(qty)));
                retItem.setReason(it.containsKey("reason") ? it.get("reason").toString() : "Customer Return");
                
                ret.getItems().add(retItem);
                refundTotal = refundTotal.add(retItem.getTotalRefund());

                if ("INVENTORY".equalsIgnoreCase(returnAction)) {
                    // Nhập lại kho
                    Warehouse defaultWarehouse = warehouseRepo.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("No warehouse found"));
                    
                    if (orderItem.getSerial() != null) {
                        ProductSerial serial = orderItem.getSerial();
                        serial.setStatus(SerialStatus.IN_STOCK);
                        serial.setWarehouse(defaultWarehouse);
                        serialRepo.save(serial);
                        
                        createReturnTx(ret, orderItem.getProduct(), null, serial, qty, orderItem.getUnitPrice(), defaultWarehouse, user);
                    } else {
                        // Tăng tồn kho (Sử dụng batch nếu có, hoặc tạo tồn kho mới)
                        InventoryStock stock = stockRepo.findWithLockByBranchIdAndWarehouseIdAndProductIdAndBatchId(
                                ret.getBranchId(), defaultWarehouse.getId(), orderItem.getProduct().getId(), 
                                orderItem.getBatch() != null ? orderItem.getBatch().getId() : null
                        ).orElseGet(() -> {
                            InventoryStock newStock = new InventoryStock();
                            newStock.setBranchId(ret.getBranchId());
                            newStock.setWarehouse(defaultWarehouse);
                            newStock.setProduct(orderItem.getProduct());
                            newStock.setBatch(orderItem.getBatch());
                            newStock.setQuantity(0);
                            newStock.setMinStockLevel(1);
                            newStock.setMaxStockLevel(100);
                            return newStock;
                        });
                        
                        stock.setQuantity(stock.getQuantity() + qty);
                        stockRepo.save(stock);
                        
                        createReturnTx(ret, orderItem.getProduct(), orderItem.getBatch(), null, qty, orderItem.getUnitPrice(), defaultWarehouse, user);
                    }
                }
            }
        }
        
        ret.setReturnAmount(refundTotal);
        ret.setRefundAmount(refundTotal);
        
        // Ghi giảm công nợ
        Customer customer = customerRepo.findById(order.getCustomerId())
            .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        CustomerDebtLedger ledger = new CustomerDebtLedger();
        ledger.setCustomer(customer);
        ledger.setTransactionDate(java.time.OffsetDateTime.of(ret.getReturnDate().atStartOfDay(), java.time.ZoneOffset.UTC));
        ledger.setTransactionType("PAYMENT"); // Assuming PAYMENT decreases debt
        ledger.setReferenceNo(ret.getReturnNo());
        // A return reduces debt, so it is a credit to the customer. Debt decreases.
        ledger.setDecreaseAmount(refundTotal); 
        // Need to set balance, though it might require getting current debt first
        if (customer.getTotalDebt() != null) {
            ledger.setBalance(customer.getTotalDebt().subtract(refundTotal));
            customer.setTotalDebt(ledger.getBalance()); // Update customer's debt
            customerRepo.save(customer);
        } else {
            ledger.setBalance(BigDecimal.ZERO);
        }
        ledger.setDescription("Nhận hàng trả lại - Giảm trừ công nợ");
        debtRepo.save(ledger);

        return salesReturnRepository.save(ret);
    }
    
    private void createReturnTx(SalesReturn ret, Product p, ProductBatch b, ProductSerial s, int qty, BigDecimal cost, Warehouse w, String user) {
        InventoryTransaction tr = new InventoryTransaction();
        tr.setType(InventoryTransactionType.RETURN);
        tr.setTransactionNo(ret.getReturnNo());
        tr.setTransactionDate(ret.getReturnDate());
        tr.setProduct(p);
        tr.setBatch(b);
        tr.setSerial(s);
        tr.setFromBranchId(ret.getBranchId());
        tr.setToWarehouseId(w.getId());
        tr.setQuantity(qty);
        tr.setUnitCost(cost);
        tr.setTotalCost(cost.multiply(BigDecimal.valueOf(qty)));
        tr.setCreatedBy(user);
        transactionRepo.save(tr);
    }
}

