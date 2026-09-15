package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.PurchaseReceiptItem;
import com.chuanphat.warranty.core.entity.PurchaseReturn;
import com.chuanphat.warranty.core.entity.PurchaseReturnItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.entity.SupplierReceivable;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.PurchaseReturnReasonCode;
import com.chuanphat.warranty.core.enums.PurchaseReturnStatus;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.enums.SupplierCategory;
import com.chuanphat.warranty.core.enums.SupplierInvoicePaymentStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptItemRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.PurchaseReturnItemRepository;
import com.chuanphat.warranty.core.repository.PurchaseReturnRepository;
import com.chuanphat.warranty.core.repository.SupplierInvoiceRepository;
import com.chuanphat.warranty.core.repository.SupplierReceivableRepository;
import com.chuanphat.warranty.core.service.InventoryService;
import com.chuanphat.warranty.core.service.PurchasePaymentService;
import com.chuanphat.warranty.core.service.PurchaseReturnService;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PurchaseReturnServiceBusinessTest {

    @Mock PurchaseReturnRepository returnRepository;
    @Mock PurchaseReturnItemRepository returnItemRepository;
    @Mock PurchaseReceiptRepository receiptRepository;
    @Mock PurchaseReceiptItemRepository receiptItemRepository;
    @Mock SupplierInvoiceRepository invoiceRepository;
    @Mock SupplierReceivableRepository supplierReceivableRepository;
    @Mock ProductSerialRepository serialRepository;
    @Mock InventoryService inventoryService;
    @Mock PurchasePaymentService purchasePaymentService;
    @Mock BranchSecurity branchSecurity;

    PurchaseReturnService service;

    @BeforeEach
    void setUp() {
        service = new PurchaseReturnService(
                returnRepository,
                returnItemRepository,
                receiptRepository,
                receiptItemRepository,
                invoiceRepository,
                supplierReceivableRepository,
                serialRepository,
                inventoryService,
                purchasePaymentService,
                branchSecurity);
        lenient().when(returnRepository.count()).thenReturn(0L);
        lenient().when(returnRepository.save(any(PurchaseReturn.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 700L));
        lenient().when(supplierReceivableRepository.save(any(SupplierReceivable.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 900L));
        lenient().when(branchSecurity.currentUser()).thenReturn(user("purchase-manager"));
    }

    @Test
    void cannotReturnMoreThanReceivedFromSupplierForThatReceipt() {
        Fixture fixture = fixture(ProductCategory.SPARE_PART, 5, null, SupplierInvoicePaymentStatus.UNPAID);
        when(receiptRepository.findById(300L)).thenReturn(Optional.of(fixture.receipt()));
        when(receiptItemRepository.findWithReceiptById(400L)).thenReturn(Optional.of(fixture.receiptItem()));
        when(returnItemRepository.sumNonRejectedQuantityByReceiptItemId(300L, 400L)).thenReturn(4L);

        assertThatThrownBy(() -> service.create(300L, PurchaseReturnReasonCode.DEFECTIVE, "Hang loi", null,
                List.of(request(100L, 400L, 2, null))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("vuot qua so luong da nhan");

        verify(returnRepository, never()).save(any(PurchaseReturn.class));
    }

    @Test
    void cannotReturnSerialDifferentFromOriginallyReceivedSerial() {
        Fixture fixture = fixture(ProductCategory.ELECTRIC_MOTORBIKE, 1, "SER-OK", SupplierInvoicePaymentStatus.UNPAID);
        ProductSerial wrongSerial = serial(501L, fixture.product(), "SER-WRONG");
        when(receiptRepository.findById(300L)).thenReturn(Optional.of(fixture.receipt()));
        when(receiptItemRepository.findWithReceiptById(400L)).thenReturn(Optional.of(fixture.receiptItem()));
        when(serialRepository.findById(501L)).thenReturn(Optional.of(wrongSerial));

        assertThatThrownBy(() -> service.create(300L, PurchaseReturnReasonCode.DEFECTIVE, "Sai serial", null,
                List.of(request(100L, 400L, 1, 501L))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("khong phai serial da nhan");

        verify(returnRepository, never()).save(any(PurchaseReturn.class));
    }

    @Test
    void purchaseStaffCannotApproveOwnPurchaseReturnRequest() {
        PurchaseReturn ret = requestedReturn("purchase-staff", fixture(ProductCategory.SPARE_PART, 2, null, SupplierInvoicePaymentStatus.UNPAID));
        when(returnRepository.findById(700L)).thenReturn(Optional.of(ret));
        when(branchSecurity.currentUser()).thenReturn(user("purchase-staff"));

        assertThatThrownBy(() -> service.approve(700L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("khong duoc tu duyet");

        verify(returnRepository, never()).save(ret);
    }

    @Test
    void purchaseReturnReducesAccountsPayableBalanceWhenInvoiceUnpaid() {
        Fixture fixture = fixture(ProductCategory.SPARE_PART, 2, null, SupplierInvoicePaymentStatus.UNPAID);
        PurchaseReturn ret = approvedReturn(fixture);
        when(returnRepository.findById(700L)).thenReturn(Optional.of(ret));
        when(receiptItemRepository.findWithReceiptById(400L)).thenReturn(Optional.of(fixture.receiptItem()));
        when(invoiceRepository.findByReceiptId(300L)).thenReturn(Optional.of(fixture.invoice()));

        PurchaseReturn result = service.shipBack(700L);

        assertThat(result.getStatus()).isEqualTo(PurchaseReturnStatus.CREDITED);
        verify(inventoryService).recordPurchaseReturn(eq(1L), eq(20L), eq(fixture.product()), eq(2), eq("THNCC-00001"));
        verify(purchasePaymentService).applyReturnCredit(eq(fixture.invoice()), eq(new BigDecimal("200.00")), eq("THNCC-00001"));
        verify(supplierReceivableRepository, never()).save(any(SupplierReceivable.class));
    }

    @Test
    void purchaseReturnOnPaidInvoiceCreatesReceivableFromSupplierInstead() {
        Fixture fixture = fixture(ProductCategory.SPARE_PART, 2, null, SupplierInvoicePaymentStatus.PAID);
        PurchaseReturn ret = approvedReturn(fixture);
        when(returnRepository.findById(700L)).thenReturn(Optional.of(ret));
        when(receiptItemRepository.findWithReceiptById(400L)).thenReturn(Optional.of(fixture.receiptItem()));
        when(invoiceRepository.findByReceiptId(300L)).thenReturn(Optional.of(fixture.invoice()));

        PurchaseReturn result = service.shipBack(700L);

        assertThat(result.getStatus()).isEqualTo(PurchaseReturnStatus.REFUND_RECEIVED);
        assertThat(result.getSupplierReceivableId()).isEqualTo(900L);
        ArgumentCaptor<SupplierReceivable> receivableCaptor = ArgumentCaptor.forClass(SupplierReceivable.class);
        verify(supplierReceivableRepository).save(receivableCaptor.capture());
        assertThat(receivableCaptor.getValue().getAmount()).isEqualByComparingTo("200.00");
        verify(purchasePaymentService, never()).applyReturnCredit(any(), any(), any());
    }

    @Test
    void purchaseReturnExitsCorrectBatchNotDifferentBatchOfSameProduct() {
        Fixture fixture = fixture(ProductCategory.SPARE_PART, 2, null, SupplierInvoicePaymentStatus.UNPAID);
        PurchaseReceipt otherReceipt = receipt(301L, fixture.supplier(), fixture.warehouse(), fixture.receiptItem());
        PurchaseReceiptItem otherReceiptItem = receiptItem(401L, otherReceipt, fixture.product(), 2, null);
        when(receiptRepository.findById(300L)).thenReturn(Optional.of(fixture.receipt()));
        when(receiptItemRepository.findWithReceiptById(401L)).thenReturn(Optional.of(otherReceiptItem));

        assertThatThrownBy(() -> service.create(300L, PurchaseReturnReasonCode.QUALITY_ISSUE, "Sai lo", null,
                List.of(new PurchaseReturnService.ReturnItemRequest(100L, 401L, 99L, null, 1, new BigDecimal("100.00")))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("khong thuoc phieu nhap goc");

        verify(returnRepository, never()).save(any(PurchaseReturn.class));
    }

    @Test
    void rejectedPurchaseReturnDoesNotAffectInventoryOrPayable() {
        PurchaseReturn ret = requestedReturn("purchase-staff", fixture(ProductCategory.SPARE_PART, 2, null, SupplierInvoicePaymentStatus.UNPAID));
        when(returnRepository.findById(700L)).thenReturn(Optional.of(ret));

        PurchaseReturn result = service.reject(700L, "NCC khong chap nhan");

        assertThat(result.getStatus()).isEqualTo(PurchaseReturnStatus.REJECTED);
        verify(inventoryService, never()).recordPurchaseReturn(any(), any(), any(), any(Integer.class), any());
        verify(purchasePaymentService, never()).applyReturnCredit(any(), any(), any());
        verify(supplierReceivableRepository, never()).save(any(SupplierReceivable.class));
    }

    @Test
    void purchaseReturnReasonMustBeSelectedFromDefinedEnum() {
        Fixture fixture = fixture(ProductCategory.SPARE_PART, 2, null, SupplierInvoicePaymentStatus.UNPAID);

        assertThatThrownBy(() -> service.create(300L, null, "free text only", null,
                List.of(request(100L, 400L, 1, null))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("chon tu danh muc");

        verify(receiptRepository, never()).findById(300L);
    }

    private PurchaseReturnService.ReturnItemRequest request(Long productId, Long receiptItemId, int quantity, Long serialId) {
        return new PurchaseReturnService.ReturnItemRequest(productId, receiptItemId, null, serialId, quantity, new BigDecimal("100.00"));
    }

    private PurchaseReturn approvedReturn(Fixture fixture) {
        PurchaseReturn ret = requestedReturn("purchase-staff", fixture);
        ret.setStatus(PurchaseReturnStatus.APPROVED);
        ret.setApprovedBy("purchase-manager");
        return ret;
    }

    private PurchaseReturn requestedReturn(String createdBy, Fixture fixture) {
        PurchaseReturn ret = withId(new PurchaseReturn(), 700L);
        ret.setReturnCode("THNCC-00001");
        ret.setSupplierId(fixture.supplier().getId());
        ret.setBranchId(1L);
        ret.setPurchaseReceiptId(300L);
        ret.setPurchaseOrderId(200L);
        ret.setReasonCode(PurchaseReturnReasonCode.DEFECTIVE);
        ret.setStatus(PurchaseReturnStatus.REQUESTED);
        ret.setCreatedBy(createdBy);
        PurchaseReturnItem item = new PurchaseReturnItem();
        item.setProduct(fixture.product());
        item.setPurchaseReceiptItemId(400L);
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("100.00"));
        item.setLineTotal(new BigDecimal("200.00"));
        ret.addItem(item);
        ret.setTotalAmount(new BigDecimal("200.00"));
        return ret;
    }

    private Fixture fixture(ProductCategory category, int receivedQuantity, String serialNumber, SupplierInvoicePaymentStatus paymentStatus) {
        Supplier supplier = supplier(10L);
        Warehouse warehouse = warehouse(20L);
        Product product = product(100L, category);
        PurchaseReceipt receipt = receipt(300L, supplier, warehouse, null);
        PurchaseReceiptItem receiptItem = receiptItem(400L, receipt, product, receivedQuantity, serialNumber);
        receipt.getItems().clear();
        receipt.addItem(receiptItem);
        SupplierInvoice invoice = invoice(600L, supplier, receipt, paymentStatus);
        return new Fixture(supplier, warehouse, product, receipt, receiptItem, invoice);
    }

    private Supplier supplier(Long id) {
        Supplier supplier = withId(new Supplier(), id);
        supplier.setCode("NCC-" + id);
        supplier.setName("Nha cung cap " + id);
        supplier.setCategory(SupplierCategory.OTHER);
        supplier.setStatus(RecordStatus.ACTIVE);
        return supplier;
    }

    private Warehouse warehouse(Long id) {
        Warehouse warehouse = withId(new Warehouse(), id);
        warehouse.setWarehouseCode("WH-" + id);
        warehouse.setWarehouseName("Kho " + id);
        warehouse.setBranchId(1L);
        warehouse.setType(WarehouseType.MAIN);
        warehouse.setStatus(RecordStatus.ACTIVE);
        return warehouse;
    }

    private Product product(Long id, ProductCategory category) {
        Product product = withId(new Product(), id);
        product.setProductCode("P-" + id);
        product.setProductName("San pham " + id);
        product.setCategory(category);
        product.setBrand("Chuan Phat");
        product.setImportPrice(new BigDecimal("100.00"));
        product.setSalePrice(new BigDecimal("120.00"));
        product.setWarrantyMonths(12);
        return product;
    }

    private PurchaseReceipt receipt(Long id, Supplier supplier, Warehouse warehouse, PurchaseReceiptItem item) {
        PurchaseReceipt receipt = withId(new PurchaseReceipt(), id);
        receipt.setReceiptNo("GNK00001");
        receipt.setPurchaseOrderId(200L);
        receipt.setSupplier(supplier);
        receipt.setBranchId(1L);
        receipt.setWarehouse(warehouse);
        receipt.setStatus(ReceiptStatus.CONFIRMED);
        receipt.setReceiptDate(LocalDate.now());
        receipt.setCreatedBy("warehouse");
        if (item != null) {
            receipt.addItem(item);
        }
        return receipt;
    }

    private PurchaseReceiptItem receiptItem(Long id, PurchaseReceipt receipt, Product product, int quantity, String serialNumber) {
        PurchaseReceiptItem item = withId(new PurchaseReceiptItem(), id);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitCost(new BigDecimal("100.00"));
        item.setLineTotal(new BigDecimal("100.00").multiply(BigDecimal.valueOf(quantity)));
        item.setSerialNumber(serialNumber);
        item.setReceipt(receipt);
        return item;
    }

    private ProductSerial serial(Long id, Product product, String serialNumber) {
        ProductSerial serial = withId(new ProductSerial(), id);
        serial.setProduct(product);
        serial.setSerialNumber(serialNumber);
        serial.setBranchId(1L);
        serial.setStatus(SerialStatus.IN_STOCK);
        return serial;
    }

    private SupplierInvoice invoice(Long id, Supplier supplier, PurchaseReceipt receipt, SupplierInvoicePaymentStatus paymentStatus) {
        SupplierInvoice invoice = withId(new SupplierInvoice(), id);
        invoice.setInvoiceNumber("INV-" + id);
        invoice.setSupplier(supplier);
        invoice.setBranchId(1L);
        invoice.setReceiptId(receipt.getId());
        invoice.setPurchaseOrderId(receipt.getPurchaseOrderId());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setStatus(SupplierInvoiceStatus.MATCHED);
        invoice.setPaymentStatus(paymentStatus);
        invoice.setTotalAmount(new BigDecimal("200.00"));
        invoice.setPaidAmount(paymentStatus == SupplierInvoicePaymentStatus.PAID ? new BigDecimal("200.00") : BigDecimal.ZERO);
        return invoice;
    }

    private AppUser user(String username) {
        AppUser user = new AppUser();
        user.setUsername(username);
        return user;
    }

    private record Fixture(Supplier supplier,
                           Warehouse warehouse,
                           Product product,
                           PurchaseReceipt receipt,
                           PurchaseReceiptItem receiptItem,
                           SupplierInvoice invoice) {
    }
}
