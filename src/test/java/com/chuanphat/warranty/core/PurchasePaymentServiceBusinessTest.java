package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.PurchasePaymentRequest;
import com.chuanphat.warranty.core.entity.PurchasePayment;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoicePaymentStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import com.chuanphat.warranty.core.repository.PurchasePaymentRepository;
import com.chuanphat.warranty.core.repository.SupplierInvoiceRepository;
import com.chuanphat.warranty.core.service.PurchasePaymentService;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PurchasePaymentServiceBusinessTest {

    @Mock SupplierInvoiceRepository invoiceRepository;
    @Mock PurchasePaymentRepository paymentRepository;
    @Mock BranchSecurity branchSecurity;

    PurchasePaymentService service;

    @BeforeEach
    void setUp() {
        service = new PurchasePaymentService(invoiceRepository, paymentRepository, branchSecurity);
        lenient().when(branchSecurity.currentUser()).thenReturn(user("accountant"));
        lenient().when(paymentRepository.save(any(PurchasePayment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(invoiceRepository.save(any(SupplierInvoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void cannotPayInvoiceThatIsOnHoldForReview() {
        SupplierInvoice invoice = invoice(300L, SupplierInvoiceStatus.HOLD_FOR_REVIEW, "100.00");
        when(invoiceRepository.findWithLockById(300L)).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> service.pay(payRequest(300L, "10.00")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("MATCHED/RESOLVED");

        verify(paymentRepository, never()).save(any(PurchasePayment.class));
    }

    @Test
    void partialPaymentsToSupplierAreStoredAsSeparateLedgerRowsNotOverwritten() {
        SupplierInvoice invoice = invoice(300L, SupplierInvoiceStatus.MATCHED, "100.00");
        List<PurchasePayment> savedPayments = new ArrayList<>();
        when(invoiceRepository.findWithLockById(300L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.sumBySupplierInvoiceId(300L)).thenReturn(BigDecimal.ZERO, new BigDecimal("40.00"));
        when(paymentRepository.save(any(PurchasePayment.class))).thenAnswer(invocation -> {
            PurchasePayment payment = invocation.getArgument(0);
            savedPayments.add(payment);
            return payment;
        });

        service.pay(payRequest(300L, "40.00"));
        service.pay(payRequest(300L, "25.00"));

        assertThat(savedPayments).hasSize(2);
        assertThat(savedPayments).extracting(PurchasePayment::getAmount)
                .containsExactly(new BigDecimal("40.00"), new BigDecimal("25.00"));
        assertThat(invoice.getPaidAmount()).isEqualByComparingTo("65.00");
        assertThat(invoice.getPaymentStatus()).isEqualTo(SupplierInvoicePaymentStatus.PARTIALLY_PAID);
    }

    @Test
    void fullPaymentMovesInvoiceStatusToPaid() {
        SupplierInvoice invoice = invoice(300L, SupplierInvoiceStatus.MATCHED, "100.00");
        when(invoiceRepository.findWithLockById(300L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.sumBySupplierInvoiceId(300L)).thenReturn(BigDecimal.ZERO);

        var result = service.pay(payRequest(300L, "100.00"));

        assertThat(result.paymentStatus()).isEqualTo(SupplierInvoicePaymentStatus.PAID);
        assertThat(invoice.getPaymentStatus()).isEqualTo(SupplierInvoicePaymentStatus.PAID);
        assertThat(invoice.getStatus()).isEqualTo(SupplierInvoiceStatus.MATCHED);
    }

    @Test
    void partialPaymentKeepsInvoiceStatusAsPartiallyPaid() {
        SupplierInvoice invoice = invoice(300L, SupplierInvoiceStatus.MATCHED, "100.00");
        when(invoiceRepository.findWithLockById(300L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.sumBySupplierInvoiceId(300L)).thenReturn(BigDecimal.ZERO);

        var result = service.pay(payRequest(300L, "40.00"));

        assertThat(result.paymentStatus()).isEqualTo(SupplierInvoicePaymentStatus.PARTIALLY_PAID);
        assertThat(result.matchStatus()).isEqualTo(SupplierInvoiceStatus.MATCHED);
        assertThat(result.remainingAmount()).isEqualByComparingTo("60.00");
    }

    @Test
    void cannotOverpayInvoiceBeyondTotalInvoiceValue() {
        SupplierInvoice invoice = invoice(300L, SupplierInvoiceStatus.MATCHED, "100.00");
        when(invoiceRepository.findWithLockById(300L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.sumBySupplierInvoiceId(300L)).thenReturn(new BigDecimal("80.00"));

        assertThatThrownBy(() -> service.pay(payRequest(300L, "25.00")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("vuot qua gia tri hoa don");

        verify(paymentRepository, never()).save(any(PurchasePayment.class));
    }

    @Test
    void resolvedInvoiceCanBePaidSameAsMatchedInvoice() {
        SupplierInvoice invoice = invoice(300L, SupplierInvoiceStatus.RESOLVED, "100.00");
        when(invoiceRepository.findWithLockById(300L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.sumBySupplierInvoiceId(300L)).thenReturn(BigDecimal.ZERO);

        var result = service.pay(payRequest(300L, "100.00"));

        assertThat(result.matchStatus()).isEqualTo(SupplierInvoiceStatus.RESOLVED);
        assertThat(result.paymentStatus()).isEqualTo(SupplierInvoicePaymentStatus.PAID);
    }

    @Test
    void payingMultipleInstallmentsAccumulatesCorrectRemainingBalance() {
        SupplierInvoice invoice = invoice(300L, SupplierInvoiceStatus.MATCHED, "100.00");
        when(invoiceRepository.findWithLockById(300L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.sumBySupplierInvoiceId(300L)).thenReturn(BigDecimal.ZERO, new BigDecimal("30.00"));

        service.pay(payRequest(300L, "30.00"));
        var result = service.pay(payRequest(300L, "45.00"));

        assertThat(result.paidAmount()).isEqualByComparingTo("75.00");
        assertThat(result.remainingAmount()).isEqualByComparingTo("25.00");
        assertThat(result.paymentStatus()).isEqualTo(SupplierInvoicePaymentStatus.PARTIALLY_PAID);
    }

    @Test
    void agingReportGroupsPayablesByCorrectDueDateBuckets() {
        Supplier supplier = supplier(10L, "NCC A", 30);
        SupplierInvoice days0To30 = invoice(301L, supplier, SupplierInvoiceStatus.MATCHED, "100.00", LocalDate.now().minusDays(10));
        SupplierInvoice days31To60 = invoice(302L, supplier, SupplierInvoiceStatus.RESOLVED, "200.00", LocalDate.now().minusDays(45));
        SupplierInvoice over60 = invoice(303L, supplier, SupplierInvoiceStatus.MATCHED, "300.00", LocalDate.now().minusDays(75));
        when(branchSecurity.scopedBranchId(null)).thenReturn(null);
        when(invoiceRepository.findByStatusInAndPaymentStatusNot(
                List.of(SupplierInvoiceStatus.MATCHED, SupplierInvoiceStatus.RESOLVED),
                SupplierInvoicePaymentStatus.PAID))
                .thenReturn(List.of(days0To30, days31To60, over60));
        when(invoiceRepository.findByStatusIn(List.of(SupplierInvoiceStatus.HOLD_FOR_REVIEW))).thenReturn(List.of());
        when(paymentRepository.sumBySupplierInvoiceId(301L)).thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumBySupplierInvoiceId(302L)).thenReturn(new BigDecimal("50.00"));
        when(paymentRepository.sumBySupplierInvoiceId(303L)).thenReturn(BigDecimal.ZERO);

        var report = service.agingReport(null);

        assertThat(report).hasSize(1);
        assertThat(report.get(0).days0To30()).isEqualByComparingTo("100.00");
        assertThat(report.get(0).days31To60()).isEqualByComparingTo("150.00");
        assertThat(report.get(0).daysOver60()).isEqualByComparingTo("300.00");
        assertThat(report.get(0).totalConfirmedDebt()).isEqualByComparingTo("550.00");
    }

    @Test
    void agingReportExcludesInvoicesStillOnHoldForReview() {
        Supplier supplier = supplier(10L, "NCC A", 30);
        SupplierInvoice confirmed = invoice(301L, supplier, SupplierInvoiceStatus.MATCHED, "100.00", LocalDate.now().minusDays(10));
        SupplierInvoice hold = invoice(302L, supplier, SupplierInvoiceStatus.HOLD_FOR_REVIEW, "999.00", LocalDate.now().minusDays(10));
        when(branchSecurity.scopedBranchId(null)).thenReturn(null);
        when(invoiceRepository.findByStatusInAndPaymentStatusNot(
                List.of(SupplierInvoiceStatus.MATCHED, SupplierInvoiceStatus.RESOLVED),
                SupplierInvoicePaymentStatus.PAID))
                .thenReturn(List.of(confirmed));
        when(invoiceRepository.findByStatusIn(List.of(SupplierInvoiceStatus.HOLD_FOR_REVIEW))).thenReturn(List.of(hold));
        when(paymentRepository.sumBySupplierInvoiceId(301L)).thenReturn(BigDecimal.ZERO);

        var report = service.agingReport(null);

        assertThat(report).hasSize(1);
        assertThat(report.get(0).totalConfirmedDebt()).isEqualByComparingTo("100.00");
        assertThat(report.get(0).holdForReviewAmount()).isEqualByComparingTo("999.00");
    }

    private PurchasePaymentRequest payRequest(Long supplierInvoiceId, String amount) {
        return new PurchasePaymentRequest(
                supplierInvoiceId,
                new BigDecimal(amount),
                LocalDate.now(),
                PaymentMethod.BANK_TRANSFER,
                "UNC-" + supplierInvoiceId,
                "Thanh toan NCC");
    }

    private SupplierInvoice invoice(Long id, SupplierInvoiceStatus status, String totalAmount) {
        return invoice(id, supplier(10L, "NCC A", 30), status, totalAmount, LocalDate.now());
    }

    private SupplierInvoice invoice(Long id,
                                    Supplier supplier,
                                    SupplierInvoiceStatus status,
                                    String totalAmount,
                                    LocalDate dueDate) {
        SupplierInvoice invoice = withId(new SupplierInvoice(), id);
        invoice.setInvoiceNumber("INV-" + id);
        invoice.setSupplier(supplier);
        invoice.setBranchId(1L);
        invoice.setPurchaseOrderId(200L);
        invoice.setInvoiceDate(LocalDate.now().minusDays(supplier.getDefaultPaymentTermDays()));
        invoice.setDueDate(dueDate);
        invoice.setStatus(status);
        invoice.setPaymentStatus(SupplierInvoicePaymentStatus.UNPAID);
        invoice.setTotalAmount(new BigDecimal(totalAmount));
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setCreatedBy("invoice-clerk");
        return invoice;
    }

    private Supplier supplier(Long id, String name, int paymentTermsDays) {
        Supplier supplier = withId(new Supplier(), id);
        supplier.setCode("NCC-" + id);
        supplier.setName(name);
        supplier.setDefaultPaymentTermDays(paymentTermsDays);
        supplier.setStatus(RecordStatus.ACTIVE);
        return supplier;
    }

    private AppUser user(String username) {
        AppUser user = new AppUser();
        user.setUsername(username);
        return user;
    }
}
