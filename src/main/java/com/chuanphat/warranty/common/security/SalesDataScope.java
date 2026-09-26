package com.chuanphat.warranty.common.security;

import com.chuanphat.warranty.auth.entity.AppUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class SalesDataScope {
    private final BranchSecurity branchSecurity;

    public SalesDataScope(BranchSecurity branchSecurity) {
        this.branchSecurity = branchSecurity;
    }

    public Long requireCurrentActor(Long claimedUserId) {
        Long currentUserId = currentUserId();
        if (claimedUserId == null || !currentUserId.equals(claimedUserId)) {
            throw new AccessDeniedException("employeeId must match the authenticated user");
        }
        return currentUserId;
    }

    public Long scopedEmployeeId(Long requestedEmployeeId) {
        AppUser user = branchSecurity.currentUser();
        if (canFilterByEmployee(user)) {
            return requestedEmployeeId;
        }
        if (hasRole(user, "SALES_STAFF")) {
            Long currentUserId = requiredUserId(user);
            if (requestedEmployeeId != null && !currentUserId.equals(requestedEmployeeId)) {
                throw new AccessDeniedException("Cannot access another employee's sales data");
            }
            return currentUserId;
        }
        if (requestedEmployeeId != null) {
            throw new AccessDeniedException("Cannot access another employee's sales data");
        }
        return null;
    }

    public void requireEmployeeAccess(Long employeeId) {
        AppUser user = branchSecurity.currentUser();
        if (hasRole(user, "SALES_STAFF") && !requiredUserId(user).equals(employeeId)) {
            throw new AccessDeniedException("Cannot access another employee's sales data");
        }
    }

    public boolean canFilterByEmployee(AppUser user) {
        return hasRole(user, "ADMIN")
                || hasRole(user, "SUPER_ADMIN")
                || hasRole(user, "CHIEF_ACCOUNTANT")
                || user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .anyMatch(permission -> "REPORT_VIEW_ALL".equals(permission.getCode()));
    }

    private Long currentUserId() {
        return requiredUserId(branchSecurity.currentUser());
    }

    private Long requiredUserId(AppUser user) {
        if (user.getId() == null) {
            throw new AccessDeniedException("Authenticated user has no persistent identity");
        }
        return user.getId();
    }

    private boolean hasRole(AppUser user, String roleCode) {
        return user.getRoles().stream().anyMatch(role -> roleCode.equals(role.getCode()));
    }
}
