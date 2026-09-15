package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.core.dto.CreateSalesExchangeRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderItemRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderRequest;
import com.chuanphat.warranty.core.dto.CreateSalesReturnItemRequest;
import com.chuanphat.warranty.core.dto.CreateSalesReturnRequest;
import com.chuanphat.warranty.core.dto.PaymentEntryRequest;
import com.chuanphat.warranty.core.dto.SalesOrderResponse;
import com.chuanphat.warranty.core.dto.SalesReturnResponse;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.enums.SalesReturnReasonCode;
import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesReturnRepository;
import com.chuanphat.warranty.core.service.SalesExchangeService;
import com.chuanphat.warranty.core.service.SalesService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SalesExchangeServiceBusinessTest {

    @Mock SalesService salesService;
    @Mock SalesReturnRepository returnRepository;
    @Mock SalesOrderRepository orderRepository;

    SalesExchangeService service;

    @BeforeEach
    void setUp() {
        service = new SalesExchangeService(salesService, returnRepository, orderRepository);
        lenient().when(returnRepository.save(any(SalesReturn.class))).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(orderRepository.save(any(SalesOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void exchangeLinksReturnAndNewOrderViaSharedExchangeGroupId() {
        Fixture fixture = fixture("100.00", "100.00", SalesOrderStatus.CONFIRMED);

        var result = service.createExchange(request(null));

        assertThat(result.exchangeGroupId()).isNotNull();
        assertThat(fixture.salesReturn().getExchangeGroupId()).isEqualTo(result.exchangeGroupId());
        assertThat(fixture.newOrder().getExchangeGroupId()).isEqualTo(result.exchangeGroupId());
    }

    @Test
    void exchangeWithHigherValueNewItemCreatesAdditionalPaymentOrReceivable() {
        fixture("100.00", "150.00", SalesOrderStatus.CONFIRMED);

        var result = service.createExchange(request(payment("999.00")));

        assertThat(result.valueDifference()).isEqualByComparingTo("50.00");
        ArgumentCaptor<PaymentEntryRequest> paymentCaptor = ArgumentCaptor.forClass(PaymentEntryRequest.class);
        verify(salesService).addPayment(eq(2L), paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().amount()).isEqualByComparingTo("50.00");
    }

    @Test
    void exchangeWithLowerValueNewItemTriggersRefundOrCreditUsingExistingReturnFlow() {
        Fixture fixture = fixture("100.00", "70.00", SalesOrderStatus.CONFIRMED);

        var result = service.createExchange(request(null));

        assertThat(result.valueDifference()).isEqualByComparingTo("-30.00");
        assertThat(fixture.salesReturn().getRefundAmount()).isEqualByComparingTo("30.00");
        verify(salesService, never()).addPayment(any(), any());
    }

    @Test
    void exchangeWithEqualValueItemsCreatesNoAdditionalFinancialTransaction() {
        Fixture fixture = fixture("100.00", "100.00", SalesOrderStatus.CONFIRMED);

        var result = service.createExchange(request(null));

        assertThat(result.valueDifference()).isEqualByComparingTo("0.00");
        assertThat(fixture.salesReturn().getRefundAmount()).isEqualByComparingTo("0.00");
        verify(salesService, never()).addPayment(any(), any());
    }

    @Test
    void exchangeNewOrderStillGoesThroughCreditLimitApprovalIfThresholdExceeded() {
        fixture("100.00", "1000.00", SalesOrderStatus.WAITING_CREDIT_APPROVAL);

        var result = service.createExchange(request(null));

        assertThat(result.newOrder().status()).isEqualTo(SalesOrderStatus.WAITING_CREDIT_APPROVAL);
        verify(salesService).create(any(CreateSalesOrderRequest.class));
    }

    @Test
    void exchangeReturnPortionStillRequiresMakerCheckerApproval() {
        fixture("100.00", "100.00", SalesOrderStatus.CONFIRMED);

        var result = service.createExchange(request(null));

        assertThat(result.salesReturn().status()).isEqualTo(SalesReturnStatus.REQUESTED);
        verify(salesService, never()).approveReturn(any(), any());
    }

    @Test
    void queryByExchangeGroupIdReturnsBothOriginalReturnAndNewOrder() {
        SalesReturn salesReturn = salesReturn("100.00");
        SalesOrder newOrder = salesOrder("100.00", SalesOrderStatus.CONFIRMED);
        UUID groupId = UUID.randomUUID();
        salesReturn.setExchangeGroupId(groupId);
        newOrder.setExchangeGroupId(groupId);
        when(returnRepository.findByExchangeGroupId(groupId)).thenReturn(List.of(salesReturn));
        when(orderRepository.findByExchangeGroupId(groupId)).thenReturn(List.of(newOrder));

        var history = service.history(groupId);

        assertThat(history.returns()).hasSize(1);
        assertThat(history.orders()).hasSize(1);
        assertThat(history.returns().get(0).exchangeGroupId()).isEqualTo(groupId);
        assertThat(history.orders().get(0).exchangeGroupId()).isEqualTo(groupId);
    }

    @Test
    void exchangeDoesNotDuplicateInventoryOrPaymentLogicAlreadyInReturnAndSalesFlow() {
        fixture("100.00", "150.00", SalesOrderStatus.CONFIRMED);

        service.createExchange(request(payment("50.00")));

        verify(salesService).createReturn(any(CreateSalesReturnRequest.class));
        verify(salesService).create(any(CreateSalesOrderRequest.class));
        verify(salesService).addPayment(eq(2L), any(PaymentEntryRequest.class));
    }

    private Fixture fixture(String returnAmount, String newOrderAmount, SalesOrderStatus newOrderStatus) {
        SalesReturn salesReturn = salesReturn(returnAmount);
        SalesOrder newOrder = salesOrder(newOrderAmount, newOrderStatus);
        when(salesService.createReturn(any(CreateSalesReturnRequest.class))).thenReturn(SalesReturnResponse.from(salesReturn));
        when(salesService.create(any(CreateSalesOrderRequest.class))).thenReturn(SalesOrderResponse.from(newOrder));
        when(returnRepository.findById(1L)).thenReturn(Optional.of(salesReturn));
        when(orderRepository.findById(2L)).thenReturn(Optional.of(newOrder));
        return new Fixture(salesReturn, newOrder);
    }

    private CreateSalesExchangeRequest request(PaymentEntryRequest additionalPayment) {
        CreateSalesReturnRequest returnRequest = new CreateSalesReturnRequest(
                1L,
                LocalDate.now(),
                BigDecimal.ZERO,
                PaymentMethod.CASH,
                null,
                SalesReturnReasonCode.WRONG_ITEM,
                "Doi hang",
                List.of(new CreateSalesReturnItemRequest(11L, null, null, 1, null)));
        CreateSalesOrderRequest newOrderRequest = new CreateSalesOrderRequest(
                1L,
                10L,
                20L,
                LocalDate.now(),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                PaymentMethod.CASH,
                null,
                null,
                "Don doi hang",
                true,
                null,
                false,
                List.of(),
                List.of(new CreateSalesOrderItemRequest(100L, null, 1, new BigDecimal("100.00"))));
        return new CreateSalesExchangeRequest(1L, returnRequest, newOrderRequest, additionalPayment);
    }

    private PaymentEntryRequest payment(String amount) {
        return new PaymentEntryRequest(PaymentMethod.CASH, new BigDecimal(amount), null, LocalDate.now(), "EX-PAY", "Bu chenhlech doi hang");
    }

    private SalesReturn salesReturn(String returnAmount) {
        SalesOrder originalOrder = salesOrder("100.00", SalesOrderStatus.DELIVERED);
        SalesReturn salesReturn = withId(new SalesReturn(), 1L);
        salesReturn.setReturnNo("SR00001");
        salesReturn.setOrder(originalOrder);
        salesReturn.setBranchId(1L);
        salesReturn.setCustomerId(10L);
        salesReturn.setReturnDate(LocalDate.now());
        salesReturn.setReturnAmount(new BigDecimal(returnAmount));
        salesReturn.setRefundAmount(BigDecimal.ZERO);
        salesReturn.setReasonCode(SalesReturnReasonCode.WRONG_ITEM);
        salesReturn.setReasonNote("Doi hang");
        salesReturn.setStatus(SalesReturnStatus.REQUESTED);
        salesReturn.setCreatedBy("sales1");
        return salesReturn;
    }

    private SalesOrder salesOrder(String amount, SalesOrderStatus status) {
        SalesOrder order = withId(new SalesOrder(), status == SalesOrderStatus.DELIVERED ? 1L : 2L);
        order.setOrderNo(status == SalesOrderStatus.DELIVERED ? "SO-OLD" : "SO-NEW");
        order.setBranchId(1L);
        order.setCustomerId(10L);
        order.setEmployeeId(20L);
        order.setOrderDate(LocalDate.now());
        order.setStatus(status);
        order.setSubtotal(new BigDecimal(amount));
        order.setTotalAmount(new BigDecimal(amount));
        order.setPaidAmount(BigDecimal.ZERO);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setVoucherCode("");
        return order;
    }

    @SuppressWarnings("unused")
    private Product product(Long id) {
        Product product = withId(new Product(), id);
        product.setProductCode("P-" + id);
        product.setProductName("San pham " + id);
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("Chuan Phat");
        product.setImportPrice(new BigDecimal("100.00"));
        product.setSalePrice(new BigDecimal("120.00"));
        product.setWarrantyMonths(12);
        return product;
    }

    private record Fixture(SalesReturn salesReturn, SalesOrder newOrder) {
    }
}
