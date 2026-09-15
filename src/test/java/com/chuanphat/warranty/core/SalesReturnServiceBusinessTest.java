package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.accounting.service.AccountingService;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.ApproveSalesReturnRequest;
import com.chuanphat.warranty.core.dto.CreateSalesReturnItemRequest;
import com.chuanphat.warranty.core.dto.CreateSalesReturnRequest;
import com.chuanphat.warranty.core.dto.RejectSalesReturnRequest;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import com.chuanphat.warranty.core.entity.SalesPayment;
import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.entity.SalesReturnItem;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.ReturnSerialDisposition;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.enums.SalesPaymentEntryType;
import com.chuanphat.warranty.core.enums.SalesReturnDisposition;
import com.chuanphat.warranty.core.enums.SalesReturnReasonCode;
import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import com.chuanphat.warranty.core.repository.InstallmentApplicationRepository;
import com.chuanphat.warranty.core.repository.InvoiceRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.QuotationRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesPaymentRepository;
import com.chuanphat.warranty.core.repository.SalesReturnItemRepository;
import com.chuanphat.warranty.core.repository.SalesReturnRepository;
import com.chuanphat.warranty.core.service.CustomerService;
import com.chuanphat.warranty.core.service.InventoryService;
import com.chuanphat.warranty.core.service.ProductService;
import com.chuanphat.warranty.core.service.SalesService;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.marketing.repository.VoucherRepository;
import com.chuanphat.warranty.notification.NotificationService;
import com.chuanphat.warranty.pricing.service.PriceCalculationService;
import com.chuanphat.warranty.reports.ExportDocumentService;
import com.chuanphat.warranty.repository.WarrantyPolicyRepository;
import com.chuanphat.warranty.repository.WarrantyRepository;
import com.chuanphat.warranty.service.WarrantyService;
import com.chuanphat.warranty.settings.SettingService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SalesReturnServiceBusinessTest {
    @Mock SalesOrderRepository salesOrderRepository;
    @Mock QuotationRepository quotationRepository;
    @Mock SalesPaymentRepository paymentRepository;
    @Mock InstallmentApplicationRepository installmentRepository;
    @Mock SalesReturnRepository returnRepository;
    @Mock SalesReturnItemRepository returnItemRepository;
    @Mock ProductSerialRepository serialRepository;
    @Mock InvoiceRepository invoiceRepository;
    @Mock VoucherRepository voucherRepository;
    @Mock ProductService productService;
    @Mock InventoryService inventoryService;
    @Mock CustomerService customerService;
    @Mock AccountingService accountingService;
    @Mock WarrantyService warrantyService;
    @Mock WarrantyPolicyRepository warrantyPolicyRepository;
    @Mock WarrantyRepository warrantyRepository;
    @Mock PriceCalculationService priceCalculationService;
    @Mock AuditLogService auditLogService;
    @Mock BranchSecurity branchSecurity;
    @Mock SettingService settingService;
    @Mock ExportDocumentService exportDocumentService;
    @Mock NotificationService notificationService;
    @Mock com.chuanphat.warranty.accounting.repository.ReceivableRepository receivableRepository;

    SalesService service;
    SalesOrder order;
    SalesOrderItem orderItem;
    Product product;
    Warehouse warehouse;

    @BeforeEach
    void setUp() {
        service = new SalesService(salesOrderRepository, quotationRepository, paymentRepository, installmentRepository,
                returnRepository, returnItemRepository, serialRepository, invoiceRepository, voucherRepository,
                productService, inventoryService, customerService, accountingService, warrantyService,
                warrantyPolicyRepository, warrantyRepository, priceCalculationService, auditLogService,
                branchSecurity, settingService, exportDocumentService, notificationService, receivableRepository);
        product = product(10L);
        warehouse = warehouse(3L);
        order = order(1L, 100L, new BigDecimal("3000000"), new BigDecimal("3000000"));
        orderItem = orderItem(11L, product, warehouse, 2, new BigDecimal("1500000"));
        order.addItem(orderItem);
    }

    @Test
    void cannotReturnQuantityExceedingOriginalSaleQuantity() {
        mockRequester("sales1");
        when(salesOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(returnItemRepository.sumQuantityByOrderItemIdAndStatuses(eq(11L), any())).thenReturn(0);

        assertThatThrownBy(() -> service.createReturn(request(3, SalesReturnReasonCode.DEFECTIVE, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("exceeds sold quantity");
    }

    @Test
    void cannotReturnQuantityExceedingRemainingAfterPreviousPartialReturns() {
        mockRequester("sales1");
        when(salesOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(returnItemRepository.sumQuantityByOrderItemIdAndStatuses(eq(11L), any())).thenReturn(1);

        assertThatThrownBy(() -> service.createReturn(request(2, SalesReturnReasonCode.DEFECTIVE, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("exceeds sold quantity");
    }

    @Test
    void cannotReturnSerialDifferentFromOriginallySoldSerialOnThatOrder() {
        ProductSerial soldSerial = serial(99L);
        orderItem.setSerial(soldSerial);
        mockRequester("sales1");
        when(salesOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.createReturn(request(1, SalesReturnReasonCode.DEFECTIVE, 100L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("serial originally sold");
    }

    @Test
    void salesStaffCannotApproveOwnReturnRequest() {
        SalesReturn salesReturn = requestedReturn("sales1", SalesReturnDisposition.REFUND_TO_INVENTORY);
        when(returnRepository.findById(55L)).thenReturn(Optional.of(salesReturn));
        mockRequester("sales1");

        assertThatThrownBy(() -> service.approveReturn(55L, new ApproveSalesReturnRequest(SalesReturnDisposition.REFUND_TO_INVENTORY, "ok")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("creator cannot approve");
    }

    @Test
    void refundToInventoryRestoresStockAndPreservesOriginalExpiryDate() {
        SalesReturn salesReturn = requestedReturn("sales1", SalesReturnDisposition.REFUND_TO_INVENTORY);
        salesReturn.getItems().get(0).setBatchId(700L);
        mockApproval(salesReturn, new BigDecimal("3000000"), new BigDecimal("3000000"));

        service.approveReturn(55L, new ApproveSalesReturnRequest(SalesReturnDisposition.REFUND_TO_INVENTORY, "sellable"));

        verify(inventoryService).processSalesReturn(1L, 3L, product, 1, salesReturn.getReturnNo());
        verify(inventoryService, never()).recordWriteOff(anyLong(), any(), any(Product.class), anyInt(), anyString());
        assertThat(salesReturn.getItems().get(0).getBatchId()).isEqualTo(700L);
    }

    @Test
    void writeOffDoesNotIncreaseInventoryStockButRecordsWriteOffLedgerEntry() {
        SalesReturn salesReturn = requestedReturn("sales1", SalesReturnDisposition.WRITE_OFF);
        mockApproval(salesReturn, BigDecimal.ZERO, new BigDecimal("3000000"));

        service.approveReturn(55L, new ApproveSalesReturnRequest(SalesReturnDisposition.WRITE_OFF, "damaged"));

        verify(inventoryService, never()).processSalesReturn(anyLong(), any(), any(Product.class), anyInt(), anyString());
        verify(inventoryService).recordWriteOff(1L, 3L, product, 1, salesReturn.getReturnNo());
    }

    @Test
    void returnOnFullyPaidOrderCreatesRefundLedgerEntry() {
        SalesReturn salesReturn = requestedReturn("sales1", SalesReturnDisposition.REFUND_TO_INVENTORY);
        mockApproval(salesReturn, new BigDecimal("3000000"), new BigDecimal("3000000"));

        service.approveReturn(55L, new ApproveSalesReturnRequest(SalesReturnDisposition.REFUND_TO_INVENTORY, "refund"));

        ArgumentCaptor<SalesPayment> paymentCaptor = ArgumentCaptor.forClass(SalesPayment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().getEntryType()).isEqualTo(SalesPaymentEntryType.REFUND);
        assertThat(paymentCaptor.getValue().getAmount()).isEqualByComparingTo("-1500000");
        verify(accountingService, never()).recordSalesReturnReversal(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void returnOnPartiallyOrUnpaidOrderReducesReceivableInsteadOfRefunding() {
        SalesReturn salesReturn = requestedReturn("sales1", SalesReturnDisposition.REFUND_TO_INVENTORY);
        mockApproval(salesReturn, new BigDecimal("1000000"), new BigDecimal("3000000"));

        service.approveReturn(55L, new ApproveSalesReturnRequest(SalesReturnDisposition.REFUND_TO_INVENTORY, "credit"));

        verify(paymentRepository, never()).save(any(SalesPayment.class));
        verify(accountingService, never()).recordSalesRefund(any(), any(), any(), any(), any(), any(), any(), any());
        verify(accountingService).recordSalesReturnReversal(eq(salesReturn.getReturnNo()), eq(salesReturn.getReturnDate()),
                eq(100L), eq("Khach hang"), eq(new BigDecimal("1500000")), eq(new BigDecimal("1000000")), any());
        assertThat(salesReturn.getStatus()).isEqualTo(SalesReturnStatus.CREDITED);
    }

    @Test
    void rejectedReturnRequestDoesNotAffectInventoryOrReceivable() {
        SalesReturn salesReturn = requestedReturn("sales1", SalesReturnDisposition.REFUND_TO_INVENTORY);
        when(returnRepository.findById(55L)).thenReturn(Optional.of(salesReturn));
        mockRequester("manager1");

        service.rejectReturn(55L, new RejectSalesReturnRequest("not eligible"));

        assertThat(salesReturn.getStatus()).isEqualTo(SalesReturnStatus.REJECTED);
        verify(inventoryService, never()).processSalesReturn(anyLong(), any(), any(Product.class), anyInt(), anyString());
        verify(inventoryService, never()).recordWriteOff(anyLong(), any(), any(Product.class), anyInt(), anyString());
        verify(accountingService, never()).recordSalesReturnReversal(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void returnReasonMustBeSelectedFromDefinedEnumNotFreeText() {
        assertThatThrownBy(() -> service.createReturn(request(1, null, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("reason code is required");
    }

    private void mockApproval(SalesReturn salesReturn, BigDecimal paidByLedger, BigDecimal orderPaidAmount) {
        order.setPaidAmount(orderPaidAmount);
        when(returnRepository.findById(55L)).thenReturn(Optional.of(salesReturn));
        when(paymentRepository.sumAmountByOrderId(1L)).thenReturn(paidByLedger);
        when(customerService.get(100L)).thenReturn(customer(100L));
        mockRequester("manager1");
    }

    private void mockRequester(String username) {
        AppUser user = withId(new AppUser(), "manager1".equals(username) ? 2L : 1L);
        user.setUsername(username);
        when(branchSecurity.currentUser()).thenReturn(user);
    }

    private CreateSalesReturnRequest request(int quantity, SalesReturnReasonCode reasonCode, Long serialId) {
        return new CreateSalesReturnRequest(1L, LocalDate.of(2026, 9, 14), BigDecimal.ZERO, PaymentMethod.CASH, null,
                reasonCode, "note", java.util.List.of(new CreateSalesReturnItemRequest(11L, null, serialId, quantity, ReturnSerialDisposition.RETURNED)));
    }

    private SalesReturn requestedReturn(String createdBy, SalesReturnDisposition disposition) {
        SalesReturn salesReturn = withId(new SalesReturn(), 55L);
        salesReturn.setReturnNo("SR-2026-0001");
        salesReturn.setOrder(order);
        salesReturn.setBranchId(order.getBranchId());
        salesReturn.setCustomerId(order.getCustomerId());
        salesReturn.setReturnDate(LocalDate.of(2026, 9, 14));
        salesReturn.setReasonCode(SalesReturnReasonCode.DEFECTIVE);
        salesReturn.setCreatedBy(createdBy);
        salesReturn.setStatus(SalesReturnStatus.REQUESTED);
        salesReturn.setDisposition(disposition);
        SalesReturnItem item = new SalesReturnItem();
        item.setOrderItem(orderItem);
        item.setProduct(product);
        item.setQuantity(1);
        item.setUnitPrice(orderItem.getUnitPrice());
        item.setLineAmount(orderItem.getUnitPrice());
        salesReturn.addItem(item);
        salesReturn.setReturnAmount(item.getLineAmount());
        return salesReturn;
    }

    private SalesOrder order(Long id, Long customerId, BigDecimal totalAmount, BigDecimal paidAmount) {
        SalesOrder order = withId(new SalesOrder(), id);
        order.setOrderNo("SO-2026-0001");
        order.setBranchId(1L);
        order.setCustomerId(customerId);
        order.setEmployeeId(1L);
        order.setStatus(SalesOrderStatus.DELIVERED);
        order.setTotalAmount(totalAmount);
        order.setPaidAmount(paidAmount);
        order.setPaymentStatus(paidAmount.compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.UNPAID : PaymentStatus.PAID);
        order.setStockIssued(true);
        return order;
    }

    private SalesOrderItem orderItem(Long id, Product product, Warehouse warehouse, int quantity, BigDecimal unitPrice) {
        SalesOrderItem item = withId(new SalesOrderItem(), id);
        item.setProduct(product);
        item.setWarehouse(warehouse);
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
        item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        return item;
    }

    private Product product(Long id) {
        Product product = withId(new Product(), id);
        product.setProductCode("SP-" + id);
        product.setProductName("San pham " + id);
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("CP");
        product.setImportPrice(new BigDecimal("1000000"));
        product.setSalePrice(new BigDecimal("1500000"));
        return product;
    }

    private ProductSerial serial(Long id) {
        ProductSerial serial = withId(new ProductSerial(), id);
        serial.setProduct(product);
        serial.setSerialNumber("SER-" + id);
        serial.setBranchId(1L);
        serial.setWarehouse(warehouse);
        return serial;
    }

    private Warehouse warehouse(Long id) {
        Warehouse warehouse = withId(new Warehouse(), id);
        warehouse.setBranchId(1L);
        warehouse.setWarehouseCode("WH-" + id);
        warehouse.setWarehouseName("Kho " + id);
        return warehouse;
    }

    private Customer customer(Long id) {
        Customer customer = withId(new Customer(), id);
        customer.setFullName("Khach hang");
        customer.setPhone("0900000000");
        return customer;
    }
}
