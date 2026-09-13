package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.PayablePayRequest;
import com.chuanphat.warranty.core.entity.Payable;
import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.PayableStatus;
import com.chuanphat.warranty.core.repository.PayablePaymentRepository;
import com.chuanphat.warranty.core.repository.PayableRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.core.service.PayableService;
import com.chuanphat.warranty.core.service.SupplierService;
import com.chuanphat.warranty.core.service.ThreeWayMatchService;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PayableServiceBusinessTest {

    @Mock PayableRepository payableRepository;
    @Mock PayablePaymentRepository paymentRepository;
    @Mock SupplierRepository supplierRepository;
    @Mock PurchaseReceiptRepository receiptRepository;
    @Mock SupplierService supplierService;
    @Mock BranchSecurity branchSecurity;
    @Mock ThreeWayMatchService threeWayMatchService;

    PayableService service;

    @BeforeEach
    void setUp() {
        service = new PayableService(
                payableRepository,
                paymentRepository,
                supplierRepository,
                receiptRepository,
                supplierService,
                branchSecurity,
                threeWayMatchService);
    }

    @Test
    void purchaseReceiptPayableCannotBePaidUntilSupplierInvoiceMatchedOrResolved() {
        Payable payable = payableFromPurchaseReceipt();
        PurchaseReceipt receipt = withId(new PurchaseReceipt(), 500L);
        receipt.setPurchaseOrderId(200L);
        when(payableRepository.findWithLockById(100L)).thenReturn(Optional.of(payable));
        when(receiptRepository.findById(500L)).thenReturn(Optional.of(receipt));
        BusinessException mismatch = new BusinessException("Chua co hoa don nha cung cap MATCHED/RESOLVED");
        org.mockito.Mockito.doThrow(mismatch).when(threeWayMatchService).requireInvoicePayable(200L);

        assertThatThrownBy(() -> service.pay(new PayablePayRequest(
                100L,
                new BigDecimal("100.00"),
                LocalDate.now(),
                "BANK_TRANSFER",
                "BANK-REF",
                "Thanh toan NCC")))
                .isSameAs(mismatch);

        verify(payableRepository, never()).save(payable);
        verify(supplierService, never()).decreaseDebt(10L, new BigDecimal("100.00"));
    }

    private Payable payableFromPurchaseReceipt() {
        Supplier supplier = withId(new Supplier(), 10L);
        supplier.setCode("NCC-10");
        supplier.setName("Nha cung cap 10");

        Payable payable = withId(new Payable(), 100L);
        payable.setPayableCode("CN-00100");
        payable.setSupplier(supplier);
        payable.setBranchId(1L);
        payable.setSourceType("PURCHASE_RECEIPT");
        payable.setSourceId(500L);
        payable.setSourceNo("PN-00500");
        payable.setOriginalAmount(new BigDecimal("100.00"));
        payable.setRemainingAmount(new BigDecimal("100.00"));
        payable.setStatus(PayableStatus.OPEN);
        return payable;
    }
}
