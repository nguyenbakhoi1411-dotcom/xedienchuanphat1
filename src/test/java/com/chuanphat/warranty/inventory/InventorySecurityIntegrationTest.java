package com.chuanphat.warranty.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.PurchaseReceiptItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.PurchaseReceiptService;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"dev", "test"})
@TestPropertySource(properties = "spring.sql.init.mode=never")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@AutoConfigureMockMvc
@WithMockUser(username = "admin", roles = {"ADMIN"})
class InventorySecurityIntegrationTest {
    @Autowired
    private PurchaseReceiptService purchaseReceiptService;

    @Autowired
    private PurchaseReceiptRepository receiptRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductSerialRepository serialRepository;

    @Autowired
    private InventoryStockRepository stockRepository;

    @Autowired
    private InventoryAverageCostRepository averageCostRepository;

    private Product testProduct;
    private Warehouse testWarehouse;
    private Supplier testSupplier;

    @BeforeEach
    void setup() {
        String suffix = java.util.UUID.randomUUID().toString().substring(0, 8);

        testSupplier = new Supplier();
        testSupplier.setCode("SUP-" + suffix);
        testSupplier.setName("Test Supplier");
        supplierRepository.save(testSupplier);

        testWarehouse = new Warehouse();
        testWarehouse.setWarehouseCode("WH-" + suffix);
        testWarehouse.setWarehouseName("Test Warehouse");
        testWarehouse.setBranchId(1L);
        warehouseRepository.save(testWarehouse);

        testProduct = new Product();
        testProduct.setProductCode("PROD-" + suffix);
        testProduct.setProductName("Test EV");
        testProduct.setCategory(ProductCategory.ELECTRIC_MOTORBIKE);
        testProduct.setImportPrice(BigDecimal.valueOf(1000));
        testProduct.setSalePrice(BigDecimal.valueOf(2000));
        testProduct.setBrand("VinFast");
        testProduct.setWarrantyMonths(12);
        productRepository.save(testProduct);
    }

    @Test
    void doubleSubmitWithSerialProductOnlyConfirmsOnce() throws InterruptedException {
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

        receipt = receiptRepository.saveAndFlush(receipt);
        Long receiptId = receipt.getId();

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger lockExceptionCount = new AtomicInteger();
        runConcurrently(() -> {
            try {
                purchaseReceiptService.confirm(receiptId);
                successCount.incrementAndGet();
            } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException e) {
                lockExceptionCount.incrementAndGet();
            }
        });

        assertEquals(1, successCount.get(), "Only one confirmation should succeed");
        assertEquals(1, lockExceptionCount.get(), "The second confirmation must fail with optimistic locking");
        InventoryStock stock = stockRepository.findByBranchIdAndProductId(1L, testProduct.getId()).orElseThrow();
        assertEquals(1, stock.getQuantityOnHand());
    }

    @Test
    void doubleSubmitWithNonSerialProductDoesNotDoubleIncreaseStock() throws InterruptedException {
        Product nonSerialProduct = new Product();
        nonSerialProduct.setProductCode("PART-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        nonSerialProduct.setProductName("Test Part");
        nonSerialProduct.setCategory(ProductCategory.SPARE_PART);
        nonSerialProduct.setImportPrice(BigDecimal.valueOf(20));
        nonSerialProduct.setSalePrice(BigDecimal.valueOf(25));
        nonSerialProduct.setBrand("Generic");
        nonSerialProduct.setWarrantyMonths(0);
        productRepository.save(nonSerialProduct);

        InventoryStock initialStock = new InventoryStock();
        initialStock.setBranchId(1L);
        initialStock.setWarehouse(testWarehouse);
        initialStock.setProduct(nonSerialProduct);
        initialStock.setQuantityOnHand(0);
        stockRepository.saveAndFlush(initialStock);

        InventoryAverageCost initialAverageCost = new InventoryAverageCost();
        initialAverageCost.setBranchId(1L);
        initialAverageCost.setWarehouse(testWarehouse);
        initialAverageCost.setProduct(nonSerialProduct);
        initialAverageCost.setQuantity(0);
        initialAverageCost.setAverageCost(BigDecimal.ZERO);
        averageCostRepository.saveAndFlush(initialAverageCost);

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

        receipt = receiptRepository.saveAndFlush(receipt);
        Long receiptId = receipt.getId();

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failureCount = new AtomicInteger();
        List<String> failures = new java.util.concurrent.CopyOnWriteArrayList<>();
        runConcurrently(() -> {
            try {
                purchaseReceiptService.confirm(receiptId);
                successCount.incrementAndGet();
            } catch (Exception e) {
                failureCount.incrementAndGet();
                failures.add(e.getClass().getSimpleName() + ": " + e.getMessage());
            }
        });

        assertEquals(1, successCount.get(), "Only one non-serial confirmation should succeed. Failures: " + failures);
        assertEquals(1, failureCount.get(), "The second non-serial confirmation must fail. Failures: " + failures);
        InventoryStock stock = stockRepository.findByBranchIdAndProductId(1L, nonSerialProduct.getId()).orElseThrow();
        assertEquals(100, stock.getQuantityOnHand(), "Stock must be increased exactly once");
    }

    @Test
    void duplicateSerialRollsBackWholeReceiptConfirmation() {
        ProductSerial existing = new ProductSerial();
        existing.setProduct(testProduct);
        existing.setSerialNumber("FRAME-DUP");
        existing.setFrameNumber("FRAME-DUP");
        existing.setBranchId(1L);
        existing.setWarehouse(testWarehouse);
        existing.setStatus(SerialStatus.IN_STOCK);
        serialRepository.saveAndFlush(existing);

        PurchaseReceipt receipt = new PurchaseReceipt();
        receipt.setReceiptNo("RC-TEST-002");
        receipt.setSupplier(testSupplier);
        receipt.setWarehouse(testWarehouse);
        receipt.setBranchId(1L);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setCreatedBy("admin");

        PurchaseReceiptItem goodItem = new PurchaseReceiptItem();
        goodItem.setProduct(testProduct);
        goodItem.setQuantity(1);
        goodItem.setUnitCost(BigDecimal.valueOf(1000));
        goodItem.setFrameNumber("FRAME-GOOD");
        goodItem.setEngineNumber("ENG-GOOD");
        receipt.addItem(goodItem);

        PurchaseReceiptItem duplicateItem = new PurchaseReceiptItem();
        duplicateItem.setProduct(testProduct);
        duplicateItem.setQuantity(1);
        duplicateItem.setUnitCost(BigDecimal.valueOf(1000));
        duplicateItem.setFrameNumber("FRAME-DUP");
        duplicateItem.setEngineNumber("ENG-DUP");
        receipt.addItem(duplicateItem);

        receipt = receiptRepository.saveAndFlush(receipt);

        try {
            purchaseReceiptService.confirm(receipt.getId());
            fail("Should throw exception for duplicate serial");
        } catch (Exception e) {
            assertTrue(e.getMessage().contains("So khung da ton tai"), "Exception should mention duplicate frame");
        }

        assertFalse(serialRepository.existsByFrameNumberIgnoreCase("FRAME-GOOD"), "FRAME-GOOD should have been rolled back");
        stockRepository.findByBranchIdAndProductId(1L, testProduct.getId())
                .ifPresent(stock -> assertEquals(0, stock.getQuantityOnHand(), "Stock should not be incremented"));
    }

    private void runConcurrently(Runnable action) throws InterruptedException {
        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);
        SecurityContext securityContext = SecurityContextHolder.getContext();

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                SecurityContextHolder.setContext(securityContext);
                try {
                    startLatch.await();
                    action.run();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    SecurityContextHolder.clearContext();
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS), "Concurrent confirmations should finish");
        executor.shutdownNow();
    }
}
