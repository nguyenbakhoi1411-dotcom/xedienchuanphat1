package com.chuanphat.warranty.inventory;

import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.core.service.PurchaseReceiptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"dev", "test"})
@TestPropertySource(properties = "spring.sql.init.mode=never")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@AutoConfigureMockMvc
@WithMockUser(username = "admin", roles = {"ADMIN"})
public class InventorySecurityIntegrationTest {

    @Autowired
    private PurchaseReceiptService purchaseReceiptService;

    @Autowired
    private PurchaseReceiptRepository receiptRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private WarehouseRepository warehouseRepo;

    @Autowired
    private SupplierRepository supplierRepo;

    @Autowired
    private ProductSerialRepository serialRepo;

    @Autowired
    private InventoryStockRepository stockRepo;

    @Autowired
    private InventoryAverageCostRepository averageCostRepo;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Product testProduct;
    private Warehouse testWarehouse;
    private Supplier testSupplier;

    @BeforeEach
    public void setup() {
        restartIdentityAfterSeed("purchase_receipts");
        restartIdentityAfterSeed("purchase_receipt_items");
        String rand = java.util.UUID.randomUUID().toString().substring(0, 8);
        
        testSupplier = new Supplier();
        testSupplier.setCode("SUP-" + rand);
        testSupplier.setName("Test Supplier");
        supplierRepo.save(testSupplier);

        testWarehouse = new Warehouse();
        testWarehouse.setWarehouseCode("WH-" + rand);
        testWarehouse.setWarehouseName("Test Warehouse");
        testWarehouse.setBranchId(1L);
        warehouseRepo.save(testWarehouse);

        testProduct = new Product();
        testProduct.setProductCode("PROD-" + rand);
        testProduct.setProductName("Test EV");
        testProduct.setCategory(ProductCategory.ELECTRIC_MOTORBIKE);
        testProduct.setImportPrice(BigDecimal.valueOf(1000));
        testProduct.setSalePrice(BigDecimal.valueOf(2000));
        testProduct.setBrand("VinFast");
        testProduct.setWarrantyMonths(12);
        productRepo.save(testProduct);
    }

    private void restartIdentityAfterSeed(String tableName) {
        Long nextId = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(id), 0) + 1000 FROM " + tableName, Long.class);
        jdbcTemplate.execute("ALTER TABLE " + tableName + " ALTER COLUMN id RESTART WITH " + nextId);
    }

    @Test
    public void testDoubleSubmit_OptimisticLocking() throws InterruptedException {
        // Create a DRAFT receipt
        PurchaseReceipt receipt = new PurchaseReceipt();
        receipt.setReceiptNo("RC-TEST-001");
        receipt.setSupplier(testSupplier);
        receipt.setWarehouse(testWarehouse);
        receipt.setBranchId(1L);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setCreatedBy("admin");
        
        PurchaseReceiptItem item = new PurchaseReceiptItem();
        item.setProduct(testProduct);
        item.setQuantity(1);
        item.setUnitCost(BigDecimal.valueOf(1000));
        item.setFrameNumber("FRAME-001");
        item.setEngineNumber("ENG-001");
        receipt.addItem(item);
        
        receipt = receiptRepo.saveAndFlush(receipt);
        final Long receiptId = receipt.getId();

        // Simulate 2 threads clicking confirm at the same time
        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger lockExceptionCount = new AtomicInteger(0);
        
        final SecurityContext secContext = SecurityContextHolder.getContext();

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                SecurityContextHolder.setContext(secContext);
                try {
                    latch.await(); // wait for both threads to start simultaneously
                    purchaseReceiptService.confirm(receiptId);
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException e) {
                    lockExceptionCount.incrementAndGet();
                    System.out.println("CAUGHT EXPECTED CONCURRENCY EXCEPTION: " + e.getClass().getSimpleName());
                } catch (Exception e) {
                    System.out.println("Other exception: " + e.getMessage());
                } finally {
                    SecurityContextHolder.clearContext();
                    doneLatch.countDown();
                }
            });
        }
        
        latch.countDown(); // start threads
        doneLatch.await(); // wait for finish

        assertEquals(1, successCount.get(), "Only one confirmation should succeed");
        assertEquals(1, lockExceptionCount.get(), "The second confirmation must fail with Optimistic Locking");
        
        // Check stock is only incremented once
        var stock = stockRepo.findByBranchIdAndProductId(1L, testProduct.getId()).orElseThrow();
        assertEquals(1, stock.getQuantityOnHand());
    }

    @Test
    public void testDoubleSubmit_NonSerialProduct_ShouldNotDoubleIncreaseStock() throws InterruptedException {
        Product nonSerialProduct = new Product();
        nonSerialProduct.setProductCode("RICE-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        nonSerialProduct.setProductName("Test Rice");
        nonSerialProduct.setCategory(ProductCategory.SPARE_PART);
        nonSerialProduct.setImportPrice(BigDecimal.valueOf(20));
        nonSerialProduct.setSalePrice(BigDecimal.valueOf(25));
        nonSerialProduct.setBrand("Generic");
        nonSerialProduct.setWarrantyMonths(0);
        productRepo.save(nonSerialProduct);

        InventoryStock initialStock = new InventoryStock();
        initialStock.setBranchId(1L);
        initialStock.setWarehouse(testWarehouse);
        initialStock.setProduct(nonSerialProduct);
        initialStock.setQuantityOnHand(0);
        stockRepo.saveAndFlush(initialStock);

        InventoryAverageCost initialAverageCost = new InventoryAverageCost();
        initialAverageCost.setBranchId(1L);
        initialAverageCost.setWarehouse(testWarehouse);
        initialAverageCost.setProduct(nonSerialProduct);
        initialAverageCost.setQuantity(0);
        initialAverageCost.setAverageCost(BigDecimal.ZERO);
        averageCostRepo.saveAndFlush(initialAverageCost);

        PurchaseReceipt receipt = new PurchaseReceipt();
        receipt.setReceiptNo("RC-NONSERIAL-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        receipt.setSupplier(testSupplier);
        receipt.setWarehouse(testWarehouse);
        receipt.setBranchId(1L);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setCreatedBy("admin");

        PurchaseReceiptItem item = new PurchaseReceiptItem();
        item.setProduct(nonSerialProduct);
        item.setQuantity(100);
        item.setUnitCost(BigDecimal.valueOf(20));
        receipt.addItem(item);

        receipt = receiptRepo.saveAndFlush(receipt);
        final Long receiptId = receipt.getId();

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<String> failures = new java.util.concurrent.CopyOnWriteArrayList<>();

        final SecurityContext secContext = SecurityContextHolder.getContext();

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                SecurityContextHolder.setContext(secContext);
                try {
                    latch.await();
                    purchaseReceiptService.confirm(receiptId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                    failures.add(e.getClass().getSimpleName() + ": " + e.getMessage());
                    System.out.println("CAUGHT NON-SERIAL CONCURRENCY EXCEPTION: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                } finally {
                    SecurityContextHolder.clearContext();
                    doneLatch.countDown();
                }
            });
        }

        latch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS), "Concurrent confirmations should finish");
        executor.shutdownNow();

        assertEquals(1, successCount.get(), "Only one non-serial confirmation should succeed. Failures: " + failures);
        assertEquals(1, failureCount.get(), "The second non-serial confirmation must fail. Failures: " + failures);

        var stock = stockRepo.findByBranchIdAndProductId(1L, nonSerialProduct.getId()).orElseThrow();
        assertEquals(100, stock.getQuantityOnHand(), "Stock must be increased exactly once");
    }

    @Test
    public void testDuplicateSerialRollback() {
        // 1. Setup existing serial
        ProductSerial existing = new ProductSerial();
        existing.setProduct(testProduct);
        existing.setSerialNumber("FRAME-DUP");
        existing.setFrameNumber("FRAME-DUP");
        existing.setBranchId(1L);
        existing.setWarehouse(testWarehouse);
        existing.setStatus(com.chuanphat.warranty.core.enums.SerialStatus.IN_STOCK);
        serialRepo.saveAndFlush(existing);

        // 2. Create a receipt that tries to import the same serial
        PurchaseReceipt receipt = new PurchaseReceipt();
        receipt.setReceiptNo("RC-TEST-002");
        receipt.setSupplier(testSupplier);
        receipt.setWarehouse(testWarehouse);
        receipt.setBranchId(1L);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setCreatedBy("admin");

        // Good item
        PurchaseReceiptItem item1 = new PurchaseReceiptItem();
        item1.setProduct(testProduct);
        item1.setQuantity(1);
        item1.setUnitCost(BigDecimal.valueOf(1000));
        item1.setFrameNumber("FRAME-GOOD");
        item1.setEngineNumber("ENG-GOOD");
        receipt.addItem(item1);

        // Bad item (duplicate)
        PurchaseReceiptItem item2 = new PurchaseReceiptItem();
        item2.setProduct(testProduct);
        item2.setQuantity(1);
        item2.setUnitCost(BigDecimal.valueOf(1000));
        item2.setFrameNumber("FRAME-DUP");
        item2.setEngineNumber("ENG-DUP");
        receipt.addItem(item2);

        receipt = receiptRepo.saveAndFlush(receipt);

        // 3. Confirm and expect failure
        try {
            purchaseReceiptService.confirm(receipt.getId());
            fail("Should throw exception for duplicate serial");
        } catch (Exception e) {
            assertTrue(e.getMessage().contains("So khung da ton tai"), "Exception should mention duplicate frame");
        }

        // 4. Verify Rollback
        // The good item's serial should NOT exist because the transaction rolled back!
        assertFalse(serialRepo.existsByFrameNumberIgnoreCase("FRAME-GOOD"), "FRAME-GOOD should have been rolled back!");
        
        // Stock should not be incremented
        var stockOpt = stockRepo.findByBranchIdAndProductId(1L, testProduct.getId());
        if (stockOpt.isPresent()) {
            assertEquals(0, stockOpt.get().getQuantityOnHand(), "Stock should not be incremented");
        }
    }
}
