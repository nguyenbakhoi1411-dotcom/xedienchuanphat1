package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.config.PurchaseReceiptProperties;
import com.chuanphat.warranty.core.dto.PurchaseReceiptItemRequest;
import com.chuanphat.warranty.core.dto.PurchaseReceiptRequest;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.PurchaseReceiptItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.SupplierCategory;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.InventoryService;
import com.chuanphat.warranty.core.service.PayableService;
import com.chuanphat.warranty.core.service.PurchaseReceiptService;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class PurchaseReceiptPurchaseOrderLinkBusinessTest {

    @Mock PurchaseReceiptRepository receiptRepo;
    @Mock ProductRepository productRepo;
    @Mock SupplierRepository supplierRepo;
    @Mock WarehouseRepository warehouseRepo;
    @Mock PurchaseOrderRepository purchaseOrderRepository;
    @Mock ProductSerialRepository serialRepo;
    @Mock InventoryService inventoryService;
    @Mock PayableService payableService;
    @Mock BranchSecurity branchSecurity;

    PurchaseReceiptProperties properties;
    PurchaseReceiptService service;

    @BeforeEach
    void setUp() {
        properties = new PurchaseReceiptProperties();
        service = new PurchaseReceiptService(
                receiptRepo,
                productRepo,
                supplierRepo,
                warehouseRepo,
                purchaseOrderRepository,
                serialRepo,
                inventoryService,
                payableService,
                branchSecurity,
                properties);
        lenient().when(receiptRepo.findMaxReceiptSeq()).thenReturn(0);
        lenient().when(receiptRepo.save(any(PurchaseReceipt.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 300L));
        lenient().when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void cannotCreateGoodsReceiptWithoutApprovedPurchaseOrderWhenTypeIsFromPurchase() {
        PurchaseReceiptRequest request = request(null, 10L, 1L, item(100L, 1));

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("tham chieu don mua hang");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void cannotLinkGoodsReceiptToPurchaseOrderThatIsNotApproved() {
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.SUBMITTED, supplier(10L, SupplierCategory.OTHER), 1L,
                orderItem(product(100L, ProductCategory.SPARE_PART), 2, 0));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(request(200L, 10L, 1L, item(100L, 1))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("don mua hang da duyet");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void cannotReceiveQuantityExceedingRemainingPoQuantity() {
        Product product = product(100L, ProductCategory.SPARE_PART);
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier(10L, SupplierCategory.OTHER), 1L,
                orderItem(product, 3, 2));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(request(200L, 10L, 1L, item(100L, 2))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("vuot qua so luong con lai");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void receivingPartialQuantityKeepsOrderInPartiallyReceivedStatus() {
        Product product = product(100L, ProductCategory.SPARE_PART);
        Supplier supplier = supplier(10L, SupplierCategory.OTHER);
        Warehouse warehouse = warehouse(20L);
        PurchaseReceipt receipt = receipt(300L, 200L, supplier, warehouse, receiptItem(product, 2));
        PurchaseOrderItem orderItem = orderItem(product, 5, 0);
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier, 1L, orderItem);
        when(receiptRepo.findById(300L)).thenReturn(Optional.of(receipt));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        service.confirm(300L);

        assertThat(orderItem.getReceivedQuantity()).isEqualTo(2);
        assertThat(order.getStatus()).isEqualTo(PurchaseOrderStatus.PARTIALLY_RECEIVED);
        assertThat(order.isStockReceived()).isFalse();
        verify(inventoryService).increase(eq(1L), eq(warehouse), eq(product), eq(2), eq(new BigDecimal("1000000")));
    }

    @Test
    void receivingFullQuantityMovesOrderToFullyReceivedStatus() {
        Product product = product(100L, ProductCategory.SPARE_PART);
        Supplier supplier = supplier(10L, SupplierCategory.OTHER);
        Warehouse warehouse = warehouse(20L);
        PurchaseReceipt receipt = receipt(300L, 200L, supplier, warehouse, receiptItem(product, 2));
        PurchaseOrderItem orderItem = orderItem(product, 2, 0);
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier, 1L, orderItem);
        when(receiptRepo.findById(300L)).thenReturn(Optional.of(receipt));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        service.confirm(300L);

        assertThat(orderItem.getReceivedQuantity()).isEqualTo(2);
        assertThat(order.getStatus()).isEqualTo(PurchaseOrderStatus.FULLY_RECEIVED);
        assertThat(order.isStockReceived()).isTrue();
        verify(inventoryService).increase(eq(1L), eq(warehouse), eq(product), eq(2), eq(new BigDecimal("1000000")));
    }

    @Test
    void toleranceConfigAllowsSmallOverReceiptForFoodCategoryWithinConfiguredPercent() {
        properties.setFoodOverReceiptTolerancePercent(new BigDecimal("2"));
        Product product = product(100L, ProductCategory.SPARE_PART);
        Supplier supplier = supplier(10L, SupplierCategory.FOOD_SUPPLIER);
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier, 1L,
                orderItem(product, 100, 100));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));
        when(supplierRepo.findById(10L)).thenReturn(Optional.of(supplier));
        when(productRepo.findById(100L)).thenReturn(Optional.of(product));

        var receipt = service.create(request(200L, 10L, 1L, item(100L, 2)));

        assertThat(receipt.purchaseOrderId()).isEqualTo(200L);
        assertThat(receipt.totalAmount()).isEqualByComparingTo("2000000");
        verify(receiptRepo).save(any(PurchaseReceipt.class));
    }

    @Test
    void electricVehicleReceiptDoesNotAllowAnyToleranceOverage() {
        properties.setFoodOverReceiptTolerancePercent(new BigDecimal("100"));
        Product product = product(100L, ProductCategory.ELECTRIC_MOTORBIKE);
        Supplier supplier = supplier(10L, SupplierCategory.FOOD_SUPPLIER);
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier, 1L,
                orderItem(product, 1, 1));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(request(200L, 10L, 1L, item(100L, 1))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("vuot qua so luong con lai");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void confirmReceiptAndPurchaseOrderStatusUpdateAreAtomic() {
        Product product = product(100L, ProductCategory.SPARE_PART);
        Supplier supplier = supplier(10L, SupplierCategory.OTHER);
        Warehouse warehouse = warehouse(20L);
        PurchaseReceipt receipt = receipt(300L, 200L, supplier, warehouse, receiptItem(product, 2));
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier, 1L,
                orderItem(product, 2, 0));
        when(receiptRepo.findById(300L)).thenReturn(Optional.of(receipt));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class)))
                .thenThrow(new DataIntegrityViolationException("po update failed"));

        assertThatThrownBy(() -> service.confirm(300L))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("po update failed");

        verify(inventoryService, never()).increase(any(), any(), any(), eq(2), any());
        verify(receiptRepo, never()).save(any(PurchaseReceipt.class));
    }

    @Test
    void confirmReceiptRollbackCoversPurchaseOrderUpdateWhenInventoryFails() {
        Product product = product(100L, ProductCategory.SPARE_PART);
        Supplier supplier = supplier(10L, SupplierCategory.OTHER);
        Warehouse warehouse = warehouse(20L);
        PurchaseReceipt receipt = receipt(300L, 200L, supplier, warehouse, receiptItem(product, 2));
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier, 1L,
                orderItem(product, 2, 0));
        when(receiptRepo.findById(300L)).thenReturn(Optional.of(receipt));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));
        doThrow(new DataIntegrityViolationException("inventory update failed"))
                .when(inventoryService).increase(eq(1L), eq(warehouse), eq(product), eq(2), eq(new BigDecimal("1000000")));

        assertThatThrownBy(() -> service.confirm(300L))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("inventory update failed");

        verify(purchaseOrderRepository).save(order);
        verify(receiptRepo, never()).save(any(PurchaseReceipt.class));
        verify(payableService, never()).createFromReceipt(any(), any(), any(), any(), any(), any(Integer.class));
    }

    private PurchaseReceiptRequest request(Long purchaseOrderId, Long supplierId, Long branchId, PurchaseReceiptItemRequest item) {
        return new PurchaseReceiptRequest(
                purchaseOrderId,
                supplierId,
                branchId,
                null,
                LocalDate.now(),
                "Nhap theo PO",
                List.of(item));
    }

    private PurchaseReceiptItemRequest item(Long productId, int quantity) {
        return new PurchaseReceiptItemRequest(productId, quantity, new BigDecimal("1000000"), null, null, null, null);
    }

    private PurchaseOrder purchaseOrder(PurchaseOrderStatus status, Supplier supplier, Long branchId, PurchaseOrderItem item) {
        PurchaseOrder order = withId(new PurchaseOrder(), 200L);
        order.setStatus(status);
        order.setSupplier(supplier);
        order.setBranchId(branchId);
        order.addItem(item);
        return order;
    }

    private PurchaseOrderItem orderItem(Product product, int quantity, int receivedQuantity) {
        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setReceivedQuantity(receivedQuantity);
        item.setUnitCost(new BigDecimal("1000000"));
        item.setLineTotal(new BigDecimal("1000000").multiply(BigDecimal.valueOf(quantity)));
        return item;
    }

    private PurchaseReceipt receipt(Long id, Long purchaseOrderId, Supplier supplier, Warehouse warehouse, PurchaseReceiptItem item) {
        PurchaseReceipt receipt = withId(new PurchaseReceipt(), id);
        receipt.setReceiptNo("GNK00001");
        receipt.setPurchaseOrderId(purchaseOrderId);
        receipt.setSupplier(supplier);
        receipt.setBranchId(1L);
        receipt.setWarehouse(warehouse);
        receipt.setStatus(ReceiptStatus.DRAFT);
        receipt.setReceiptDate(LocalDate.now());
        receipt.setCreatedBy("warehouse");
        receipt.setTotalAmount(item.getLineTotal());
        receipt.addItem(item);
        return receipt;
    }

    private PurchaseReceiptItem receiptItem(Product product, int quantity) {
        PurchaseReceiptItem item = new PurchaseReceiptItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitCost(new BigDecimal("1000000"));
        item.setLineTotal(new BigDecimal("1000000").multiply(BigDecimal.valueOf(quantity)));
        return item;
    }

    private Product product(Long id, ProductCategory category) {
        Product product = withId(new Product(), id);
        product.setProductCode("P-" + id);
        product.setProductName("San pham " + id);
        product.setCategory(category);
        product.setBrand("Chuan Phat");
        product.setImportPrice(new BigDecimal("1000000"));
        product.setSalePrice(new BigDecimal("1200000"));
        product.setWarrantyMonths(12);
        return product;
    }

    private Supplier supplier(Long id, SupplierCategory category) {
        Supplier supplier = withId(new Supplier(), id);
        supplier.setCode("NCC-" + id);
        supplier.setName("Nha cung cap " + id);
        supplier.setCategory(category);
        supplier.setPaymentTermsDays(30);
        return supplier;
    }

    private Warehouse warehouse(Long id) {
        Warehouse warehouse = withId(new Warehouse(), id);
        warehouse.setWarehouseCode("WH-" + id);
        warehouse.setWarehouseName("Kho " + id);
        warehouse.setBranchId(1L);
        return warehouse;
    }
}
