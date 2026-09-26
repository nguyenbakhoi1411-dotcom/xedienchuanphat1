package com.chuanphat.warranty.common.security;

import com.chuanphat.warranty.auth.entity.AppUser;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class SalesDataScope {
    private static final Set<String> TEAM_SCOPE_ROLES = Set.of(
            "ADMIN",
            "SUPER_ADMIN",
            "DIRECTOR",
            "BRANCH_MANAGER",
            "ACCOUNTANT",
            "CHIEF_ACCOUNTANT",
            "AUDITOR"
    );

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
        if (canViewTeamSales(user)) {
            return requestedEmployeeId;
        }
        Long currentUserId = requiredUserId(user);
        if (requestedEmployeeId != null && !currentUserId.equals(requestedEmployeeId)) {
            throw new AccessDeniedException("Cannot access another employee's sales data");
        }
        return currentUserId;
    }

    public void requireEmployeeAccess(Long employeeId) {
        AppUser user = branchSecurity.currentUser();
        if (!canViewTeamSales(user) && !requiredUserId(user).equals(employeeId)) {
            throw new AccessDeniedException("Cannot access another employee's sales data");
        }
    }

    public boolean canViewTeamSales(AppUser user) {
        return branchSecurity.isAdmin(user)
                || user.getRoles().stream().anyMatch(role -> TEAM_SCOPE_ROLES.contains(role.getCode()));
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
}
