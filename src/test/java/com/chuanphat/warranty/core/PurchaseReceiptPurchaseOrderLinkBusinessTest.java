package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.common.security.BranchSecurity;
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
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.core.repository.WarehouseRepository;
import com.chuanphat.warranty.core.service.InventoryService;
import com.chuanphat.warranty.core.service.PayableService;
import com.chuanphat.warranty.core.service.PurchaseOrderService;
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
    @Mock PurchaseOrderService purchaseOrderService;
    @Mock BranchSecurity branchSecurity;

    PurchaseReceiptService service;

    @BeforeEach
    void setUp() {
        service = new PurchaseReceiptService(
                receiptRepo,
                productRepo,
                supplierRepo,
                warehouseRepo,
                purchaseOrderRepository,
                serialRepo,
                inventoryService,
                payableService,
                purchaseOrderService,
                branchSecurity);
        lenient().when(receiptRepo.findMaxReceiptSeq()).thenReturn(0);
        lenient().when(receiptRepo.save(any(PurchaseReceipt.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 300L));
        lenient().when(receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(anyLong(), anyLong(), any()))
                .thenReturn(0L);
    }

    @Test
    void purchaseReceiptCanBeCreatedForApprovedPurchaseOrderWithinRemainingQuantity() {
        Product product = product(100L);
        Supplier supplier = supplier(10L);
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, supplier, 1L, orderItem(product, 3));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));
        when(supplierRepo.findById(10L)).thenReturn(Optional.of(supplier));
        when(productRepo.findById(100L)).thenReturn(Optional.of(product));
        when(receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(eq(200L), eq(100L), any()))
                .thenReturn(1L);

        var receipt = service.create(request(200L, 10L, 1L, item(100L, 2)));

        assertThat(receipt.purchaseOrderId()).isEqualTo(200L);
        assertThat(receipt.status()).isEqualTo(ReceiptStatus.DRAFT);
        assertThat(receipt.items()).hasSize(1);
        verify(receiptRepo).save(any(PurchaseReceipt.class));
    }

    @Test
    void purchaseReceiptCanBeCreatedForPartiallyReceivedPurchaseOrderWithinRemainingQuantity() {
        Product product = product(100L);
        Supplier supplier = supplier(10L);
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.PARTIALLY_RECEIVED, supplier, 1L, orderItem(product, 3));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));
        when(supplierRepo.findById(10L)).thenReturn(Optional.of(supplier));
        when(productRepo.findById(100L)).thenReturn(Optional.of(product));
        when(receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(eq(200L), eq(100L), any()))
                .thenReturn(2L);

        var receipt = service.create(request(200L, 10L, 1L, item(100L, 1)));

        assertThat(receipt.purchaseOrderId()).isEqualTo(200L);
        assertThat(receipt.totalAmount()).isEqualByComparingTo("1000000");
        verify(receiptRepo).save(any(PurchaseReceipt.class));
    }

    @Test
    void purchaseReceiptRequiresPurchaseOrderReference() {
        PurchaseReceiptRequest request = request(null, 10L, 1L, item(100L, 1));

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("tham chieu don mua hang");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void purchaseReceiptCannotBeCreatedForUnapprovedPurchaseOrder() {
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.SUBMITTED, 10L, 1L, orderItem(100L, 2));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(request(200L, 10L, 1L, item(100L, 1))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("don mua hang da duyet");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void purchaseReceiptSupplierAndBranchMustMatchPurchaseOrder() {
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, 10L, 1L, orderItem(100L, 2));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(request(200L, 11L, 1L, item(100L, 1))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Nha cung cap phieu nhap khong khop");

        assertThatThrownBy(() -> service.create(request(200L, 10L, 2L, item(100L, 1))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Chi nhanh phieu nhap khong khop");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void purchaseReceiptCannotReceiveProductNotInPurchaseOrder() {
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, 10L, 1L, orderItem(100L, 2));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(request(200L, 10L, 1L, item(101L, 1))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("khong nam trong don mua hang");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void purchaseReceiptCannotReceiveMoreThanRemainingPurchaseOrderQuantity() {
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, 10L, 1L, orderItem(100L, 3));
        when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(order));
        when(receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(eq(200L), eq(100L), any()))
                .thenReturn(2L);

        assertThatThrownBy(() -> service.create(request(200L, 10L, 1L, item(100L, 2))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("vuot qua so luong con lai");

        verify(receiptRepo, never()).save(any());
    }

    @Test
    void confirmedReceiptMarksPurchaseOrderPartiallyReceivedWhenQuantityRemains() {
        Product product = product(100L);
        Supplier supplier = supplier(10L);
        Warehouse warehouse = warehouse(20L);
        PurchaseReceipt receipt = receipt(300L, 200L, supplier, warehouse, receiptItem(product, 2));
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, 10L, 1L, orderItem(product, 5));
        when(receiptRepo.findById(300L)).thenReturn(Optional.of(receipt));
        when(purchaseOrderService.findById(200L)).thenReturn(order);
        when(receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(eq(200L), eq(100L), any()))
                .thenReturn(2L);

        service.confirm(300L);

        verify(inventoryService).increase(eq(1L), eq(warehouse), eq(product), eq(2), eq(new BigDecimal("1000000")));
        verify(payableService).createFromReceipt(eq(10L), eq(1L), eq(300L), eq("GNK00001"), eq(new BigDecimal("2000000")), eq(30));
        verify(purchaseOrderService).markPartiallyReceived(200L);
        verify(purchaseOrderService, never()).markFullyReceived(200L);
    }

    @Test
    void confirmedReceiptMarksPurchaseOrderFullyReceivedWhenAllQuantitiesReceived() {
        Product product = product(100L);
        Supplier supplier = supplier(10L);
        Warehouse warehouse = warehouse(20L);
        PurchaseReceipt receipt = receipt(300L, 200L, supplier, warehouse, receiptItem(product, 2));
        PurchaseOrder order = purchaseOrder(PurchaseOrderStatus.APPROVED, 10L, 1L, orderItem(product, 2));
        when(receiptRepo.findById(300L)).thenReturn(Optional.of(receipt));
        when(purchaseOrderService.findById(200L)).thenReturn(order);
        when(receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(eq(200L), eq(100L), any()))
                .thenReturn(2L);

        service.confirm(300L);

        verify(inventoryService).increase(eq(1L), eq(warehouse), eq(product), eq(2), eq(new BigDecimal("1000000")));
        verify(purchaseOrderService).markFullyReceived(200L);
        verify(purchaseOrderService, never()).markPartiallyReceived(200L);
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

    private PurchaseOrder purchaseOrder(PurchaseOrderStatus status, Long supplierId, Long branchId, PurchaseOrderItem item) {
        return purchaseOrder(status, supplier(supplierId), branchId, item);
    }

    private PurchaseOrder purchaseOrder(PurchaseOrderStatus status, Supplier supplier, Long branchId, PurchaseOrderItem item) {
        PurchaseOrder order = withId(new PurchaseOrder(), 200L);
        order.setStatus(status);
        order.setSupplier(supplier);
        order.setBranchId(branchId);
        order.addItem(item);
        return order;
    }

    private PurchaseOrderItem orderItem(Long productId, int quantity) {
        return orderItem(product(productId), quantity);
    }

    private PurchaseOrderItem orderItem(Product product, int quantity) {
        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
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

    private Product product(Long id) {
        Product product = withId(new Product(), id);
        product.setProductCode("P-" + id);
        product.setProductName("San pham " + id);
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("Chuan Phat");
        product.setImportPrice(new BigDecimal("1000000"));
        product.setSalePrice(new BigDecimal("1200000"));
        product.setWarrantyMonths(12);
        return product;
    }

    private Supplier supplier(Long id) {
        Supplier supplier = withId(new Supplier(), id);
        supplier.setCode("NCC-" + id);
        supplier.setName("Nha cung cap " + id);
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
