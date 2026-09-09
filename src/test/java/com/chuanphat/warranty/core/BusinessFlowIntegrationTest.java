package com.chuanphat.warranty.core;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.core.dto.PurchaseOrderRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderItemRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderRequest;
import com.chuanphat.warranty.core.dto.PaymentEntryRequest;
import com.chuanphat.warranty.core.dto.PurchaseOrderDto;
import com.chuanphat.warranty.core.dto.SalesOrderResponse;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.service.PurchaseOrderService;
import com.chuanphat.warranty.core.service.SalesService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class BusinessFlowIntegrationTest {

    @Autowired
    private SalesService salesService;

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @Test
    @WithMockUser(username = "admin", authorities = {"SALES_CREATE", "SALES_UPDATE", "PURCHASE_CREATE", "PURCHASE_UPDATE", "BRANCH_VIEW", "ACCOUNTING_VIEW", "ACCOUNTING_CREATE", "INVENTORY_VIEW", "INVENTORY_EXPORT"})
    public void testSalesOrderEndToEndFlow() {
        // 1. Create Sales Order
        CreateSalesOrderRequest request = new CreateSalesOrderRequest(
                1L, // branchId
                1L, // customerId
                1L, // employeeId
                LocalDate.now(), // orderDate
                null, // discountAmount
                null, // paidAmount
                null, // paymentMethod
                null, // bankAccountId
                null, // voucherCode
                null, // note
                true, // confirm
                null, // reservationUntil
                false, // issueInvoice
                null, // deliveryStatus
                null, // ecommercePlatform
                null, // shopName
                null, // storeCode
                List.of(
                        new PaymentEntryRequest(PaymentMethod.CASH, BigDecimal.valueOf(10000000), null, LocalDate.now(), null, "Tra truoc")
                ),
                List.of(
                        new CreateSalesOrderItemRequest(1L, 31L, 1, BigDecimal.valueOf(13500000))
                )
        );

        SalesOrderResponse order = salesService.create(request);

        assertThat(order).isNotNull();
        assertThat(order.status()).isEqualTo(SalesOrderStatus.PARTIALLY_PAID);
        assertThat(order.totalAmount()).isEqualByComparingTo("14850000"); // 13.5M + 10% VAT
        assertThat(order.paidAmount()).isEqualByComparingTo("10000000");

        // 2. Deliver Order (deduct stock)
        SalesOrderResponse deliveredOrder = salesService.deliver(order.id());
        assertThat(deliveredOrder.stockIssued()).isTrue();

        // 3. Add remaining payment
        salesService.addPayment(order.id(), new PaymentEntryRequest(
                PaymentMethod.BANK_TRANSFER,
                BigDecimal.valueOf(4850000), // 14850000 - 10000000
                1L, // bankAccountId
                LocalDate.now(),
                "PAY-REMAIN",
                "Thanh toan not"
        ));

        // 4. Verify Final State
        SalesOrderResponse finalOrder = salesService.getOrder(order.id());
        assertThat(finalOrder.paidAmount()).isEqualByComparingTo("14850000");
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"PURCHASE_CREATE", "PURCHASE_UPDATE", "BRANCH_VIEW"})
    public void testPurchaseOrderEndToEndFlow() {
        PurchaseOrderRequest request = new PurchaseOrderRequest(
                1L, // supplierId
                1L, // branchId
                LocalDate.now(),
                LocalDate.now().plusDays(7),
                "DEBT",
                null,
                "admin",
                null,
                "Note",
                List.of(
                        new PurchaseOrderRequest.PurchaseOrderItemRequest(
                                2L, // productId
                                5, // quantity
                                BigDecimal.valueOf(2500000), // unitPrice
                                BigDecimal.ZERO, // discount %
                                BigDecimal.ZERO, // VAT %
                                null, // product name snapshot
                                "Cai", // unit
                                0 // vatRate
                        )
                )
        );

        PurchaseOrderDto po = purchaseOrderService.create(request);
        assertThat(po).isNotNull();
        assertThat(po.totalAmount()).isEqualByComparingTo("12500000");

        // Submit (auto-approves if under threshold)
        PurchaseOrderDto submittedPo = purchaseOrderService.submit(po.id());
        
        // Ensure flow works
        PurchaseOrderDto approvedPo = purchaseOrderService.get(po.id());
        assertThat(approvedPo).isNotNull();
    }
}
