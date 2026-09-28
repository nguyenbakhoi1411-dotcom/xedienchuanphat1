package com.chuanphat.warranty.common.security;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.entity.Permission;
import com.chuanphat.warranty.auth.entity.Role;
import java.util.LinkedHashSet;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class SalesDataScopeUnitTest {
    private final BranchSecurity branchSecurity = mock(BranchSecurity.class);
    private final SalesDataScope scope = new SalesDataScope(branchSecurity);

    @Test
    void rejectsForgedEmployeeIdInsteadOfSilentlyRewritingIt() {
        AppUser sales = user(102L, "SALES_STAFF");
        when(branchSecurity.currentUser()).thenReturn(sales);

        assertThatThrownBy(() -> scope.requireCurrentActor(101L))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> scope.scopedEmployeeId(101L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void scopesMissingEmployeeFilterToCurrentSalesUser() {
        AppUser sales = user(102L, "SALES_STAFF");
        when(branchSecurity.currentUser()).thenReturn(sales);

        assertThat(scope.scopedEmployeeId(null)).isEqualTo(102L);
    }

    @Test
    void managerKeepsTeamViewButCannotUseEmployeeFilterOrCreateAsAnotherUser() {
        AppUser manager = user(101L, "BRANCH_MANAGER");
        when(branchSecurity.currentUser()).thenReturn(manager);

        assertThat(scope.scopedEmployeeId(null)).isNull();
        assertThatThrownBy(() -> scope.scopedEmployeeId(102L))
                .isInstanceOf(AccessDeniedException.class);
        scope.requireEmployeeAccess(102L);
        assertThatThrownBy(() -> scope.requireCurrentActor(102L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void chiefAccountantMayFilterRevenueByEmployee() {
        AppUser chiefAccountant = user(104L, "CHIEF_ACCOUNTANT");
        when(branchSecurity.currentUser()).thenReturn(chiefAccountant);

        assertThat(scope.scopedEmployeeId(102L)).isEqualTo(102L);
        assertThat(scope.scopedEmployeeId(null)).isNull();
    }

    @Test
    void reportViewAllPermissionMayFilterRevenueByEmployee() {
        AppUser reportingUser = user(110L, "REPORTING_USER");
        reportingUser.getRoles().iterator().next().getPermissions()
                .add(new Permission("REPORT_VIEW_ALL", "REPORT", "VIEW_ALL"));
        when(branchSecurity.currentUser()).thenReturn(reportingUser);

        assertThat(scope.scopedEmployeeId(102L)).isEqualTo(102L);
    }

    private static AppUser user(Long id, String roleCode) {
        AppUser user = withId(new AppUser(), id);
        user.setUsername(roleCode.toLowerCase());
        user.setEmail(roleCode.toLowerCase() + "@example.com");
        user.setFullName(roleCode);
        user.setPasswordHash("{noop}password");
        user.setRoles(new LinkedHashSet<>(java.util.List.of(new Role(roleCode, roleCode))));
        return user;
    }
}
