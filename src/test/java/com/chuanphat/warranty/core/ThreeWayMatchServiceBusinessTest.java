package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.config.ThreeWayMatchingProperties;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.entity.SupplierInvoiceItem;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.SupplierCategory;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.SupplierInvoiceRepository;
import com.chuanphat.warranty.core.service.ThreeWayMatchService;
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
class ThreeWayMatchServiceBusinessTest {

    @Mock SupplierInvoiceRepository invoiceRepository;
    @Mock PurchaseOrderRepository purchaseOrderRepository;
    @Mock PurchaseReceiptRepository receiptRepository;
    @Mock BranchSecurity branchSecurity;

    ThreeWayMatchingProperties properties;
    ThreeWayMatchService service;

    @BeforeEach
    void setUp() {
        properties = new ThreeWayMatchingProperties();
        service = new ThreeWayMatchService(invoiceRepository, purchaseOrderRepository, receiptRepository, branchSecurity, properties);
        lenient().when(invoiceRepository.save(any(SupplierInvoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void matchingInvoiceWithinToleranceMarksStatusMatched() {
        Fixture fixture = matchedFixture(5, "100.00", 5, "101.00");

        var result = service.match(300L);

        assertThat(result.status()).isEqualTo(SupplierInvoiceStatus.MATCHED);
        assertThat(fixture.invoice().getMatchDetails()).isEqualTo("MATCHED");
    }

    @Test
    void invoiceQuantityMismatchSetsHoldForReviewAndBlocksPayment() {
        Fixture fixture = matchedFixture(5, "100.00", 6, "100.00");

        var result = service.match(300L);

        assertThat(result.status()).isEqualTo(SupplierInvoiceStatus.HOLD_FOR_REVIEW);
        assertThat(fixture.invoice().getMatchDetails()).contains("QUANTITY_MISMATCH", "invoiceQty=6", "receivedQty=5");
        when(invoiceRepository.findByPurchaseOrderIdAndStatusIn(200L, List.of(SupplierInvoiceStatus.MATCHED, SupplierInvoiceStatus.RESOLVED)))
                .thenReturn(List.of());
        assertThatThrownBy(() -> service.requireInvoicePayable(200L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("MATCHED/RESOLVED");
    }

    @Test
    void invoiceQuantityLowerThanReceivedAlsoTriggersHoldForReview() {
        Fixture fixture = matchedFixture(5, "100.00", 4, "100.00");

        var result = service.match(300L);

        assertThat(result.status()).isEqualTo(SupplierInvoiceStatus.HOLD_FOR_REVIEW);
        assertThat(fixture.invoice().getMatchDetails()).contains("QUANTITY_MISMATCH", "invoiceQty=4", "receivedQty=5", "delta=-1");
    }

    @Test
    void invoicePriceMismatchAboveToleranceTriggersHoldForReview() {
        Fixture fixture = matchedFixture(5, "100.00", 5, "103.00");

        var result = service.match(300L);

        assertThat(result.status()).isEqualTo(SupplierInvoiceStatus.HOLD_FOR_REVIEW);
        assertThat(fixture.invoice().getMatchDetails()).contains("PRICE_MISMATCH", "allowedDelta=2.000000");
    }

    @Test
    void invoicePriceMismatchWithinToleranceIsAccepted() {
        matchedFixture(5, "100.00", 5, "102.00");

        var result = service.match(300L);

        assertThat(result.status()).isEqualTo(SupplierInvoiceStatus.MATCHED);
    }

    @Test
    void invoiceWithoutAnyCorrespondingReceiptIsFlaggedForReviewImmediately() {
        Fixture fixture = fixture(5, "100.00", 5, "100.00", false, "buyer");

        var result = service.match(300L);

        assertThat(result.status()).isEqualTo(SupplierInvoiceStatus.HOLD_FOR_REVIEW);
        assertThat(fixture.invoice().getMatchDetails()).contains("NO_CONFIRMED_RECEIPT");
    }

    @Test
    void invoiceCreatorCannotResolveOwnMismatch() {
        fixture(5, "100.00", 6, "100.00", true, "invoice-clerk");
        when(branchSecurity.currentUser()).thenReturn(user("invoice-clerk"));

        assertThatThrownBy(() -> service.resolveMismatch(300L, "Da doi chieu chung tu giay"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("khong duoc tu xu ly");
    }

    @Test
    void resolvingMismatchWithoutReasonIsRejected() {
        assertThatThrownBy(() -> service.resolveMismatch(300L, " "))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("khong duoc de trong");
    }

    @Test
    void resolvingMismatchWithValidReasonMovesStatusToResolvedAndUnblocksPayment() {
        Fixture fixture = fixture(5, "100.00", 6, "100.00", true, "invoice-clerk");
        when(branchSecurity.currentUser()).thenReturn(user("chief-accountant"));
        when(invoiceRepository.findByPurchaseOrderIdAndStatusIn(200L, List.of(SupplierInvoiceStatus.MATCHED, SupplierInvoiceStatus.RESOLVED)))
                .thenReturn(List.of(fixture.invoice()));

        var result = service.resolveMismatch(300L, "Ke toan truong chap nhan chenhlech da co bien ban");

        assertThat(result.status()).isEqualTo(SupplierInvoiceStatus.RESOLVED);
        assertThat(result.resolvedBy()).isEqualTo("chief-accountant");
        assertThat(result.resolveReason()).contains("Ke toan truong");
        assertThatCode(() -> service.requireInvoicePayable(200L)).doesNotThrowAnyException();
    }

    @Test
    void matchedInvoiceStatusIsDistinctFromResolvedInvoiceStatusInReporting() {
        Fixture matched = matchedFixture(5, "100.00", 5, "100.00");
        var matchedResult = service.match(300L);
        assertThat(matchedResult.status()).isEqualTo(SupplierInvoiceStatus.MATCHED);

        SupplierInvoice resolved = invoice(301L, matched.purchaseOrder(), supplier(10L), 6, "100.00", "invoice-clerk");
        when(invoiceRepository.findById(301L)).thenReturn(Optional.of(resolved));
        when(branchSecurity.currentUser()).thenReturn(user("chief-accountant"));
        var resolvedResult = service.resolveMismatch(301L, "Chap nhan ngoai le");

        assertThat(resolvedResult.status()).isEqualTo(SupplierInvoiceStatus.RESOLVED);
        assertThat(resolvedResult.status()).isNotEqualTo(matchedResult.status());
    }

    private Fixture matchedFixture(int receivedQuantity, String poUnitPrice, int invoiceQuantity, String invoiceUnitPrice) {
        return fixture(receivedQuantity, poUnitPrice, invoiceQuantity, invoiceUnitPrice, true, "buyer");
    }

    private Fixture fixture(int receivedQuantity,
                            String poUnitPrice,
                            int invoiceQuantity,
                            String invoiceUnitPrice,
                            boolean hasConfirmedReceipt,
                            String invoiceCreator) {
        Supplier supplier = supplier(10L);
        Product product = product(100L);
        PurchaseOrder purchaseOrder = purchaseOrder(supplier, orderItem(product, 5, poUnitPrice));
        SupplierInvoice invoice = invoice(300L, purchaseOrder, supplier, invoiceQuantity, invoiceUnitPrice, invoiceCreator);
        lenient().when(invoiceRepository.findById(300L)).thenReturn(Optional.of(invoice));
        lenient().when(purchaseOrderRepository.findById(200L)).thenReturn(Optional.of(purchaseOrder));
        lenient().when(receiptRepository.existsByPurchaseOrderIdAndStatus(200L, ReceiptStatus.CONFIRMED)).thenReturn(hasConfirmedReceipt);
        lenient().when(receiptRepository.sumConfirmedQuantityByPurchaseOrderIdAndProductId(200L, 100L)).thenReturn((long) receivedQuantity);
        return new Fixture(purchaseOrder, invoice);
    }

    private SupplierInvoice invoice(Long id,
                                    PurchaseOrder purchaseOrder,
                                    Supplier supplier,
                                    int quantity,
                                    String unitPrice,
                                    String createdBy) {
        SupplierInvoice invoice = withId(new SupplierInvoice(), id);
        invoice.setInvoiceNumber("INV-" + id);
        invoice.setPurchaseOrderId(purchaseOrder.getId());
        invoice.setSupplier(supplier);
        invoice.setBranchId(purchaseOrder.getBranchId());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setCreatedBy(createdBy);
        invoice.addItem(invoiceItem(100L, quantity, unitPrice));
        return invoice;
    }

    private SupplierInvoiceItem invoiceItem(Long productId, int quantity, String unitPrice) {
        SupplierInvoiceItem item = new SupplierInvoiceItem();
        item.setProductId(productId);
        item.setQuantity(quantity);
        item.setUnitPrice(new BigDecimal(unitPrice));
        return item;
    }

    private PurchaseOrder purchaseOrder(Supplier supplier, PurchaseOrderItem item) {
        PurchaseOrder order = withId(new PurchaseOrder(), 200L);
        order.setStatus(PurchaseOrderStatus.FULLY_RECEIVED);
        order.setSupplier(supplier);
        order.setBranchId(1L);
        order.addItem(item);
        return order;
    }

    private PurchaseOrderItem orderItem(Product product, int quantity, String unitPrice) {
        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(new BigDecimal(unitPrice));
        item.setLineTotal(new BigDecimal(unitPrice).multiply(BigDecimal.valueOf(quantity)));
        return item;
    }

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

    private Supplier supplier(Long id) {
        return supplier(id, SupplierCategory.OTHER);
    }

    private Supplier supplier(Long id, SupplierCategory category) {
        Supplier supplier = withId(new Supplier(), id);
        supplier.setCode("NCC-" + id);
        supplier.setName("Nha cung cap " + id);
        supplier.setCategory(category);
        return supplier;
    }

    private AppUser user(String username) {
        AppUser user = new AppUser();
        user.setUsername(username);
        return user;
    }

    private record Fixture(PurchaseOrder purchaseOrder, SupplierInvoice invoice) {
    }
}
