package com.chuanphat.warranty.accounting;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import com.chuanphat.warranty.accounting.controller.AccountingPeriodController;
import com.chuanphat.warranty.accounting.dto.AccountingPeriodDtos;
import com.chuanphat.warranty.accounting.dto.JournalEntryRequest;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.period.AccountingPeriodLockAspect;
import com.chuanphat.warranty.accounting.period.GuardAccountingPeriod;
import com.chuanphat.warranty.accounting.repository.AccountingPeriodRepository;
import com.chuanphat.warranty.accounting.service.AccountingLedgerService;
import com.chuanphat.warranty.accounting.service.AccountingPeriodService;
import com.chuanphat.warranty.core.service.GoodsIssueService;
import com.chuanphat.warranty.core.service.InventoryService;
import com.chuanphat.warranty.core.service.PayableService;
import com.chuanphat.warranty.core.service.PurchaseOrderService;
import com.chuanphat.warranty.core.service.PurchasePaymentService;
import com.chuanphat.warranty.core.service.PurchaseReceiptService;
import com.chuanphat.warranty.core.service.PurchaseReturnService;
import com.chuanphat.warranty.core.service.SalesExchangeService;
import com.chuanphat.warranty.core.service.SalesService;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.security.access.prepost.PreAuthorize;

class PeriodLockingBusinessTest {

    @Test
    void lockingPeriodPreventsNewSalesOrderWithAccountingDateInLockedPeriod() {
        assertGuarded(SalesService.class, "create");

        AccountingPeriodService periodService = org.mockito.Mockito.mock(AccountingPeriodService.class);
        BeanFactory beanFactory = org.mockito.Mockito.mock(BeanFactory.class);
        LocalDate lockedDate = LocalDate.of(2026, 9, 10);
        doThrow(new IllegalStateException("Kỳ kế toán 9/2026 đã bị khóa, không thể tạo/sửa giao dịch."))
                .when(periodService).assertPeriodNotLocked(lockedDate, 1L);

        DummyTransactions proxy = proxy(periodService, beanFactory);

        assertThatThrownBy(() -> proxy.createSalesOrder(lockedDate, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Kỳ kế toán 9/2026 đã bị khóa");
    }

    @Test
    void lockingPeriodPreventsNewPurchaseOrderWithAccountingDateInLockedPeriod() {
        assertGuarded(PurchaseOrderService.class, "create");
        assertGuarded(PurchaseOrderService.class, "approve");
        assertGuarded(PurchaseOrderService.class, "cancel");
    }

    @Test
    void lockingPeriodPreventsInventoryTransactionWithDateInLockedPeriod() {
        assertGuarded(InventoryService.class, "importStock");
        assertGuarded(InventoryService.class, "exportStock");
        assertGuarded(InventoryService.class, "transfer");
        assertGuarded(InventoryService.class, "recordSale", Long.class, com.chuanphat.warranty.core.entity.Product.class, int.class, String.class);
        assertGuarded(PurchaseReceiptService.class, "confirm");
        assertGuarded(SalesService.class, "deliver");
        assertGuarded(GoodsIssueService.class, "issue");
    }

    @Test
    void lockingPeriodPreventsSalesReturnOrPurchaseReturnInLockedPeriod() {
        assertGuarded(SalesService.class, "createReturn");
        assertGuarded(SalesService.class, "approveReturn");
        assertGuarded(SalesService.class, "rejectReturn");
        assertGuarded(PurchaseReturnService.class, "create");
        assertGuarded(PurchaseReturnService.class, "shipBack");
        assertGuarded(PurchaseReturnService.class, "complete");
    }

    @Test
    void salesExchangeDelegatesThroughGuardedSalesAndReturnFlows() throws NoSuchMethodException {
        assertThat(SalesExchangeService.class.getDeclaredMethod("createExchange", com.chuanphat.warranty.core.dto.CreateSalesExchangeRequest.class)
                        .getAnnotation(GuardAccountingPeriod.class))
                .as("SalesExchangeService coordinates through injected SalesService, not self-invocation")
                .isNull();

        assertGuarded(SalesService.class, "createReturn");
        assertGuarded(SalesService.class, "create");
        assertGuarded(SalesService.class, "addPayment");
    }

    @Test
    void accountingLedgerEntryPointsAreGuardedDirectly() {
        assertGuarded(AccountingLedgerService.class, "createJournalEntry");
        assertGuarded(AccountingLedgerService.class, "postJournalEntry");
        assertGuarded(AccountingLedgerService.class, "cancelJournalEntry");
    }

    @Test
    void lockingPeriodDoesNotBlockReadingReportsForLockedPeriod() {
        List<String> readMethods = List.of("list", "get", "getOrder", "returns", "paymentHistory", "agingReport");
        for (Class<?> type : List.of(SalesService.class, PurchaseOrderService.class, PurchaseReceiptService.class,
                PurchaseReturnService.class, InventoryService.class, PurchasePaymentService.class, PayableService.class)) {
            for (Method method : type.getDeclaredMethods()) {
                if (readMethods.contains(method.getName())) {
                    assertThat(method.getAnnotation(GuardAccountingPeriod.class))
                            .as(type.getSimpleName() + "." + method.getName() + " remains read-only")
                            .isNull();
                }
            }
        }
    }

    @Test
    void unlockingPeriodRequiresReasonAndAdminOrChiefAccountantRole() throws NoSuchMethodException {
        AccountingPeriodService service = new AccountingPeriodService(org.mockito.Mockito.mock(AccountingPeriodRepository.class));

        assertThatThrownBy(() -> service.unlockMonthlyPeriod(2026, 9, "admin", null, " "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Lý do mở khóa");

        Method unlockByMonth = AccountingPeriodController.class.getDeclaredMethod(
                "unlockByMonth", int.class, int.class, AccountingPeriodDtos.LockUnlockRequest.class,
                org.springframework.security.core.userdetails.UserDetails.class);
        assertThat(unlockByMonth.getAnnotation(PreAuthorize.class).value()).contains("ADMIN", "CHIEF_ACCOUNTANT");
    }

    @Test
    void adjustmentEntryForLockedPeriodIsRecordedInCurrentPeriodNotBackdated() {
        JournalEntryRequest request = new JournalEntryRequest(
                LocalDate.of(2026, 10, 5),
                JournalReferenceType.MANUAL,
                "ADJ-2026-09",
                "Adjustment for locked September period",
                2026,
                9,
                List.of(
                        new com.chuanphat.warranty.accounting.dto.JournalEntryLineRequest("111", java.math.BigDecimal.TEN, java.math.BigDecimal.ZERO, "Cash"),
                        new com.chuanphat.warranty.accounting.dto.JournalEntryLineRequest("511", java.math.BigDecimal.ZERO, java.math.BigDecimal.TEN, "Revenue")
                )
        );

        assertThat(request.entryDate()).isEqualTo(LocalDate.of(2026, 10, 5));
        assertThat(request.adjustmentForYear()).isEqualTo(2026);
        assertThat(request.adjustmentForMonth()).isEqualTo(9);
    }

    @Test
    void transactionsInOpenPeriodAreUnaffectedByLockOnDifferentPeriod() {
        AccountingPeriodService periodService = org.mockito.Mockito.mock(AccountingPeriodService.class);
        BeanFactory beanFactory = org.mockito.Mockito.mock(BeanFactory.class);
        DummyTransactions proxy = proxy(periodService, beanFactory);

        assertThatCode(() -> proxy.createSalesOrder(LocalDate.of(2026, 10, 1), 1L)).doesNotThrowAnyException();
        verify(periodService).assertPeriodNotLocked(LocalDate.of(2026, 10, 1), 1L);
    }

    private static void assertGuarded(Class<?> type, String methodName, Class<?>... parameterTypes) {
        Method method = findMethod(type, methodName, parameterTypes);
        assertThat(method.getAnnotation(GuardAccountingPeriod.class))
                .as(type.getSimpleName() + "." + methodName + " is protected by period locking")
                .isNotNull();
    }

    private static Method findMethod(Class<?> type, String methodName, Class<?>... parameterTypes) {
        if (parameterTypes.length > 0) {
            try {
                return type.getDeclaredMethod(methodName, parameterTypes);
            } catch (NoSuchMethodException e) {
                throw new AssertionError(e);
            }
        }
        return java.util.Arrays.stream(type.getDeclaredMethods())
                .filter(method -> method.getName().equals(methodName))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Method not found: " + type.getSimpleName() + "." + methodName));
    }

    private static DummyTransactions proxy(AccountingPeriodService periodService, BeanFactory beanFactory) {
        AspectJProxyFactory factory = new AspectJProxyFactory(new DummyTransactions());
        factory.addAspect(new AccountingPeriodLockAspect(periodService, beanFactory));
        return factory.getProxy();
    }

    static class DummyTransactions {
        @GuardAccountingPeriod(date = "#date", branchId = "#branchId")
        public void createSalesOrder(LocalDate date, Long branchId) {
        }
    }
}
