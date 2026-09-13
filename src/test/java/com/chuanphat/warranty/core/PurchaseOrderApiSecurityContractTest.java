package com.chuanphat.warranty.core;

import static org.assertj.core.api.Assertions.assertThat;

import com.chuanphat.warranty.core.controller.PurchaseOrderController;
import java.lang.reflect.Method;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

class PurchaseOrderApiSecurityContractTest {

    @Test
    void purchaseOrderApprovalEndpointsRequirePermissions() {
        assertPermission("submit", "hasAuthority('PURCHASE_UPDATE')");
        assertPermission("approve", "hasAuthority('PURCHASE_APPROVE')");
        assertPermission("reject", "hasAuthority('PURCHASE_APPROVE')");
        assertPermission("cancel", "hasAuthority('PURCHASE_CANCEL')");
    }

    private void assertPermission(String methodName, String expectedExpression) {
        Method method = findMethod(PurchaseOrderController.class, methodName);
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertThat(preAuthorize).as(methodName).isNotNull();
        assertThat(preAuthorize.value()).as(methodName).isEqualTo(expectedExpression);
    }

    private Method findMethod(Class<?> type, String name) {
        return List.of(type.getDeclaredMethods()).stream()
                .filter(method -> method.getName().equals(name))
                .findFirst()
                .orElseThrow();
    }
}
