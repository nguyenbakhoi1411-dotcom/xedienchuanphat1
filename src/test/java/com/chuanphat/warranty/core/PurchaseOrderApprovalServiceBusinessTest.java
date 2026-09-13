package com.chuanphat.warranty.core;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Role;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.service.PurchaseOrderService;
import com.chuanphat.warranty.core.service.SupplierService;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderApprovalServiceBusinessTest {

    @Mock PurchaseOrderRepository purchaseOrderRepository;
    @Mock ProductRepository productRepository;
    @Mock SupplierService supplierService;
    @Mock BranchSecurity branchSecurity;

    PurchaseOrderService service;

    @BeforeEach
    void setUp() {
        service = new PurchaseOrderService(purchaseOrderRepository, productRepository, supplierService, branchSecurity);
        lenient().when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void purchaseOrderCreatorCannotApproveOwnOrder() {
        PurchaseOrder order = submittedOrder("PO-SELF", "buyer", "5000000");
        when(purchaseOrderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(branchSecurity.currentUser()).thenReturn(user("buyer", "ADMIN"));

        assertThatThrownBy(() -> service.approve(10L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không được tự duyệt");

        assertThat(order.getStatus()).isEqualTo(PurchaseOrderStatus.SUBMITTED);
    }

    @Test
    void purchaseOrderAboveThresholdRequiresChiefAccountantApproval() {
        PurchaseOrder order = submittedOrder("PO-MID", "buyer", "50000000");
        when(purchaseOrderRepository.findById(11L)).thenReturn(Optional.of(order));

        when(branchSecurity.currentUser()).thenReturn(user("purchase-manager", "PURCHASE_MANAGER"));
        assertThatThrownBy(() -> service.approve(11L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Không đủ thẩm quyền");

        when(branchSecurity.currentUser()).thenReturn(user("chief-accountant", "CHIEF_ACCOUNTANT"));
        var approved = service.approve(11L);

        assertThat(approved.status()).isEqualTo(PurchaseOrderStatus.APPROVED);
        assertThat(order.getApprovedBy()).isEqualTo("chief-accountant");
    }

    @Test
    void purchaseOrderBelowThresholdCanBeApprovedByPurchaseManager() {
        PurchaseOrder order = submittedOrder("PO-LOW", "buyer", "19999999");
        when(purchaseOrderRepository.findById(12L)).thenReturn(Optional.of(order));
        when(branchSecurity.currentUser()).thenReturn(user("purchase-manager", "PURCHASE_MANAGER"));

        var approved = service.approve(12L);

        assertThat(approved.status()).isEqualTo(PurchaseOrderStatus.APPROVED);
        assertThat(order.getApprovedBy()).isEqualTo("purchase-manager");
    }

    @Test
    void purchaseOrderOverOneHundredMillionRequiresAdminApproval() {
        PurchaseOrder order = submittedOrder("PO-HIGH", "buyer", "150000000");
        when(purchaseOrderRepository.findById(14L)).thenReturn(Optional.of(order));

        when(branchSecurity.currentUser()).thenReturn(user("chief-accountant", "CHIEF_ACCOUNTANT"));
        assertThatThrownBy(() -> service.approve(14L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Không đủ thẩm quyền");

        when(branchSecurity.currentUser()).thenReturn(user("admin", "ADMIN"));
        var approved = service.approve(14L);

        assertThat(approved.status()).isEqualTo(PurchaseOrderStatus.APPROVED);
        assertThat(order.getApprovedBy()).isEqualTo("admin");
    }

    @Test
    void rejectedPurchaseOrderCannotBeSubmittedAgainWithoutNewDraft() {
        PurchaseOrder order = order("PO-REJECTED", PurchaseOrderStatus.REJECTED, "buyer", "5000000");
        when(purchaseOrderRepository.findById(13L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.submit(13L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("DRAFT");

        assertThat(order.getStatus()).isEqualTo(PurchaseOrderStatus.REJECTED);
    }

    private PurchaseOrder submittedOrder(String orderNo, String createdBy, String totalAmount) {
        return order(orderNo, PurchaseOrderStatus.SUBMITTED, createdBy, totalAmount);
    }

    private PurchaseOrder order(String orderNo, PurchaseOrderStatus status, String createdBy, String totalAmount) {
        PurchaseOrder order = withId(new PurchaseOrder(), 1L);
        Supplier supplier = withId(new Supplier(), 2L);
        supplier.setCode("NCC-TEST");
        supplier.setName("Nha cung cap test");
        order.setPurchaseOrderNo(orderNo);
        order.setSupplier(supplier);
        order.setBranchId(1L);
        order.setStatus(status);
        order.setPurchaseDate(LocalDate.of(2026, 9, 13));
        order.setCreatedBy(createdBy);
        order.setTotalAmount(new BigDecimal(totalAmount));
        return order;
    }

    private AppUser user(String username, String roleCode) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(username + "@example.test");
        user.setFullName(username);
        user.setPasswordHash("not-used");
        user.setRole(new Role(roleCode, roleCode));
        return user;
    }
}
